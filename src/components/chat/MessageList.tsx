import { useRef, useEffect } from 'react'
import { type Message } from '../../types/chat.types'
import { MessageBubble } from './MessageBubble'
import { MessageSquareDashed } from 'lucide-react'

interface MessageListProps {
    messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-400 p-8 bg-[#0A0A0A]">
                <div className="text-center">
                    <div className="bg-[#333333] p-4 rounded-none inline-block mb-4 border border-[#333333]">
                        <MessageSquareDashed className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-lg font-medium text-white mb-1 font-sans uppercase tracking-wide">System Ready</p>
                    <p className="text-sm text-gray-500 font-mono">Initiate sequence to begin...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto bg-[#0A0A0A]" ref={scrollRef}>
            <div className="flex flex-col pb-4">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
            </div>
        </div>
    )
}
