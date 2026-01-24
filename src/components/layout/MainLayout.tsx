import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useSupabaseRealtime } from '../../hooks/useSupabaseRealtime'
import { toast } from '../../hooks/useToast'

export function MainLayout() {
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
        <div className="flex h-screen bg-bg-light overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0">
                <Header />
                <main className="flex-1 overflow-y-auto scroll-smooth">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
