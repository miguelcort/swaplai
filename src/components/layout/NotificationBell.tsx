import { Bell } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificationStore } from '../../stores/notificationStore'

export function NotificationBell() {
    const { unreadCount, fetchNotifications } = useNotificationStore()
    const navigate = useNavigate()

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    return (
        <button 
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-text-secondary hover:text-text-primary transition-colors rounded-none hover:bg-border"
        >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-none bg-accent-red border border-bg-dark" />
            )}
        </button>
    )
}
