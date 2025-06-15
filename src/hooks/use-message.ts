import { createClient } from '@/lib/client'
import { useEffect, useState } from 'react'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
  chat_id: string
}

export function useMessages(chatId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true })

        if (error) throw error
        setMessages(data || [])
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }
    fetchMessages()
  }, [chatId, supabase])

  const sendMessage = async (content: string) => {
    setLoading(true)
    try {
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

      setMessages((prev) => [...prev, message])

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
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    messages,
    loading,
    sendMessage,
  }
}
