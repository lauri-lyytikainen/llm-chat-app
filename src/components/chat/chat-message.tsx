import { Message } from '@/hooks/use-message'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function ChatMessage({ message }: { message: Message }) {
  return (
    <div className={`flex flex-col  ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
      <div
        className={`markdown overflow-wrap break-words rounded-lg p-2 ${
          message.role === 'user' ? 'bg-primary text-white max-w-[80%] mr-2' : 'bg-background max-w-full w-full'
        } ${message.isError ? 'border border-destructive' : ''} overflow-x-hidden p-4 `}
      >
        <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
      </div>
      <p className="text-xs text-muted-foreground mt-1 p-2 mx-2">{new Date(message.created_at).toLocaleString()}</p>
    </div>
  )
}
