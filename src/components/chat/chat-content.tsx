'use client'

import { useChatContext } from '@/providers/chat-provider'

import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { SendIcon } from 'lucide-react'

export function ChatContent() {
  const { currentChatId } = useChatContext()
  return (
    <div className="flex flex-col w-full max-w-[720px] mx-auto grow">
      <div className="flex flex-col w-full p-2 h-full gap-2">
        <div className="flex flex-col grow gap-2">
          <h1>{currentChatId}</h1>
          {/* <div className="flex justify-end gap-2">
            <div className="bg-accent rounded-lg p-2 max-w-[80%]">Hello</div>
          </div>
          <div className="flex justify-start">
            <div className="bg-primary rounded-lg p-2 max-w-[80%]">Bot message</div>
          </div> */}
        </div>
        <form>
          <div className="flex flex-row w-full relative">
            <div className="relative w-full">
              <Textarea placeholder="Type your message here..." className="resize-none pr-24 w-full" />
              <Button className="rounded-full absolute right-2 bottom-2 w-10 h-10" type="submit">
                <SendIcon />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
