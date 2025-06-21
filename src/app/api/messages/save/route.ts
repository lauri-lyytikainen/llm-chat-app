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

    const { content, role, chatId } = await request.json()

    if (!content || !chatId) {
      return NextResponse.json({ error: 'Content and chat ID are required' }, { status: 400 })
    }

    // Insert user message
    const { error } = await supabase
      .from('messages')
      .insert([
        {
          content,
          role: role,
          chat_id: chatId,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ message: 'Message saved successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
