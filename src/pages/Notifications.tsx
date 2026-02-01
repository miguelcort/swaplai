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
                return <Briefcase className="h-5 w-5 text-[#C9A962]" />
            case 'task':
                return <Calendar className="h-5 w-5 text-[#C9A962]" />
            case 'system':
                return <Info className="h-5 w-5 text-gray-400" />
            default:
                return <Bell className="h-5 w-5 text-gray-500" />
        }
    }

    return (
        <div className="flex flex-col min-h-full bg-[#0A0A0A]">
            <Header title="Notifications" />

            <div className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-[#0A0A0A] border border-[#333333]">
                        <div className="p-4 border-b border-[#333333] bg-[#0A0A0A] flex justify-between items-center">
                            <h2 className="text-lg font-bold text-white font-sans uppercase tracking-wide">All Notifications</h2>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-[#0A0A0A] bg-[#C9A962] px-2 py-1 font-mono font-bold">
                                    {notifications.length} total
                                </span>
                                {notifications.some(n => !n.read) && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-[#C9A962] hover:text-[#b09355] font-mono hover:underline uppercase tracking-wider"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="p-12 text-center border-t border-[#333333]">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-[#C9A962] border-r-transparent"></div>
                                <p className="mt-4 text-gray-400 font-mono text-sm">LOADING SYSTEM...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-12 text-center border-t border-[#333333]">
                                <Bell className="h-12 w-12 text-[#333333] mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-white font-sans uppercase tracking-wide">No notifications</h3>
                                <p className="text-gray-500 font-mono text-sm mt-2">SYSTEM ALL CLEAR</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#333333]">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification.id)}
                                        className={cn(
                                            "group p-4 hover:bg-[#111] transition-colors cursor-pointer flex gap-4 items-start border-l-2",
                                            !notification.read ? "border-l-[#C9A962] bg-[#0F0F0F]" : "border-l-transparent bg-[#0A0A0A]"
                                        )}
                                    >
                                        <div className={cn(
                                            "mt-1 p-2 shrink-0 border border-[#333333]",
                                            !notification.read ? "bg-[#111]" : "bg-[#0A0A0A]"
                                        )}>
                                            {getIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className={cn(
                                                    "text-sm font-bold truncate font-sans uppercase tracking-wide",
                                                    !notification.read ? "text-white" : "text-gray-500"
                                                )}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-xs text-gray-500 whitespace-nowrap shrink-0 font-mono">
                                                    {formatDistanceToNow(new Date(notification.date), { addSuffix: true })}
                                                </span>
                                            </div>
                                            
                                            <p className={cn(
                                                "text-sm mt-1 font-mono leading-relaxed",
                                                !notification.read ? "text-gray-300" : "text-gray-600"
                                            )}>
                                                {notification.description}
                                            </p>

                                            {/* Actions */}
                                            {notification.type === 'invite' && (
                                                <div className="mt-3 flex gap-2">
                                                    <button
                                                        onClick={(e) => handleAcceptInvite(e, notification.id, notification.data.project_id)}
                                                        className="inline-flex items-center px-4 py-2 text-xs font-bold text-[#0A0A0A] bg-[#C9A962] hover:bg-[#b09355] transition-colors uppercase tracking-wider font-mono"
                                                    >
                                                        <Check className="h-3 w-3 mr-2" />
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleRejectInvite(e, notification.id, notification.data.project_id)}
                                                        className="inline-flex items-center px-4 py-2 text-xs font-bold text-red-500 border border-red-900/50 hover:bg-red-900/20 transition-colors uppercase tracking-wider font-mono"
                                                    >
                                                        <X className="h-3 w-3 mr-2" />
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
                                                        className="inline-flex items-center px-4 py-2 text-xs font-bold text-[#C9A962] border border-[#C9A962] hover:bg-[#C9A962] hover:text-[#0A0A0A] transition-colors uppercase tracking-wider font-mono"
                                                    >
                                                        View Project
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-2">
                                            {!notification.read ? (
                                                <div className="h-2 w-2 bg-[#C9A962]" title="Unread"></div>
                                            ) : (
                                                <MailOpen className="h-4 w-4 text-[#333333]" />
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
