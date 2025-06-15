import { createClient } from '@/lib/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(chats)
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: chat, error } = await supabase
      .from('chats')
      .insert([
        {
          user_id: user.id,
          title: 'New Chat',
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(chat)
  } catch (error) {
    console.error('Error creating chat:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatId } = await request.json()

    // Verify that the chat belongs to the user
    const { data: chat, error: chatError } = await supabase.from('chats').select('user_id').eq('id', chatId).single()

    if (chatError || chat.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase.from('chats').delete().eq('id', chatId)

    if (error) throw error

    return NextResponse.json({ message: 'Chat deleted successfully', id: chatId })
  } catch (error) {
    console.error('Error deleting chat:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { chatId, title } = await request.json()

    // Verify that the chat belongs to the user
    const { data: chat, error: chatError } = await supabase.from('chats').select('user_id').eq('id', chatId).single()

    if (chatError || chat.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: updatedChat, error } = await supabase
      .from('chats')
      .update({ title })
      .eq('id', chatId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(updatedChat)
  } catch (error) {
    console.error('Error updating chat:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
