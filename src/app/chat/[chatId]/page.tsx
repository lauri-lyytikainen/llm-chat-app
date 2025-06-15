import { ChatContent } from '@/components/chat/chat-content'
import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'

export default async function Chat() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return <ChatContent />
}
