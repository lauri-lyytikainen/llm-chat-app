import { Message } from '@/hooks/use-message'
import { AlertCircle } from 'lucide-react'

export function ChatMessage({ message }: { message: Message }) {
  return (
    // <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} w-full`}>
    //   <div
    //     className={`rounded-lg p-3 ${message.role === 'user' ? 'max-w-[90%] sm:max-w-[80%]' : 'w-full max-w-full'} ${
    //       message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'
    //     } ${message.isError ? 'border border-destructive' : ''}`}
    //   >
    //     <div className="flex items-start gap-2">
    //       <div className="flex-1 min-w-0">
    //         <p className="break-words whitespace-pre-wrap overflow-hidden">{message.content}</p>
    //         {message.isError && (
    //           <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
    //             <AlertCircle className="w-4 h-4 flex-shrink-0" />
    //             <span>Failed to send message</span>
    //           </div>
    //         )}
    //       </div>
    //     </div>
    //   </div>
    //   <p className="text-xs text-muted-foreground mt-1 px-1">{new Date(message.created_at).toLocaleString()}</p>
    // </div>
    <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
      <div
        className={`overflow-wrap break-words rounded-lg p-3 ${
          message.role === 'user' ? 'max-w-[90%] sm:max-w-[80%]' : ''
        } ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'} ${
          message.isError ? 'border border-destructive' : ''
        }`}
      >
        <p>{message.content}</p>
      </div>
      <p className="text-xs text-muted-foreground mt-1 px-1">{new Date(message.created_at).toLocaleString()}</p>
    </div>
  )
}
