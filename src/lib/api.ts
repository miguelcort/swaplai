import { type Message } from '../types/chat.types'
import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

interface ChatRequest {
    message: string
    conversation_id?: string
    history: Message[]
}

interface ChatResponse {
    role: 'assistant'
    content: string
    conversation_id?: string
}

const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    }
    if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
    }
    return headers
}

export const api = {
    chat: async (payload: ChatRequest): Promise<ChatResponse> => {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/agent/chat`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        return response.json()
    },

    getConversations: async () => {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/agent/conversations`, {
            method: 'GET',
            headers
        })
        if (!response.ok) throw new Error('Failed to fetch conversations')
        return response.json()
    },

    getConversationMessages: async (id: string) => {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/agent/conversations/${id}`, {
            method: 'GET',
            headers
        })
        if (!response.ok) throw new Error('Failed to fetch messages')
        return response.json()
    },

    deleteConversation: async (id: string) => {
        const headers = await getHeaders()
        const response = await fetch(`${API_URL}/agent/conversations/${id}`, {
            method: 'DELETE',
            headers
        })
        if (!response.ok) throw new Error('Failed to delete conversation')
        return response.json()
    }
}
