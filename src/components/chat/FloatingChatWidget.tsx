import { useState, useEffect} from 'react'
import { MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { useChatStore } from '../../stores/chatStore'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { Avatar, AvatarFallback } from '../ui/Avatar'
import { Button } from '../ui/Button'

export function FloatingChatWidget() {
    const navigate = useNavigate()
    const location = useLocation()
    const [isOpen, setIsOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    
    const { 
        messages, 
        sendMessage, 
        activeConversationId, 
        setActiveConversation,
        loadConversations,
        conversations,
        startNewChat
    } = useChatStore()

    // Initialize chat when opening
    useEffect(() => {
        if (isOpen && !activeConversationId && conversations.length === 0) {
            loadConversations().then(() => {
                // If we have conversations, pick the first one, otherwise start new
                // We access the store directly here to get the updated state, 
                // but since we are in useEffect, we can rely on the prop 'conversations' 
                // if we add it to dependency, but that might cause loops.
                // Let's just trigger a check.
            })
        }
    }, [isOpen, loadConversations, activeConversationId, conversations.length])

    // Effect to select most recent conversation if none selected
    useEffect(() => {
        if (isOpen && !activeConversationId && conversations.length > 0) {
            // Pick the most recent one
            setActiveConversation(conversations[0].id)
        } else if (isOpen && !activeConversationId && conversations.length === 0) {
             startNewChat()
        }
    }, [isOpen, conversations, activeConversationId, setActiveConversation, startNewChat])


    const handleSendMessage = async (content: string) => {
        await sendMessage(content)
    }

    const toggleOpen = () => setIsOpen(!isOpen)

    // Don't show if already on chat page
    if (location.pathname.startsWith('/chat')) {
        return null
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {/* Chat Window */}
            <div 
                className={cn(
                    "bg-[#0A0A0A] rounded-none shadow-none flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right border border-[#333333]",
                    isOpen 
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" 
                        : "opacity-0 scale-95 translate-y-4 pointer-events-none",
                    isExpanded 
                        ? "w-[90vw] h-[80vh] md:w-[600px] md:h-[700px]" 
                        : "w-[90vw] h-[500px] md:w-[380px] md:h-[600px]"
                )}
            >
                {/* Header */}
                <div className="bg-[#0A0A0A] border-b border-[#333333] p-4 flex items-center justify-between shrink-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar className="h-10 w-10 border border-[#333333] rounded-none">
                                <AvatarFallback className="bg-black text-white font-bold font-mono rounded-none">AI</AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-none bg-[#1DBF73] shadow-none"></span>
                        </div>
                        <div className="text-white">
                            <h3 className="font-bold text-sm tracking-wide font-sans uppercase">Swaplai Assistant</h3>
                            <p className="text-xs text-gray-400 font-mono">Online & Ready</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-white hover:bg-[#333333] h-8 w-8 rounded-none transition-colors"
                            onClick={() => setIsExpanded(!isExpanded)}
                            title={isExpanded ? "Minimize" : "Maximize"}
                        >
                            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-white hover:bg-[#333333] h-8 w-8 rounded-none transition-colors"
                            onClick={() => navigate('/chat')}
                            title="Open full page"
                        >
                            <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-white hover:bg-[#333333] h-8 w-8 rounded-none transition-colors"
                            onClick={() => setIsOpen(false)}
                            title="Close"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-hidden flex flex-col bg-[#0A0A0A] relative">
                    <MessageList messages={messages} />
                </div>

                {/* Input */}
                <div className="shrink-0 border-t border-[#333333] bg-[#0A0A0A]">
                    <ChatInput onSend={handleSendMessage} />
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleOpen}
                className={cn(
                    "h-14 w-14 rounded-none shadow-none hover:shadow-none border border-[#333333]",
                    "flex items-center justify-center transition-all duration-300 transform hover:translate-y-[-2px]",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ring-offset-black",
                    isOpen 
                        ? "bg-[#333333] text-white rotate-90" 
                        : "bg-primary text-black hover:bg-primary/90"
                )}
                title={isOpen ? "Close Chat" : "Open Chat"}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-7 w-7" />}
            </button>
        </div>
    )
}
