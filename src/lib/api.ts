import { type Message } from '../types/chat.types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

interface ChatRequest {
    message: string
    conversation_id?: string
    history: Message[]
}

interface ChatResponse {
    role: 'assistant'
    content: string
}

export const api = {
    chat: async (payload: ChatRequest): Promise<ChatResponse> => {
        const response = await fetch(`${API_URL}/agent/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        return response.json()
    }
}
