'use client'

import { ChatProvider } from '@/providers/chat-provider'
import { ChatSidebar } from '@/components/chat/chat-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ChatNavbar } from '@/components/chat/chat-navbar'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <SidebarProvider>
        <ChatSidebar />
        <div className="flex flex-col w-full h-screen">
          <ChatNavbar />
          {children}
        </div>
      </SidebarProvider>
    </ChatProvider>
  )
}
