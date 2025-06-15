import { SidebarProvider } from '@/components/ui/sidebar'
import { ChatSidebar } from '@/components/chat/chat-sidebar'
import { ChatContent } from '@/components/chat/chat-content'
import { ChatNavbar } from '@/components/chat/chat-navbar'
import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'

export default async function Chat() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return (
    <SidebarProvider>
      <ChatSidebar />
      <div className="flex flex-col w-full">
        <ChatNavbar />
        <ChatContent />
      </div>
    </SidebarProvider>
  )
}
