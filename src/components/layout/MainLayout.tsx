import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useSupabaseRealtime } from '../../hooks/useSupabaseRealtime'
import { toast } from '../../hooks/useToast'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { FloatingChatWidget } from '../chat/FloatingChatWidget'

export function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Listen for new messages globally
    useSupabaseRealtime({ table: 'messages', event: 'INSERT' }, (payload) => {
        toast({
            title: "New Message",
            description: payload.new?.content ?
                `New message received: ${payload.new.content.substring(0, 30)}...` :
                "You received a new message",
            type: "info"
        })
    })

    return (
        <div className="flex h-screen bg-bg-dark overflow-hidden font-sans">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex flex-col flex-1 min-w-0 relative">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between bg-bg-dark border-b border-border px-4 py-3 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 text-white hover:bg-white/10 rounded-none"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <span className="text-lg font-bold text-white tracking-wide">Swaplai</span>
                    </div>
                </div>
                <main className="flex-1 overflow-y-auto scroll-smooth">
                    <Outlet />
                </main>
                <FloatingChatWidget />
            </div>
        </div>
    )
}
