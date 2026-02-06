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
        loadConversations,
        startNewChat,
        deleteConversation
    } = useChatStore()

    // Load conversations on mount
    useEffect(() => {
        loadConversations()
    }, [loadConversations])

    // Handle URL changes
    useEffect(() => {
        if (id) {
            setActiveConversation(id)
        } else {
            startNewChat()
        }
    }, [id, setActiveConversation, startNewChat])

    const handleSendMessage = async (content: string) => {
        await sendMessage(content)
    }

    const handleNewChat = () => {
        navigate('/chat')
    }

    const handleDeleteConversation = async (id: string) => {
        if (confirm('Are you sure you want to delete this chat?')) {
            await deleteConversation(id)
        }
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
                    onDelete={handleDeleteConversation}
                />

                <div className="flex-1 flex flex-col bg-bg-dark overflow-hidden">
                    <div className="flex-1 overflow-hidden flex flex-col relative">
                        <MessageList messages={messages} />
                    </div>
                    <ChatInput onSend={handleSendMessage} />
                </div>
            </div>
        </div>
    )
}
