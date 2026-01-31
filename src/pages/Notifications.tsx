import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotificationStore } from '../stores/notificationStore'
import { Header } from '../components/layout/Header'
import { formatDistanceToNow } from 'date-fns'
import { 
    Bell, 
    Check, 
    X, 
    Briefcase, 
    Calendar, 
    Info,
    MailOpen
} from 'lucide-react'
import { cn } from '../lib/utils'

export default function Notifications() {
    const { 
        notifications, 
        fetchNotifications, 
        markAsRead, 
        markAllAsRead,
        isLoading,
        acceptInvite,
        rejectInvite 
    } = useNotificationStore()
    
    const navigate = useNavigate()

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    const handleNotificationClick = (id: string) => {
        markAsRead(id)
    }

    const handleAcceptInvite = async (e: React.MouseEvent, notifId: string, projectId: string) => {
        e.stopPropagation()
        await acceptInvite(notifId, projectId)
    }

    const handleRejectInvite = async (e: React.MouseEvent, notifId: string, projectId: string) => {
        e.stopPropagation()
        await rejectInvite(notifId, projectId)
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'invite':
                return <Briefcase className="h-5 w-5 text-blue-500" />
            case 'task':
                return <Calendar className="h-5 w-5 text-emerald-500" />
            case 'system':
                return <Info className="h-5 w-5 text-purple-500" />
            default:
                return <Bell className="h-5 w-5 text-gray-500" />
        }
    }

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <Header title="Notifications" />

            <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h2 className="font-semibold text-gray-900">All Notifications</h2>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                    {notifications.length} total
                                </span>
                                {notifications.some(n => !n.read) && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
                                <p className="mt-4 text-gray-600">Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-12 text-center">
                                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
                                <p className="text-gray-500">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification.id)}
                                        className={cn(
                                            "group p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-4 items-start",
                                            !notification.read ? "bg-blue-50/50" : "bg-white"
                                        )}
                                    >
                                        <div className={cn(
                                            "mt-1 p-2 rounded-full shrink-0",
                                            !notification.read ? "bg-white shadow-sm ring-1 ring-gray-200" : "bg-gray-100"
                                        )}>
                                            {getIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className={cn(
                                                    "text-sm font-medium truncate",
                                                    !notification.read ? "text-gray-900" : "text-gray-600"
                                                )}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                                                    {formatDistanceToNow(new Date(notification.date), { addSuffix: true })}
                                                </span>
                                            </div>
                                            
                                            <p className={cn(
                                                "text-sm mt-1",
                                                !notification.read ? "text-gray-800" : "text-gray-500"
                                            )}>
                                                {notification.description}
                                            </p>

                                            {/* Actions */}
                                            {notification.type === 'invite' && (
                                                <div className="mt-3 flex gap-2">
                                                    <button
                                                        onClick={(e) => handleAcceptInvite(e, notification.id, notification.data.project_id)}
                                                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                                                    >
                                                        <Check className="h-3 w-3 mr-1.5" />
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleRejectInvite(e, notification.id, notification.data.project_id)}
                                                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                                                    >
                                                        <X className="h-3 w-3 mr-1.5" />
                                                        Decline
                                                    </button>
                                                </div>
                                            )}
                                            
                                            {notification.type === 'task' && (
                                                <div className="mt-3">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            navigate(`/projects/${notification.data.project_id}`)
                                                        }}
                                                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-colors"
                                                    >
                                                        View Project
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-2">
                                            {!notification.read ? (
                                                <div className="h-2 w-2 rounded-full bg-blue-500" title="Unread"></div>
                                            ) : (
                                                <MailOpen className="h-4 w-4 text-gray-300" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
