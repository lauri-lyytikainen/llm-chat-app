import { createClient } from '@/lib/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/index.js'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, chatId } = await request.json()

    if (!content || !chatId) {
      return NextResponse.json({ error: 'Content and chat ID are required' }, { status: 400 })
    }

    // Insert user message
    const { error } = await supabase
      .from('messages')
      .insert([
        {
          content,
          role: 'user',
          chat_id: chatId,
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Fetch message history for the chat
    const { data: history, error: historyError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (historyError) throw historyError

    // If this is the first message, trigger async chat rename
    if (history.length === 1) {
      ;(async () => {
        try {
          const openaiForTitle = new OpenAI({
            baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
            apiKey: process.env.GEMINI_API_KEY,
          })
          const titlePrompt: ChatCompletionMessageParam[] = [
            {
              role: 'system',
              content:
                "You are a helpful assistant. Generate a short, descriptive title for this chat based on the user's first message. Respond with only the title.",
            },
            { role: 'user', content: content },
          ]
          const titleCompletion = await openaiForTitle.chat.completions.create({
            messages: titlePrompt,
            model: 'gemini-2.0-flash',
            max_tokens: 32,
            stream: false,
          })
          const newTitle = titleCompletion.choices[0]?.message?.content?.trim()?.replace(/\n/g, '') || 'New Chat'
          // Update the chat title in Supabase
          await supabase.from('chats').update({ title: newTitle }).eq('id', chatId)
        } catch (err) {
          console.error('Failed to auto-rename chat:', err)
        }
      })()
    }

    // Compose messages array for LLM
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: 'You are a helpful assistant.' },
      ...history.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
    ]

    const openai = new OpenAI({
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      apiKey: process.env.GEMINI_API_KEY,
    })

    // Create a ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        const completion = await openai.chat.completions.create({
          messages,
          model: 'gemini-2.0-flash',
          stream: true, // Enable streaming
        })

        for await (const chunk of completion) {
          // chunk.choices[0].delta.content contains the new token
          const token = chunk.choices[0]?.delta?.content || ''
          controller.enqueue(new TextEncoder().encode(token))
        }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
