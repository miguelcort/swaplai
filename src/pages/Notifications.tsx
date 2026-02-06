import { useEffect, useState } from 'react'
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
    MailOpen,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { cn } from '../lib/utils'

const ITEMS_PER_PAGE = 5

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
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    useEffect(() => {
        setCurrentPage(1)
    }, [notifications.length])

    const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE)
    const paginatedNotifications = notifications.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

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
                return <Briefcase className="h-5 w-5 text-primary" />
            case 'task':
                return <Calendar className="h-5 w-5 text-primary" />
            case 'system':
                return <Info className="h-5 w-5 text-text-secondary" />
            default:
                return <Bell className="h-5 w-5 text-text-secondary" />
        }
    }

    return (
        <div className="flex flex-col min-h-full bg-bg-dark">
            <Header title="Notifications" />

            <div className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-bg-dark border border-border">
                        <div className="p-4 border-b border-border bg-bg-dark flex justify-between items-center">
                            <h2 className="text-lg font-bold text-text-primary font-sans uppercase tracking-wide">All Notifications</h2>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-bg-dark bg-primary px-2 py-1 font-mono font-bold">
                                    {notifications.length} total
                                </span>
                                {notifications.some(n => !n.read) && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-primary hover:text-primary/90 font-mono hover:underline uppercase tracking-wider"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="p-12 text-center border-t border-border">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
                                <p className="mt-4 text-text-secondary font-mono text-sm">LOADING SYSTEM...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-12 text-center border-t border-border">
                                <Bell className="h-12 w-12 text-border mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-text-primary font-sans uppercase tracking-wide">No notifications</h3>
                                <p className="text-text-secondary font-mono text-sm mt-2">SYSTEM ALL CLEAR</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {paginatedNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification.id)}
                                        className={cn(
                                            "group p-4 hover:bg-primary/5 transition-colors cursor-pointer flex gap-4 items-start border-l-2",
                                            !notification.read ? "border-l-primary bg-bg-card/50" : "border-l-transparent bg-bg-dark"
                                        )}
                                    >
                                        <div className={cn(
                                            "mt-1 p-2 shrink-0 border border-border",
                                            !notification.read ? "bg-bg-card" : "bg-bg-dark"
                                        )}>
                                            {getIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className={cn(
                                                    "text-sm font-bold truncate font-sans uppercase tracking-wide",
                                                    !notification.read ? "text-text-primary" : "text-text-secondary"
                                                )}>
                                                    {notification.title}
                                                </h3>
                                                <span className="text-xs text-text-secondary whitespace-nowrap shrink-0 font-mono">
                                                    {formatDistanceToNow(new Date(notification.date), { addSuffix: true })}
                                                </span>
                                            </div>
                                            
                                            <p className={cn(
                                                "text-sm mt-1 font-mono leading-relaxed",
                                                !notification.read ? "text-text-primary/80" : "text-text-secondary"
                                            )}>
                                                {notification.description}
                                            </p>

                                            {/* Actions */}
                                            {notification.type === 'invite' && (
                                                <div className="mt-3 flex gap-2">
                                                    <button
                                                        onClick={(e) => handleAcceptInvite(e, notification.id, notification.data.project_id)}
                                                        className="inline-flex items-center px-4 py-2 text-xs font-bold text-bg-dark bg-primary hover:bg-primary/90 transition-colors uppercase tracking-wider font-mono"
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
                                                        className="inline-flex items-center px-4 py-2 text-xs font-bold text-primary border border-primary hover:bg-primary hover:text-bg-dark transition-colors uppercase tracking-wider font-mono"
                                                    >
                                                        View Project
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-2">
                                            {!notification.read ? (
                                                <div className="h-2 w-2 bg-primary" title="Unread"></div>
                                            ) : (
                                                <MailOpen className="h-4 w-4 text-border" />
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="p-4 border-t border-border flex justify-between items-center bg-bg-dark">
                                        <div className="text-xs text-text-secondary font-mono">
                                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, notifications.length)} of {notifications.length}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="p-2 border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                            <div className="flex items-center gap-1 px-2">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={cn(
                                                            "w-8 h-8 flex items-center justify-center text-xs font-mono border transition-colors",
                                                            currentPage === page
                                                                ? "border-primary text-primary bg-primary/10"
                                                                : "border-transparent text-text-secondary hover:text-text-primary"
                                                        )}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="p-2 border border-border text-text-secondary hover:text-text-primary hover:border-text-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
