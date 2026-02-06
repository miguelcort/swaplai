import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'
import { type Conversation } from '../../types/chat.types'

interface ConversationListProps {
    conversations: Conversation[]
    activeId: string | null
    onSelect: (id: string) => void
    onNew: () => void
    onDelete: (id: string) => void
}

export function ConversationList({ conversations, activeId, onSelect, onNew, onDelete }: ConversationListProps) {
    return (
        <div className="w-64 border-r border-border bg-bg-dark flex flex-col h-full hidden lg:flex">
            <div className="p-4 border-b border-border">
                <Button onClick={onNew} className="w-full justify-start gap-2 bg-primary text-bg-dark hover:bg-primary/90 rounded-none font-bold uppercase tracking-wider" variant="default">
                    <Plus className="h-4 w-4" /> New Chat
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-1">
                    {conversations.map(conv => (
                        <div key={conv.id} className="relative group">
                            <button
                                onClick={() => onSelect(conv.id)}
                                className={cn(
                                    "w-full text-left px-3 py-3 rounded-none text-sm transition-colors truncate font-mono pr-10",
                                    activeId === conv.id
                                        ? "bg-bg-card border-l-2 border-primary text-text-primary font-bold"
                                        : "text-text-secondary hover:bg-primary/5 hover:text-text-primary"
                                )}
                            >
                                {conv.title || 'Untitled Conversation'}
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(conv.id)
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 text-text-secondary rounded-none"
                                title="Delete conversation"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
