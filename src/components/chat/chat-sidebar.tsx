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
import { EllipsisIcon, PlusIcon } from 'lucide-react'
import { useChatContext } from '@/providers/chat-provider'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'

export function ChatSidebar() {
  const { chatHook, currentChatId, setCurrentChatId } = useChatContext()
  const { chats, loading, createChat, deleteChat, renameChat } = chatHook

  const handleCreateChat = async () => {
    const newChat = await createChat()
    console.log(newChat)
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
              <SidebarMenuButton
                key={index}
                onClick={() => setCurrentChatId(chat.id)}
                className={`${currentChatId === chat.id ? 'bg-accent' : ''} relative flex justify-between items-center`}
              >
                {chat.title}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <EllipsisIcon className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => renameChat(chat.id, 'New Title')}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        deleteChat(chat.id)
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuButton>
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
