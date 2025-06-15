'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useChats } from '@/hooks/use-chats'

interface ChatContextType {
  chatHook: ReturnType<typeof useChats>
  currentChatId: string | null
  setCurrentChatId: (id: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const chatHook = useChats()

  useEffect(() => {
    // Extract chat ID from URL
    const match = pathname.match(/\/chat\/([^\/]+)/)
    const chatId = match ? match[1] : null

    // If we're on a chat page and have no chats, redirect to /chat
    if (chatId && chatHook.chats.length === 0) {
      router.push('/chat', { scroll: false })
      return
    }

    // Only verify chat exists if we have chats loaded
    if (chatId && chatHook.chats.length > 0) {
      const chatExists = chatHook.chats.some((chat) => chat.id === chatId)
      if (!chatExists) {
        // If the current chat was deleted, redirect to the newest chat
        if (chatHook.chats.length > 0) {
          router.push(`/chat/${chatHook.chats[0].id}`, { scroll: false })
        } else {
          router.push('/chat', { scroll: false })
        }
        return
      }
    }

    setCurrentChatId(chatId)
  }, [pathname, chatHook.chats, router])

  const handleSetCurrentChatId = (id: string) => {
    setCurrentChatId(id)
    router.push(`/chat/${id}`, { scroll: false })
  }

  return (
    <ChatContext.Provider value={{ chatHook, currentChatId, setCurrentChatId: handleSetCurrentChatId }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
