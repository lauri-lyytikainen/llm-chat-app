'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { SendIcon, FileText, Mail, Code, BarChart, Sparkles } from 'lucide-react'
import { useChatAppContext } from '@/providers/chat-app-provider'

export default function ChatPage() {
  const [message, setMessage] = useState('')
  const [templateClicked, setTemplateClicked] = useState(false)
  const { createChat, sendMessageToChat } = useChatAppContext()
  const templates = [
    { label: 'Summarize this article', icon: FileText },
    { label: 'Help me write an email', icon: Mail },
    { label: 'Explain this code', icon: Code },
    { label: 'Generate a report', icon: BarChart },
    { label: 'Brainstorm ideas', icon: Sparkles },
  ]

  const handleTemplate = async (template: string) => {
    setMessage(template)
    setTemplateClicked(true)
    const newChat = await createChat()
    if (newChat) {
      await sendMessageToChat(newChat.id, template)
    }
    setMessage('')
  }

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    if (!message.trim()) return
    const newChat = await createChat()
    if (newChat) {
      await sendMessageToChat(newChat.id, message)
    }
    setMessage('')
  }
  return (
    <div className="flex h-screen w-full justify-center">
      <div className="max-w-[1024px] w-full">
        <div className="flex flex-col w-full h-full justify-center gap-6">
          <h1 className="text-center text-2xl">Start typing to create a chat</h1>
          <div className="px-10 flex justify-center items-center gap-2 flex-wrap">
            {templates.map(({ label, icon: Icon }) => (
              <Button
                key={label}
                variant="outline"
                onClick={() => handleTemplate(label)}
                type="button"
                className="grow flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </div>
          <form className="flex flex-row w-full relative flex-shrink-0 p-4">
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
                disabled={templateClicked}
              />
              <Button
                className="rounded-full absolute right-2 bottom-2 w-10 h-10"
                type="submit"
                disabled={!message.trim() || templateClicked}
              >
                <SendIcon className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
