import { Plus } from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'
import { type Conversation } from '../../types/chat.types'

interface ConversationListProps {
    conversations: Conversation[]
    activeId: string | null
    onSelect: (id: string) => void
    onNew: () => void
}

export function ConversationList({ conversations, activeId, onSelect, onNew }: ConversationListProps) {
    return (
        <div className="w-64 border-r border-[#333333] bg-[#0A0A0A] flex flex-col h-full hidden lg:flex">
            <div className="p-4 border-b border-[#333333]">
                <Button onClick={onNew} className="w-full justify-start gap-2 bg-primary text-black hover:bg-primary/90 rounded-none font-bold uppercase tracking-wider" variant="default">
                    <Plus className="h-4 w-4" /> New Chat
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-1">
                    {conversations.map(conv => (
                        <button
                            key={conv.id}
                            onClick={() => onSelect(conv.id)}
                            className={cn(
                                "w-full text-left px-3 py-3 rounded-none text-sm transition-colors truncate font-mono",
                                activeId === conv.id
                                    ? "bg-[#333333] border-l-2 border-primary text-white font-bold"
                                    : "text-gray-400 hover:bg-[#111] hover:text-white"
                            )}
                        >
                            {conv.title || 'Untitled Conversation'}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
