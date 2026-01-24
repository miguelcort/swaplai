import { useRef, useEffect } from 'react'
import { type Message } from '../../types/chat.types'
import { MessageBubble } from './MessageBubble'

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
            <div className="flex-1 flex items-center justify-center text-gray-400 p-8">
                <div className="text-center">
                    <p className="text-lg font-medium text-gray-500 mb-2">No messages yet</p>
                    <p>Start a conversation to see it here.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto" ref={scrollRef}>
            <div className="flex flex-col pb-4">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
            </div>
        </div>
    )
}
