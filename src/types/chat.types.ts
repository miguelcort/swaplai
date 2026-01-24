export interface Message {
    id: string
    conversation_id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    metadata?: Record<string, any>
    created_at: string
}

export interface Conversation {
    id: string
    user_id: string
    title: string
    is_starred: boolean
    members?: { id: string; name: string; avatar?: string; email: string }[]
    created_at: string
    updated_at: string
}
