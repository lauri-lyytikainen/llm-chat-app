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
import { useChatAppContext } from '@/providers/chat-app-provider'
import { ChatMenuButton } from './chat-menu-button'

export function ChatSidebar() {
  const { chats, loadingChats, createChat, deleteChat, renameChat, currentChatId, setCurrentChatId } =
    useChatAppContext()

  const handleCreateChat = async () => {
    const newChat = await createChat()
    if (newChat) {
      setCurrentChatId(newChat.id)
    }
  }

  // Adapter for ChatMenuButton's onRename signature
  const handleRenameChat = async (chatId: string, newTitle: string) => {
    await renameChat(chatId, newTitle)
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="text-2xl font-bold">Chat</h1>
        <SidebarMenuButton
          onClick={handleCreateChat}
          disabled={loadingChats}
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
                onRename={handleRenameChat}
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
