import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, Settings, Star, LogOut } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar'
import { useAuthStore } from '../../stores/authStore'

export function Sidebar() {
    const location = useLocation()
    const { user, signOut } = useAuthStore()

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
        { icon: MessageSquare, label: 'Chat', href: '/chat' },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ]

    const favorites = [
        { id: 1, title: 'Project Ideation', href: '/chat/1' },
        { id: 2, title: 'Bug Fixing', href: '/chat/2' },
    ]

    // Derived state
    const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Guest"
    const email = user?.email || "No email"
    const initials = name.substring(0, 2).toUpperCase()

    return (
        <aside className="hidden h-screen w-64 flex-col border-r border-border bg-bg-dark text-white md:flex transition-all duration-300">
            <div className="p-6">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-white text-lg">S</span>
                    </div>
                    Swaplai
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-gray-400")} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="mt-8 px-6">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Favorites
                    </h3>
                    <div className="space-y-1">
                        {favorites.map((fav) => (
                            <Link
                                key={fav.id}
                                to={fav.href}
                                className="flex items-center gap-2 rounded-md py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                <Star className="h-3 w-3 text-accent-orange" />
                                <span className="truncate">{fav.title}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10 p-4">
                <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5 cursor-pointer transition-colors max-w-full">
                    <Avatar className="h-9 w-9 border border-white/10 shrink-0">
                        <AvatarImage src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden min-w-0">
                        <p className="truncate text-sm font-medium">{name}</p>
                        <p className="truncate text-xs text-gray-500">{email}</p>
                    </div>
                    <LogOut
                        className="h-4 w-4 text-gray-500 hover:text-white transition-colors shrink-0"
                        onClick={signOut}
                    />
                </div>
            </div>
        </aside>
    )
}
