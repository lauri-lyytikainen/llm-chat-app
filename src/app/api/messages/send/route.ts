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

    // Verify that the chat belongs to the user
    const { data: chat, error: chatError } = await supabase.from('chats').select('user_id').eq('id', chatId).single()

    if (chatError || chat.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Insert user message
    const { data: message, error } = await supabase
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

    const completion = await openai.chat.completions.create({
      messages,
      model: 'gemini-2.0-flash',
    })

    const llmResponse = completion.choices[0].message.content

    // Here you would typically make an API call to your LLM service
    // and then insert the assistant's response
    const { data: assistantMessage, error: assistantError } = await supabase
      .from('messages')
      .insert([
        {
          content: llmResponse,
          role: 'assistant',
          chat_id: chatId,
        },
      ])
      .select()
      .single()

    if (assistantError) throw assistantError

    return NextResponse.json({ message, assistantMessage })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
