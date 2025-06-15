'use client'

import { createClient } from '@/lib/client'
import { useEffect, useState } from 'react'

export interface Chat {
  id: string
  title: string
  created_at: string
  updated_at: string
  user_id: string
}

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true)
      const response = await fetch('/api/chats')
      const data = await response.json()
      if (response.ok) {
        setChats(data)
      }
      setLoading(false)
    }
    fetchChats()
  }, [supabase])

  const createChat = async () => {
    setLoading(true)
    const response = await fetch('/api/chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      setLoading(false)
      throw new Error('Failed to create chat')
    }

    const data = await response.json()
    const updatedChats = [data, ...chats]
    setChats(updatedChats)
    setLoading(false)
    return data
  }

  const deleteChat = async (chatId: string) => {
    setLoading(true)
    const response = await fetch('/api/chats', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatId }),
    })
    if (!response.ok) {
      setLoading(false)
      throw new Error('Failed to delete chat')
    }

    const data = await response.json()
    const updatedChats = chats.filter((chat) => chat.id !== data.id)
    setChats(updatedChats)
    setLoading(false)
    return data
  }

  const renameChat = async (chatId: string, title: string) => {
    setLoading(true)
    const response = await fetch('/api/chats', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatId, title }),
    })
    if (!response.ok) {
      setLoading(false)
      throw new Error('Failed to rename chat')
    }
    const data = await response.json()
    const updatedChats = chats.map((chat) => (chat.id === chatId ? data : chat))
    setChats(updatedChats)
    setLoading(false)
    return data
  }

  return {
    chats,
    loading,
    createChat,
    deleteChat,
    renameChat,
  }
}
