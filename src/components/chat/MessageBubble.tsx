import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '../../lib/utils'
import { type Message } from '../../types/chat.types'
import { Avatar, AvatarFallback } from '../ui/Avatar'
import { User, Sparkles, Copy, RotateCcw, ThumbsUp, ThumbsDown, Check } from 'lucide-react'

interface MessageBubbleProps {
    message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user'
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    // Bot Action Button Component
    const ActionButton = ({ icon: Icon, onClick, label }: { icon: any, onClick?: () => void, label?: string }) => (
        <button 
            onClick={onClick}
            className="p-1 rounded-md text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors duration-200"
            title={label}
        >
            <Icon className="h-4 w-4" />
        </button>
    )

    if (isUser) {
        return (
            <div className="flex w-full justify-end px-4 py-4">
                <div className="flex gap-3 max-w-[80%] flex-row-reverse">
                    <Avatar className="h-8 w-8 mt-1 bg-gray-200 shrink-0">
                        <AvatarFallback>
                            <User className="h-5 w-5 text-gray-500" />
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tr-sm px-5 py-3 text-gray-900 dark:text-gray-100">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex w-full gap-4 px-4 py-6 hover:bg-gray-50/50 transition-colors">
            <Avatar className="h-8 w-8 mt-1 bg-primary/10 shrink-0">
                <AvatarFallback className="bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2 overflow-hidden min-w-0">
                <div className="prose prose-sm dark:prose-invert max-w-none text-text-primary prose-headings:font-semibold prose-a:text-primary hover:prose-a:text-primary-dark prose-code:text-primary-dark prose-pre:bg-gray-800 prose-pre:text-gray-100">
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // Customize code blocks if needed, defaulting to standard styling for now
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>

                {/* Bot Actions */}
                <div className="flex items-center gap-2 mt-2 pt-1">
                    <ActionButton 
                        icon={copied ? Check : Copy} 
                        onClick={handleCopy} 
                        label={copied ? "Copied!" : "Copy text"} 
                    />
                    <ActionButton 
                        icon={RotateCcw} 
                        onClick={() => {}} // Placeholder for retry
                        label="Retry response" 
                    />
                    <div className="h-4 w-px bg-gray-200 mx-1" />
                    <ActionButton 
                        icon={ThumbsUp} 
                        onClick={() => {}} 
                        label="Good response" 
                    />
                    <ActionButton 
                        icon={ThumbsDown} 
                        onClick={() => {}} 
                        label="Bad response" 
                    />
                </div>
            </div>
        </div>
    )
}
