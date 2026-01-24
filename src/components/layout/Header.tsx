import { Bell, Search } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { toast } from '../../hooks/useToast'

export function Header() {
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    const handleNotificationClick = () => {
        toast({
            title: "No new notifications",
            description: "You're all caught up! Check back later.",
            type: "info"
        })
    }

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-bg-light/80 px-6 backdrop-blur-md">
            <div>
                <h1 className="text-lg font-semibold text-text-primary">Welcome back, Miguel! 👋</h1>
                <p className="text-xs text-text-secondary">{today}</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative w-64 hidden sm:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-secondary" />
                    <Input
                        placeholder="Search..."
                        className="pl-9 bg-white border-transparent focus:border-primary shadow-none h-9"
                    />
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-text-secondary hover:text-text-primary"
                    onClick={handleNotificationClick}
                >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent-red ring-2 ring-white"></span>
                </Button>
            </div>
        </header>
    )
}
