import { create } from 'zustand'
import { type Message, type Conversation } from '../types/chat.types'
import { api } from '../lib/api'

interface ChatState {
    conversations: Conversation[]
    activeConversationId: string | null
    messages: Message[]
    isLoading: boolean

    setActiveConversation: (id: string) => void
    addMessage: (message: Message) => void
    setMessages: (messages: Message[]) => void
    setConversations: (conversations: Conversation[]) => void
    sendMessage: (content: string) => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
    conversations: [],
    activeConversationId: null,
    messages: [],
    isLoading: false,

    sendMessage: async (content: string) => {
        const { messages, activeConversationId, addMessage } = get()

        // 1. Add User Message
        const userMsg: Message = {
            id: crypto.randomUUID(),
            conversation_id: activeConversationId || 'new',
            role: 'user',
            content,
            created_at: new Date().toISOString()
        }
        addMessage(userMsg)
        set({ isLoading: true })

        try {
            // 2. Call API
            const response = await api.chat({
                message: content,
                conversation_id: activeConversationId || undefined,
                history: messages
            })

            // 3. Add AI Message
            const aiMsg: Message = {
                id: crypto.randomUUID(),
                conversation_id: activeConversationId || 'new',
                role: 'assistant',
                content: response.content,
                created_at: new Date().toISOString()
            }
            addMessage(aiMsg)
        } catch (error) {
            console.error('Failed to send message:', error)
            // Optionally add error message to chat
        } finally {
            set({ isLoading: false })
        }
    },

    setActiveConversation: (id) => set({ activeConversationId: id }),

    addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

    setMessages: (messages) => set({ messages }),

    setConversations: (conversations) => set({ conversations }),
}))
