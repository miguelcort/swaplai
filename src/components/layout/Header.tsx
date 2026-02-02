import { Search, Plus } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { NotificationBell } from './NotificationBell'
import { Avatar, AvatarFallback } from '../ui/Avatar'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
    title?: string
    onNewClick?: () => void
    newButtonText?: string
    searchPlaceholder?: string
}

export function Header({
    title = "Dashboard",
    onNewClick,
    newButtonText = "New conversation",
    searchPlaceholder = "Search"
}: HeaderProps) {
    const { user } = useAuthStore()
    const navigate = useNavigate()

    const initials = user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() ||
                     user?.email?.substring(0, 2).toUpperCase() || "U"

    return (
        <header className="sticky top-0 z-10 border-b border-[#333333] bg-[#0A0A0A]">
            {/* Mobile & Desktop Header */}
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Left Section */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide font-sans uppercase">{title}</h1>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Search - Hidden on small screens */}
                    <div className="hidden lg:block relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            className="w-full h-10 pl-10 pr-4 text-sm bg-[#0A0A0A] text-white border border-[#333333] rounded-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono placeholder:text-gray-600"
                        />
                    </div>

                    {/* Notifications Bell */}
                    <NotificationBell />

                    {/* New Button */}
                    {onNewClick && (
                        <>
                            {/* Desktop version */}
                            <button
                                onClick={onNewClick}
                                className="hidden sm:flex px-4 py-2 bg-primary text-black text-sm font-bold uppercase tracking-wider rounded-none hover:bg-primary/90 transition-colors items-center gap-2 font-mono"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden md:inline">{newButtonText}</span>
                            </button>

                            {/* Mobile version - Icon only */}
                            <button
                                onClick={onNewClick}
                                className="sm:hidden flex items-center justify-center h-10 w-10 bg-primary text-black rounded-none hover:bg-primary/90 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </>
                    )}

                    {/* Avatar */}
                    <Avatar className="h-8 w-8 cursor-pointer hover:border-primary transition-colors border border-[#333333] rounded-none" onClick={() => navigate('/settings')}>
                        <AvatarFallback className="bg-black text-white font-bold text-xs rounded-none font-mono">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="lg:hidden px-4 pb-3 bg-[#0A0A0A] border-b border-[#333333]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        className="w-full h-10 pl-10 pr-4 text-sm bg-[#0A0A0A] text-white border border-[#333333] rounded-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono placeholder:text-gray-600"
                    />
                </div>
            </div>
        </header>
    )
}
