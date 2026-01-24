import { cn } from '../../lib/utils'
import { type Message } from '../../types/chat.types'
import { Avatar, AvatarFallback } from '../ui/Avatar'
import { User, Sparkles } from 'lucide-react'

interface MessageBubbleProps {
    message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user'

    return (
        <div className={cn("flex w-full gap-4 p-4", isUser ? "bg-white" : "bg-bg-light/50")}>
            <Avatar className={cn("h-8 w-8 mt-1", isUser ? "bg-bg-light" : "bg-primary/10")}>
                {isUser ? (
                    <AvatarFallback><User className="h-5 w-5 text-gray-500" /></AvatarFallback>
                ) : (
                    <AvatarFallback className="bg-primary/10"><Sparkles className="h-5 w-5 text-primary" /></AvatarFallback>
                )}
            </Avatar>

            <div className="flex-1 space-y-2 overflow-hidden">
                <div className="prose prose-sm dark:prose-invert max-w-none text-text-primary">
                    {message.content}
                </div>
            </div>
        </div>
    )
}
