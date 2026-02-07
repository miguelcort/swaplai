import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, Settings, LogOut, ListTree, X, Trophy, Globe } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Avatar, AvatarFallback } from '../ui/Avatar'
import { useAuthStore } from '../../stores/authStore'
import { useProfileStore } from '../../stores/profileStore'
import { useEffect } from 'react'

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, signOut, credits } = useAuthStore()
    const { profile, fetchProfile } = useProfileStore()

    useEffect(() => {
        fetchProfile()
    }, [fetchProfile])

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', id: 'dashboard' },
        { icon: ListTree, label: 'Projects', href: '/projects', id: 'projects' },
        { icon: Globe, label: 'Community', href: '/community', id: 'community' },
        { icon: Trophy, label: 'Journey', href: '/journey', id: 'journey' },
        { icon: MessageSquare, label: 'Conversations', href: '/chat', id: 'conversations' },
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
        if (href === '/dashboard') return location.pathname === '/dashboard'
        return location.pathname.startsWith(href)
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-bg-dark/80 backdrop-blur-sm z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed md:sticky md:top-0 h-screen w-64 md:w-20 flex flex-col border-r border-border bg-bg-dark z-50 transition-transform duration-300",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Logo */}
                <div className="flex h-16 items-center justify-center md:justify-center border-b border-border px-4 md:px-0">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary flex items-center justify-center shadow-none">
                            <span className="text-bg-dark text-xl font-bold tracking-tight font-serif">S</span>
                        </div>
                        <span className="md:hidden text-lg font-bold text-text-primary font-sans tracking-wide uppercase">Swaplai</span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="md:hidden ml-auto text-text-secondary hover:text-text-primary"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-0 p-0 pt-6">
                    {navItems.map((item) => {
                        const active = isActive(item.href)
                        return (
                            <div
                                key={item.id}
                                id={`nav-item-${item.id}`}
                                onClick={() => {
                                    navigate(item.href)
                                    onClose?.()
                                }}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-4 transition-all group relative rounded-none cursor-pointer",
                                    "md:h-16 md:w-full md:justify-center md:px-0",
                                    active
                                        ? "bg-primary/10 text-primary border-l-2 border-primary"
                                        : "text-text-secondary hover:bg-primary/5 hover:text-primary border-l-2 border-transparent"
                                )}
                                title={item.label}
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
                                <span className="md:hidden font-mono text-sm font-bold uppercase tracking-wider">{item.label}</span>
                                {/* Tooltip - Solo desktop */}
                                <span className="hidden md:block absolute left-full ml-0 px-3 py-2 bg-bg-dark text-primary text-xs font-mono uppercase tracking-wider border border-border opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                    {item.label}
                                </span>
                            </div>
                        )
                    })}
                </nav>

                {/* User Profile */}
                <div className="border-t border-border p-0">
                    <div className="relative group">
                        {/* Mobile: Avatar + Name + Logout */}
                        <div className="md:hidden p-4 space-y-4">
                            {/* Profile Info - Clickable to go to settings */}
                            <div 
                                onClick={() => {
                                    navigate('/settings')
                                    onClose?.()
                                }}
                                className="flex items-center gap-3 cursor-pointer"
                            >
                                <Avatar className="h-10 w-10 border border-border rounded-none">
                                    <AvatarFallback className="bg-bg-card text-primary font-mono text-sm rounded-none font-bold">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-text-primary truncate font-sans tracking-wide uppercase">
                                        {fullName}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-text-secondary truncate font-mono">{user?.email}</p>
                                        <span 
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                navigate('/settings?tab=credits')
                                                onClose?.()
                                            }}
                                            className="text-[10px] font-bold text-primary border border-primary px-1.5 py-0.5 uppercase font-mono cursor-pointer hover:bg-primary hover:text-bg-dark transition-colors"
                                        >
                                            {credits} CR
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Logout Button - Full width, clear text */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    signOut()
                                }}
                                className="w-full flex items-center justify-center gap-2 p-2 bg-bg-card hover:bg-border text-text-secondary hover:text-text-primary transition-colors border border-border"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="text-xs font-mono uppercase tracking-wider font-bold">Logout</span>
                            </button>
                        </div>

                        {/* Desktop: Avatar only with hover logout */}
                        <div className="hidden md:flex flex-col items-center gap-0">
                            {/* Credits Badge */}
                            <div 
                                onClick={() => navigate('/settings?tab=credits')}
                                className="flex flex-col items-center justify-center bg-bg-card border-b border-border py-2 px-0 w-full cursor-pointer hover:bg-primary/10 transition-colors"
                            >
                                <span className="text-[9px] uppercase font-bold text-text-secondary font-mono tracking-widest">CR</span>
                                <span className="text-xs font-bold text-primary leading-none font-mono mt-1">{credits}</span>
                            </div>

                            <div className="p-4 w-full flex justify-center hover:bg-primary/5 transition-colors cursor-pointer border-t border-border relative">
                                <Avatar className="h-10 w-10 border border-border rounded-none">
                                    <AvatarFallback className="bg-bg-card text-text-primary font-bold rounded-none font-mono">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                
                                {/* Logout button on hover */}
                                <button
                                    onClick={signOut}
                                    className="absolute left-full bottom-4 ml-0 px-4 py-2 bg-bg-dark text-accent-red text-xs font-mono uppercase tracking-wider border border-border opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity flex items-center gap-2 z-50 whitespace-nowrap hover:bg-border"
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
