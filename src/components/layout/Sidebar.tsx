import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, Settings, Users, LogOut, ListTree, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Avatar, AvatarFallback } from '../ui/Avatar'
import { useAuthStore } from '../../stores/authStore'
import { useProfileStore } from '../../stores/profileStore'
import { useEffect } from 'react'

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
    const location = useLocation()
    const { user, signOut, credits } = useAuthStore()
    const { profile, fetchProfile } = useProfileStore()

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/', id: 'dashboard' },
        { icon: ListTree, label: 'Projects', href: '/projects', id: 'projects' },
        { icon: MessageSquare, label: 'Conversations', href: '/chat', id: 'conversations' },
        { icon: Users, label: 'Team', href: '/team', id: 'team' },
        { icon: Settings, label: 'Settings', href: '/settings', id: 'settings' },
    ]

    // Derived state
    //const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"
    const fullName = profile?.first_name 
        ? `${profile.first_name} ${profile.last_name || ''}`.trim()
        : user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"
    
    const initials = profile?.first_name
        ? profile.first_name.substring(0, 2).toUpperCase()
        : user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() ||
          user?.email?.substring(0, 2).toUpperCase() || "SW"

    const isActive = (href: string) => {
        if (href === '/') return location.pathname === '/'
        return location.pathname.startsWith(href)
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed md:relative h-screen w-64 md:w-20 flex flex-col border-r border-[#333333] bg-[#0A0A0A] z-40 transition-transform duration-300",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Logo */}
                <div className="flex h-16 items-center justify-center md:justify-center border-b border-[#333333] px-4 md:px-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-[#C9A962] flex items-center justify-center shadow-none">
                            <span className="text-[#0A0A0A] text-xl font-bold tracking-tight font-serif">S</span>
                        </div>
                        <span className="md:hidden text-lg font-bold text-white font-sans tracking-wide uppercase">Swaplai</span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="md:hidden ml-auto text-gray-400 hover:text-white"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-0 p-0 pt-6">
                    {navItems.map((item) => {
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.id}
                                to={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-4 transition-all group relative rounded-none",
                                    "md:h-16 md:w-full md:justify-center md:px-0",
                                    active
                                        ? "bg-[#111] text-[#C9A962] border-l-2 border-[#C9A962]"
                                        : "text-gray-500 hover:bg-[#111] hover:text-white border-l-2 border-transparent"
                                )}
                                title={item.label}
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
                                <span className="md:hidden font-mono text-sm font-bold uppercase tracking-wider">{item.label}</span>
                                {/* Tooltip - Solo desktop */}
                                <span className="hidden md:block absolute left-full ml-0 px-3 py-2 bg-[#0A0A0A] text-[#C9A962] text-xs font-mono uppercase tracking-wider border border-[#333333] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

                {/* User Profile */}
                <div className="border-t border-[#333333] p-0">
                    <div className="relative group">
                        {/* Mobile: Avatar + Name + Logout */}
                        <div className="md:hidden flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-[#333333] rounded-none">
                                    <AvatarFallback className="bg-[#111] text-[#C9A962] font-mono text-sm rounded-none font-bold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate font-sans tracking-wide uppercase">
                                        {fullName}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-gray-500 truncate font-mono">{user?.email}</p>
                                        <span className="text-[10px] font-bold text-[#C9A962] border border-[#C9A962] px-1.5 py-0.5 uppercase font-mono">
                                            {credits} CR
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={signOut}
                                className="p-2 text-gray-500 hover:text-white transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Desktop: Avatar only with hover logout */}
                        <div className="hidden md:flex flex-col items-center gap-0">
                            {/* Credits Badge */}
                            <div className="flex flex-col items-center justify-center bg-[#050505] border-b border-[#333333] py-2 px-0 w-full">
                                <span className="text-[9px] uppercase font-bold text-gray-600 font-mono tracking-widest">CR</span>
                                <span className="text-xs font-bold text-[#C9A962] leading-none font-mono mt-1">{credits}</span>
                            </div>

                            <div className="p-4 w-full flex justify-center hover:bg-[#111] transition-colors cursor-pointer border-t border-[#333333] relative">
                                <Avatar className="h-10 w-10 border border-[#333333] rounded-none">
                                    <AvatarFallback className="bg-black text-white font-bold rounded-none font-mono">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                
                                {/* Logout button on hover */}
                                <button
                                    onClick={signOut}
                                    className="absolute left-full bottom-4 ml-0 px-4 py-2 bg-[#0A0A0A] text-red-500 text-xs font-mono uppercase tracking-wider border border-[#333333] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity flex items-center gap-2 z-50 whitespace-nowrap hover:bg-[#111]"
                                >
                                    <LogOut className="h-3 w-3" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}
