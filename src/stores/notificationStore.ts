import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface Notification {
    id: string
    type: 'invite' | 'task' | 'system'
    title: string
    description: string
    date: string
    read: boolean
    data?: any // Store original data (like project_id, task_id)
}

interface NotificationState {
    notifications: Notification[]
    unreadCount: number
    isLoading: boolean
    fetchNotifications: () => Promise<void>
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    acceptInvite: (notificationId: string, projectId: string) => Promise<void>
    rejectInvite: (notificationId: string, projectId: string) => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,

    fetchNotifications: async () => {
        set({ isLoading: true })
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Load read state from localStorage
            const readNotificationIds = JSON.parse(localStorage.getItem('read_notifications') || '[]')

            // 1. Fetch Pending Project Invites
            const { data: invites } = await supabase
                .from('project_members')
                .select(`
                    *,
                    project:projects(name)
                `)
                .eq('user_id', user.id)
                .eq('status', 'pending')

            // 2. Fetch Assigned Tasks (Todo)
            const { data: tasks } = await supabase
                .from('tasks')
                .select(`
                    *,
                    project:projects(name)
                `)
                .eq('assigned_to', user.id)
                .eq('status', 'todo')

            // Transform to Notifications
            const notifs: Notification[] = []

            invites?.forEach((invite: any) => {
                const id = `invite-${invite.id}`
                notifs.push({
                    id,
                    type: 'invite',
                    title: 'Project Invitation',
                    description: `You have been invited to join the project "${invite.project?.name}".`,
                    date: invite.invited_at || new Date().toISOString(),
                    read: readNotificationIds.includes(id),
                    data: {
                        project_id: invite.project_id,
                        invite_id: invite.id
                    }
                })
            })

            tasks?.forEach((task: any) => {
                const id = `task-${task.id}`
                notifs.push({
                    id,
                    type: 'task',
                    title: 'New Task Assigned',
                    description: `You have a new task "${task.title}" in project "${task.project?.name}".`,
                    date: task.created_at || new Date().toISOString(),
                    read: readNotificationIds.includes(id),
                    data: {
                        task_id: task.id,
                        project_id: task.project_id
                    }
                })
            })

            // Mock System Notification
            const sysId = 'sys-1'
            notifs.push({
                id: sysId,
                type: 'system',
                title: 'Welcome to SwaplAI',
                description: 'Welcome to your new workspace! Check out your dashboard to get started.',
                date: new Date().toISOString(),
                read: readNotificationIds.includes(sysId)
            })

            // Sort by date desc
            notifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

            set({ 
                notifications: notifs,
                unreadCount: notifs.filter(n => !n.read).length,
                isLoading: false 
            })
        } catch (error) {
            console.error('Error fetching notifications:', error)
            set({ isLoading: false })
        }
    },

    markAsRead: (id: string) => {
        const { notifications } = get()
        const updatedNotifications = notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
        )
        
        // Update localStorage
        const readNotificationIds = JSON.parse(localStorage.getItem('read_notifications') || '[]')
        if (!readNotificationIds.includes(id)) {
            readNotificationIds.push(id)
            localStorage.setItem('read_notifications', JSON.stringify(readNotificationIds))
        }

        set({
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter(n => !n.read).length
        })
    },

    markAllAsRead: () => {
        const { notifications } = get()
        const updatedNotifications = notifications.map(n => ({ ...n, read: true }))
        
        // Update localStorage
        const readNotificationIds = JSON.parse(localStorage.getItem('read_notifications') || '[]')
        const newIds = notifications.map(n => n.id)
        const combinedIds = Array.from(new Set([...readNotificationIds, ...newIds]))
        
        localStorage.setItem('read_notifications', JSON.stringify(combinedIds))

        set({
            notifications: updatedNotifications,
            unreadCount: 0
        })
    },

    acceptInvite: async (notifId, projectId) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        try {
            const { error } = await supabase
                .from('project_members')
                .update({ status: 'accepted', responded_at: new Date().toISOString() })
                .eq('project_id', projectId)
                .eq('user_id', user.id)

            if (error) throw error

            // Remove notification locally
            set(state => {
                const newNotifs = state.notifications.filter(n => n.id !== notifId)
                return {
                    notifications: newNotifs,
                    unreadCount: newNotifs.filter(n => !n.read).length
                }
            })
        } catch (error) {
            console.error('Error accepting invite:', error)
            throw error
        }
    },

    rejectInvite: async (notifId, projectId) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        try {
            const { error } = await supabase
                .from('project_members')
                .update({ status: 'rejected', responded_at: new Date().toISOString() })
                .eq('project_id', projectId)
                .eq('user_id', user.id)

            if (error) throw error

            // Remove notification locally
            set(state => {
                const newNotifs = state.notifications.filter(n => n.id !== notifId)
                return {
                    notifications: newNotifs,
                    unreadCount: newNotifs.filter(n => !n.read).length
                }
            })
        } catch (error) {
            console.error('Error rejecting invite:', error)
            throw error
        }
    }
}))
