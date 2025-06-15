import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
  } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { EllipsisVertical } from "lucide-react"
  
  export function ChatSidebar() {
    return (
      <Sidebar>
        <SidebarHeader>
            <h1 className="text-2xl font-bold">Chat</h1>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              Chats
            </SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuButton>1</SidebarMenuButton>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenuButton size={"lg"}>
            <Avatar>
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">John Doe</span>
                <span className="text-muted-foreground truncate text-xs">
                  john.doe@example.com
                </span>
            </div>
                <EllipsisVertical className="w-4 h-4" />
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>
    )
  }