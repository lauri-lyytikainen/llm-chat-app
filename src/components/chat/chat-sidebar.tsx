'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { UserButton } from './user-buton'
import { PlusIcon } from 'lucide-react'
import { useChatContext } from '@/providers/chat-provider'
import { ChatMenuButton } from './chat-menu-button'

export function ChatSidebar() {
  const { chatHook, currentChatId, setCurrentChatId } = useChatContext()
  const { chats, loading, createChat, deleteChat, renameChat } = chatHook

  const handleCreateChat = async () => {
    const newChat = await createChat()
    if (newChat) {
      setCurrentChatId(newChat.id)
    }
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="text-2xl font-bold">Chat</h1>
        <SidebarMenuButton
          onClick={handleCreateChat}
          disabled={loading}
          className="flex justify-between items-center bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Create a new chat
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarMenu>
            {chats.map((chat, index) => (
              <ChatMenuButton
                key={index}
                chatId={chat.id}
                title={chat.title}
                isActive={currentChatId === chat.id}
                onSelect={() => setCurrentChatId(chat.id)}
                onRename={renameChat}
                onDelete={deleteChat}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <UserButton />
      </SidebarFooter>
    </Sidebar>
  )
}
