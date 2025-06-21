import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

// Chat and Message interfaces
export interface Chat {
  id: string
  title: string
  created_at: string
  updated_at: string
  user_id: string
}

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
  chat_id: string
  isPending?: boolean
  isError?: boolean
}

interface ChatAppContextType {
  chats: Chat[]
  loadingChats: boolean
  createChat: () => Promise<Chat | undefined>
  deleteChat: (chatId: string) => Promise<Chat>
  renameChat: (chatId: string, title: string) => Promise<Chat>
  currentChatId: string | null
  setCurrentChatId: (id: string) => void
  messages: Message[]
  loadingMessages: boolean
  isTyping: boolean
  sendMessage: (content: string) => Promise<void>
}

const ChatAppContext = createContext<ChatAppContextType | undefined>(undefined)

export function ChatAppProvider({ children }: { children: React.ReactNode }) {
  // Chat state
  const [chats, setChats] = useState<Chat[]>([])
  const [loadingChats, setLoadingChats] = useState(true)
  // Message state
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  // Current chat
  const [currentChatId, setCurrentChatIdState] = useState<string | null>(null)

  const router = useRouter()
  const pathname = usePathname()

  // Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      setLoadingChats(true)
      const response = await fetch('/api/chats')
      const data = await response.json()
      if (response.ok) {
        setChats(data)
      }
      setLoadingChats(false)
    }
    fetchChats()
  }, [])

  // Fetch messages for current chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChatId) {
        setMessages([])
        return
      }
      setLoadingMessages(true)
      const response = await fetch(`/api/messages?chatId=${currentChatId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      } else {
        setMessages([])
      }
      setLoadingMessages(false)
    }
    if (currentChatId) {
      fetchMessages()
    } else {
      setMessages([])
    }
  }, [currentChatId])

  // Handle chatId from URL and chat existence
  useEffect(() => {
    // Extract chat ID from URL
    const match = pathname.match(/\/chat\/([^\/]+)/)
    const chatId = match ? match[1] : null

    if (loadingChats) return

    // If we're on a chat page and have no chats, redirect to /chat
    if (chatId && chats.length === 0) {
      router.push('/chat', { scroll: false })
      return
    }

    // Only verify chat exists if we have chats loaded
    if (chatId && chats.length > 0) {
      const chatExists = chats.some((chat) => chat.id === chatId)
      if (!chatExists) {
        // If the current chat was deleted, redirect to the newest chat
        if (chats.length > 0) {
          router.push(`/chat/${chats[0].id}`, { scroll: false })
        } else {
          router.push('/chat', { scroll: false })
        }
        return
      }
    }
    setCurrentChatIdState(chatId)
  }, [pathname, chats, loadingChats, router])

  // Chat actions
  const createChat = async () => {
    setLoadingChats(true)
    const response = await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) {
      setLoadingChats(false)
      throw new Error('Failed to create chat')
    }
    const data = await response.json()
    const updatedChats = [data, ...chats]
    setChats(updatedChats)
    setLoadingChats(false)
    setCurrentChatId(data.id)
    return data
  }

  const deleteChat = async (chatId: string): Promise<Chat> => {
    setLoadingChats(true)
    const response = await fetch('/api/chats', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId }),
    })
    if (!response.ok) {
      setLoadingChats(false)
      throw new Error('Failed to delete chat')
    }
    const data = await response.json()
    const updatedChats = chats.filter((chat) => chat.id !== data.id)
    setChats(updatedChats)
    setLoadingChats(false)
    // If the deleted chat was the current one, update currentChatId
    if (currentChatId === chatId) {
      if (updatedChats.length > 0) {
        setCurrentChatId(updatedChats[0].id)
      } else {
        setCurrentChatIdState(null)
      }
    }
    return data
  }

  const renameChat = async (chatId: string, title: string): Promise<Chat> => {
    setLoadingChats(true)
    const response = await fetch('/api/chats', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, title }),
    })
    if (!response.ok) {
      setLoadingChats(false)
      throw new Error('Failed to rename chat')
    }
    const data = await response.json()
    const updatedChats = chats.map((chat) => (chat.id === chatId ? data : chat))
    setChats(updatedChats)
    setLoadingChats(false)
    return data
  }

  // Set current chat and update URL
  const setCurrentChatId = (id: string) => {
    setCurrentChatIdState(id)
    router.push(`/chat/${id}`, { scroll: false })
  }

  // Message actions
  const sendMessage = async (content: string): Promise<void> => {
    if (!currentChatId) return
    setLoadingMessages(true)
    setIsTyping(true)
    // Create a temporary user message
    const tempMessageId = crypto.randomUUID()
    const tempMessage: Message = {
      id: tempMessageId,
      content,
      role: 'user',
      created_at: new Date().toISOString(),
      chat_id: currentChatId,
      isPending: true,
    }
    setMessages((prevMessages) => [...prevMessages, tempMessage])

    // Create a temporary assistant message for streaming
    const assistantMessageId = crypto.randomUUID()
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: '',
      role: 'assistant',
      created_at: new Date().toISOString(),
      chat_id: currentChatId,
      isPending: true,
    }
    setMessages((prevMessages) => [...prevMessages, assistantMessage])

    try {
      const response = await fetch(`/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, chatId: currentChatId }),
      })

      if (response.ok && response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let done = false
        let fullContent = ''

        while (!done) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading
          if (value) {
            const chunk = decoder.decode(value)
            fullContent += chunk
            // Update the assistant message as the stream progresses
            setMessages((prevMessages) =>
              prevMessages.map((msg) => (msg.id === assistantMessageId ? { ...msg, content: fullContent } : msg))
            )
          }
        }

        // Mark the assistant message as not pending
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg.id === assistantMessageId ? { ...msg, isPending: false } : msg))
        )
        // Save the assistant message to the chat

        const saveResponse = await fetch('/api/messages/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: fullContent,
            role: 'assistant',
            chatId: currentChatId,
          }),
        })
        if (!saveResponse.ok) {
          throw new Error('Failed to save assistant message')
        }

        // Fetch the real messages from the backend
        const fetchMessages = async () => {
          const response = await fetch(`/api/messages?chatId=${currentChatId}`)
          if (response.ok) {
            const data = await response.json()
            setMessages(data)
          }
        }
        fetchMessages()
      } else {
        // Mark the assistant message as error
        setMessages((prevMessages) =>
          prevMessages.map((msg) => (msg.id === assistantMessageId ? { ...msg, isPending: false, isError: true } : msg))
        )
      }
    } catch {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === assistantMessageId ? { ...msg, isPending: false, isError: true } : msg))
      )
    }
    setLoadingMessages(false)
    setIsTyping(false)
  }

  return (
    <ChatAppContext.Provider
      value={{
        chats,
        loadingChats,
        createChat,
        deleteChat,
        renameChat,
        currentChatId,
        setCurrentChatId,
        messages,
        loadingMessages,
        isTyping,
        sendMessage,
      }}
    >
      {children}
    </ChatAppContext.Provider>
  )
}

export function useChatAppContext() {
  const context = useContext(ChatAppContext)
  if (context === undefined) {
    throw new Error('useChatAppContext must be used within a ChatAppProvider')
  }
  return context
}
