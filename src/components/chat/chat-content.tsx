'use client'

import { useChatAppContext } from '@/providers/chat-app-provider'

import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SendIcon, Loader2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { ChatMessage } from './chat-message'

export function ChatContent() {
  const { currentChatId, messages, loadingMessages, isTyping, sendMessage } = useChatAppContext()
  const [message, setMessage] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    if (!message.trim() || !currentChatId) return
    sendMessage(message)
    setMessage('')
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, isTyping])

  return (
    <div className="flex flex-col w-full max-w-[1024px] mx-auto h-[100svh]">
      <div className="flex flex-col w-full h-[calc(100svh-4rem)] p-2 gap-2">
        <div ref={scrollAreaRef} className="flex-1 min-h-0 overflow-y-auto">
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI is typing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <form onSubmit={handleSendMessage} className="flex flex-row w-full relative flex-shrink-0">
          <div className="relative w-full">
            <Textarea
              placeholder="Type your message here..."
              className="resize-none pr-24 w-full"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  handleSendMessage(e)
                  e.preventDefault()
                }
              }}
              disabled={loadingMessages}
            />
            <Button
              className="rounded-full absolute right-2 bottom-2 w-10 h-10"
              type="submit"
              disabled={loadingMessages || !message.trim()}
            >
              {loadingMessages ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendIcon />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
