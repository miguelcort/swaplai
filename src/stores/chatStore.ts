import { create } from 'zustand'
import { type Message, type Conversation } from '../types/chat.types'
import { api } from '../lib/api'

interface ChatState {
    conversations: Conversation[]
    activeConversationId: string | null
    messages: Message[]
    isLoading: boolean

    setActiveConversation: (id: string | null) => void
    addMessage: (message: Message) => void
    setMessages: (messages: Message[]) => void
    setConversations: (conversations: Conversation[]) => void
    sendMessage: (content: string) => Promise<void>
    
    loadConversations: () => Promise<void>
    loadMessages: (conversationId: string) => Promise<void>
    startNewChat: () => void
    deleteConversation: (id: string) => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
    conversations: [],
    activeConversationId: null,
    messages: [],
    isLoading: false,

    loadConversations: async () => {
        try {
            const conversations = await api.getConversations()
            set({ conversations })
        } catch (error) {
            console.error('Failed to load conversations:', error)
        }
    },

    loadMessages: async (conversationId: string) => {
        set({ isLoading: true, messages: [] })
        try {
            const messages = await api.getConversationMessages(conversationId)
            set({ messages })
        } catch (error) {
            console.error('Failed to load messages:', error)
        } finally {
            set({ isLoading: false })
        }
    },

    setActiveConversation: (id) => {
        set({ activeConversationId: id })
        if (id && id !== 'new') {
            get().loadMessages(id)
        } else {
            set({ messages: [] })
        }
    },

    startNewChat: () => {
        set({ activeConversationId: null, messages: [] })
    },

    deleteConversation: async (id: string) => {
        try {
            await api.deleteConversation(id)
            const { conversations, activeConversationId, startNewChat } = get()
            set({ conversations: conversations.filter(c => c.id !== id) })
            
            if (activeConversationId === id) {
                startNewChat()
            }
        } catch (error) {
            console.error('Failed to delete conversation:', error)
        }
    },

    sendMessage: async (content: string) => {
        const { messages, activeConversationId, addMessage, loadConversations } = get()

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
                conversation_id: response.conversation_id || activeConversationId || 'new',
                role: 'assistant',
                content: response.content,
                created_at: new Date().toISOString()
            }
            addMessage(aiMsg)
            
            // 4. Update conversation ID if it was new
            if (!activeConversationId && response.conversation_id) {
                set({ activeConversationId: response.conversation_id })
                // Refresh conversations list to show the new one
                loadConversations()
            }
        } catch (error) {
            console.error('Failed to send message:', error)
            // Optionally add error message to chat
        } finally {
            set({ isLoading: false })
        }
    },

    addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),

    setMessages: (messages) => set({ messages }),

    setConversations: (conversations) => set({ conversations }),
}))
