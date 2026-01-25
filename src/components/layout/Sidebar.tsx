import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, Settings, Users, FileText, LogOut, Menu, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar'
import { useAuthStore } from '../../stores/authStore'
import { useState } from 'react'

export function Sidebar() {
    const location = useLocation()
    const { user, signOut } = useAuthStore()
    const [isOpen, setIsOpen] = useState(false)

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/', id: 'dashboard' },
        { icon: MessageSquare, label: 'Conversations', href: '/chat', id: 'conversations' },
        { icon: FileText, label: 'Documents', href: '/documents', id: 'documents' },
        { icon: Users, label: 'Team', href: '/team', id: 'team' },
        { icon: Settings, label: 'Settings', href: '/settings', id: 'settings' },
    ]

    // Derived state
    const initials = user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() ||
                     user?.email?.substring(0, 2).toUpperCase() || "SW"

    const isActive = (href: string) => {
        if (href === '/') return location.pathname === '/'
        return location.pathname.startsWith(href)
    }

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-50 h-10 w-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed md:relative h-screen w-64 md:w-20 flex flex-col border-r border-gray-200 bg-white z-40 transition-transform duration-300",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
            {/* Logo */}
            <div className="flex h-16 items-center justify-center md:justify-center border-b border-gray-200 px-4 md:px-0">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
                    <span className="text-white text-lg font-bold">S</span>
                </div>
                <span className="md:hidden ml-3 text-lg font-bold text-gray-900">Swaplai</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-3 pt-6">
                {navItems.map((item) => {
                    const active = isActive(item.href)
                    return (
                        <Link
                            key={item.id}
                            to={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-3 transition-all group relative",
                                "md:h-12 md:w-12 md:justify-center md:px-0",
                                active
                                    ? "bg-indigo-50 text-indigo-600"
                                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
                            )}
                            title={item.label}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            <span className="md:hidden font-medium">{item.label}</span>
                            {/* Tooltip - Solo desktop */}
                            <span className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </nav>

            {/* User Profile */}
            <div className="border-t border-gray-200 p-3">
                <div className="relative group">
                    {/* Mobile: Avatar + Name + Logout */}
                    <div className="md:hidden flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-gray-100">
                                <AvatarImage src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"} />
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold text-sm">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={signOut}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Desktop: Avatar only with hover logout */}
                    <div className="hidden md:block">
                        <Avatar className="h-12 w-12 cursor-pointer border-2 border-gray-100 hover:border-indigo-200 transition-colors">
                            <AvatarImage src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        {/* Logout button on hover */}
                        <button
                            onClick={signOut}
                            className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity flex items-center gap-2"
                        >
                            <LogOut className="h-3 w-3" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </aside>
        </>
    )
}
