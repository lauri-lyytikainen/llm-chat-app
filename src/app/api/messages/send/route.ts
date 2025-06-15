import { createClient } from '@/lib/server'
import { NextResponse } from 'next/server'

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

    // Here you would typically make an API call to your LLM service
    // and then insert the assistant's response
    const { data: assistantMessage, error: assistantError } = await supabase
      .from('messages')
      .insert([
        {
          content: 'This is a placeholder response. Replace with actual LLM response.',
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
