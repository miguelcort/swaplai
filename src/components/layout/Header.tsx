import { Search, Plus } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar'

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
    const initials = user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() ||
                     user?.email?.substring(0, 2).toUpperCase() || "U"

    return (
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
            {/* Mobile & Desktop Header */}
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Left Section */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{title}</h1>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Search - Hidden on small screens */}
                    <div className="hidden lg:block relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            className="w-full h-10 pl-10 pr-4 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        />
                    </div>

                    {/* New Button */}
                    {onNewClick && (
                        <>
                            {/* Desktop version */}
                            <button
                                onClick={onNewClick}
                                className="hidden sm:flex px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden md:inline">{newButtonText}</span>
                            </button>

                            {/* Mobile version - Icon only */}
                            <button
                                onClick={onNewClick}
                                className="sm:hidden flex items-center justify-center h-10 w-10 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </>
                    )}

                    {/* Avatar */}
                    <Avatar className="h-8 w-8 border-2 border-gray-100">
                        <AvatarImage src={user?.user_metadata?.avatar_url || "https://github.com/shadcn.png"} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold text-xs">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </div>

            {/* Mobile Search Bar */}
            <div className="lg:hidden px-4 pb-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        className="w-full h-10 pl-10 pr-4 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                </div>
            </div>
        </header>
    )
}
