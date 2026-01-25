import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import { useChatStore } from '../stores/chatStore'
import { MessageList } from '../components/chat/MessageList'
import { ChatInput } from '../components/chat/ChatInput'
import { ConversationList } from '../components/chat/ConversationList'
import { Header } from '../components/layout/Header'

export default function Chat() {
    const { id } = useParams()
    const navigate = useNavigate()

    const {
        messages,
        sendMessage,
        activeConversationId,
        setActiveConversation,
        conversations,
        setConversations
    } = useChatStore()

    // Mock initial data
    useEffect(() => {
        // Add some dummy conversations if empty
        if (conversations.length === 0) {
            setConversations([
                { id: '1', user_id: '1', title: 'Project Brainstorming', is_starred: true, created_at: '', updated_at: '' },
                { id: '2', user_id: '1', title: 'Debug Session #24', is_starred: false, created_at: '', updated_at: '' },
            ])
        }
    }, [conversations.length, setConversations])

    useEffect(() => {
        if (id) {
            setActiveConversation(id)
        }
    }, [id, setActiveConversation])

    const handleSendMessage = async (content: string) => {
        await sendMessage(content)
    }

    const handleNewChat = () => {
        navigate('/chat')
        setActiveConversation('new')
        // Clear messages or handle new state
    }

    const activeConversation = conversations.find(c => c.id === activeConversationId)

    return (
        <div className="flex flex-col h-full">
            <Header
                title={activeConversation?.title || "Chat"}
                onNewClick={handleNewChat}
                newButtonText="New chat"
                searchPlaceholder="Search messages..."
            />

            <div className="flex flex-1 overflow-hidden">
                <ConversationList
                    conversations={conversations}
                    activeId={activeConversationId}
                    onSelect={(cid) => navigate(`/chat/${cid}`)}
                    onNew={handleNewChat}
                />

                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                    <div className="flex-1 overflow-hidden flex flex-col relative">
                        <MessageList messages={messages} />
                    </div>
                    <ChatInput onSend={handleSendMessage} />
                </div>
            </div>
        </div>
    )
}

