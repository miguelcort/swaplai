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
            className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
        >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white" />
            )}
        </button>
    )
}
