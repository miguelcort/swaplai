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
        <div className="w-64 border-r border-border bg-gray-50/50 flex flex-col h-full hidden lg:flex">
            <div className="p-4 border-b border-border/50">
                <Button onClick={onNew} className="w-full justify-start gap-2" variant="outline">
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
                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate",
                                activeId === conv.id
                                    ? "bg-white shadow-sm border border-border font-medium text-primary"
                                    : "text-gray-600 hover:bg-black/5 hover:text-gray-900"
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
