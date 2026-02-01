import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { type Message } from '../../types/chat.types'
import { Avatar, AvatarFallback } from '../ui/Avatar'
import { Sparkles, Copy, RotateCcw, ThumbsUp, ThumbsDown, Check } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

interface MessageBubbleProps {
    message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user'
    const [copied, setCopied] = useState(false)
    const { user } = useAuthStore()
    
    const initials = user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || 
                     user?.email?.substring(0, 2).toUpperCase() || "U"

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
            className="p-1 rounded-none text-gray-500 hover:text-primary hover:bg-[#333333] transition-colors duration-200"
            title={label}
        >
            <Icon className="h-4 w-4" />
        </button>
    )

    if (isUser) {
        return (
            <div className="flex w-full justify-end px-4 py-4">
                <div className="flex gap-3 max-w-[85%] flex-row-reverse">
                    <Avatar className="h-8 w-8 mt-1 border border-[#333333] shadow-none shrink-0 rounded-none bg-[#0A0A0A]">
                        <AvatarFallback className="bg-black text-white font-mono rounded-none font-bold text-xs">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className="bg-[#333333] rounded-none px-5 py-3 text-white border border-[#333333]">
                        <p className="whitespace-pre-wrap leading-relaxed font-mono text-sm">{message.content}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex w-full gap-4 px-4 py-6 hover:bg-[#111111] transition-colors group border-b border-[#333333]/50">
            <Avatar className="h-8 w-8 mt-1 border border-primary/30 bg-[#0A0A0A] shrink-0 shadow-none rounded-none">
                <AvatarFallback className="bg-[#0A0A0A] rounded-none">
                    <Sparkles className="h-4 w-4 text-primary" />
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2 overflow-hidden min-w-0">
                <div className="prose prose-sm prose-invert max-w-none text-gray-300 prose-headings:font-bold prose-headings:text-white prose-a:text-primary hover:prose-a:text-primary/80 prose-code:text-primary prose-pre:bg-[#111111] prose-pre:text-gray-300 prose-strong:text-white font-sans">
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>

                {/* Bot Actions */}
                <div className="flex items-center gap-2 mt-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    <div className="h-4 w-px bg-[#333333] mx-1" />
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
