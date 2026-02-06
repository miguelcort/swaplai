import { supabase } from './supabase'
import type {
    Project,
    CreateProjectInput,
    InviteTeamMemberInput,
    Task,
    CreateTaskInput,
    UpdateTaskInput,
    Payment,
    ProjectMember
} from '../types/projects'

// Projects API
export const projectsApi = {
    // Get all projects for current user
    async getProjects(): Promise<Project[]> {
        const { data, error } = await supabase
            .from('projects')
            .select(`
        *,
        members:project_members(
            *,
            profiles:profiles!project_members_user_id_profiles_fk(*)
        )
      `)
            .order('updated_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Get single project by ID
    async getProject(id: string): Promise<Project> {
        const { data, error } = await supabase
            .from('projects')
            .select(`
        *,
        members:project_members(
            *,
            profiles:profiles!project_members_user_id_profiles_fk(*)
        ),
        tasks(
            *,
            assignee:profiles!tasks_assigned_to_profiles_fk(*)
        )
      `)
            .eq('id', id)
            .single()

        if (error) throw error
        return data
    },

    // Create new project
    async createProject(input: CreateProjectInput): Promise<Project> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('projects')
            .insert({
                owner_id: user.id,
                name: input.name,
                description: input.description,
                budget: input.budget || 0,
                due_date: input.due_date || null
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Update project
    async updateProject(id: string, updates: Partial<CreateProjectInput>): Promise<Project> {
        const cleanUpdates = { ...updates }
        if (cleanUpdates.due_date === '') {
            cleanUpdates.due_date = null
        }

        const { data, error } = await supabase
            .from('projects')
            .update(cleanUpdates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Delete project
    async deleteProject(id: string): Promise<void> {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)

        if (error) throw error
    },

    // Invite team member
    async inviteTeamMember(projectId: string, input: InviteTeamMemberInput): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
        
        const response = await fetch(`${API_URL}/projects/invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: input.email,
                project_id: projectId,
                role: input.role,
                invited_by: user.id
            }),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.detail || 'Failed to invite member')
        }
    },

    // Generate tasks using AI
    async generateTasks(projectId: string): Promise<any[]> {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
        
        const response = await fetch(`${API_URL}/projects/${projectId}/generate-tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.detail || 'Failed to generate tasks')
        }

        const data = await response.json()
        return data.tasks
    },

    // Get task advice
    async getTaskAdvice(title: string, description: string): Promise<string> {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
        
        const response = await fetch(`${API_URL}/projects/task-advice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description })
        })

        if (!response.ok) {
            throw new Error('Failed to get task advice')
        }

        const data = await response.json()
        return data.advice
    },

    // Get user credits and streak
    async getUserCredits(): Promise<{ amount: number, global_streak: number }> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('user_credits')
            .select('amount, global_streak')
            .eq('user_id', user.id)
            .single()

        if (error) {
            // Fallback if table/column doesn't exist yet (for dev robustness)
            console.warn('Error fetching credits:', error)
            return { amount: 100, global_streak: 0 }
        }
        return { amount: data.amount, global_streak: data.global_streak || 0 }
    },

    // Check and trigger daily login reward
    async checkDailyLogin(): Promise<{ success: boolean, message?: string, streak?: number }> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false }

        try {
            const { data, error } = await supabase.rpc('handle_daily_login', {
                user_id_input: user.id
            })
            if (error) throw error
            return data
        } catch (e: any) {
            // Silently fail if function doesn't exist (migration not run yet)
            if (e.code === 'PGRST202' || e.message?.includes('Could not find the function')) {
                console.warn('Daily login reward skipped: Database function handle_daily_login missing. Run migration 005_journey_update.sql')
                return { success: false }
            }
            console.error('Daily login RPC failed:', e)
            return { success: false }
        }
    },

    // Trigger project completion reward
    async rewardProjectCompletion(): Promise<{ success: boolean, added?: number }> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false }

        try {
            const { data, error } = await supabase.rpc('handle_project_completion', {
                user_id_input: user.id
            })
            if (error) throw error
            return data
        } catch (e: any) {
             // Silently fail if function doesn't exist (migration not run yet)
             if (e.code === 'PGRST202' || e.message?.includes('Could not find the function')) {
                console.warn('Project reward skipped: Database function handle_project_completion missing. Run migration 005_journey_update.sql')
                return { success: false }
            }
            console.error('Project completion RPC failed:', e)
            return { success: false }
        }
    },

    // Update global streak (Legacy/Fallback - keep for now but mark deprecated)
    async updateGlobalStreak(isCompletion: boolean): Promise<any> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')
            
        // Try calling the RPC first
        try {
            const { data, error } = await supabase.rpc('update_global_task_completion', {
                user_id_input: user.id,
                is_completion: isCompletion
            })
            if (!error) return data
        } catch (e) {
            console.log('RPC update_global_task_completion not available, using fallback logic')
        }

        // Fallback: Client-side update (Not secure for prod, but good for prototype)
        // 1. Get current stats
        const current = await this.getUserCredits()
        let newStreak = current.global_streak
        let newAmount = current.amount
        
        if (isCompletion) {
            newStreak += 1
            if (newStreak % 10 === 0) {
                newAmount += 1
            }
        } else {
            newStreak = 0
            newAmount = Math.max(0, newAmount - 1)
        }

        // 2. Update
        const { error } = await supabase
            .from('user_credits')
            .update({ 
                amount: newAmount, 
                // global_streak: newStreak // This will fail if column doesn't exist
            }) 
            .eq('user_id', user.id)
            .select()
            .single()
            
        if (error) throw error
        return { streak: newStreak, credits_change: newAmount - current.amount }
    },


    // Accept invitation
    async acceptInvitation(memberId: string): Promise<void> {
        const { error } = await supabase
            .from('project_members')
            .update({
                status: 'accepted',
                responded_at: new Date().toISOString()
            })
            .eq('id', memberId)

        if (error) throw error
    },

    // Reject invitation
    async rejectInvitation(memberId: string): Promise<void> {
        const { error } = await supabase
            .from('project_members')
            .update({
                status: 'rejected',
                responded_at: new Date().toISOString()
            })
            .eq('id', memberId)

        if (error) throw error
    },

    // Remove team member
    async removeMember(memberId: string): Promise<void> {
        const { error } = await supabase
            .from('project_members')
            .delete()
            .eq('id', memberId)

        if (error) throw error
    },

    // Update member role
    async updateMemberRole(memberId: string, role: 'admin' | 'member'): Promise<void> {
        const { error } = await supabase
            .from('project_members')
            .update({ role })
            .eq('id', memberId)

        if (error) throw error
    },

    // Get project members
    async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
        const { data, error } = await supabase
            .from('project_members')
            .select(`
                *,
                profiles:profiles!project_members_user_id_profiles_fk(*)
            `)
            .eq('project_id', projectId)

        if (error) throw error
        return data || []
    },

    // Get dashboard stats
    async getDashboardStats() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        // Get projects count (using existing query pattern or simpler count)
        const { count: projectsCount, error: projectsError } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
        
        if (projectsError) throw projectsError

        // Get tasks stats
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('status')
            .eq('assigned_to', user.id)

        if (tasksError) throw tasksError

        const pendingTasks = tasks?.filter(t => t.status !== 'done' && t.status !== 'completed').length || 0
        const completedTasks = tasks?.filter(t => t.status === 'done' || t.status === 'completed').length || 0

        return {
            totalProjects: projectsCount || 0,
            pendingTasks,
            completedTasks
        }
    }
}

// Tasks API
export const tasksApi = {
    // Get all tasks for a project
    async getProjectTasks(projectId: string): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                assignee:profiles!tasks_assigned_to_profiles_fk(*)
            `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Create task
    async createTask(projectId: string, input: CreateTaskInput): Promise<Task> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('tasks')
            .insert({
                project_id: projectId,
                title: input.title,
                description: input.description,
                priority: input.priority || 'medium',
                cost: input.cost || 0,
                assigned_to: input.assigned_to,
                due_date: input.due_date,
                frequency: input.frequency,
                duration: input.duration,
                notes: input.notes,
                created_by: user.id
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Update task
    async updateTask(taskId: string, updates: UpdateTaskInput): Promise<Task> {
        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', taskId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Toggle task completion (with streak logic)
    async toggleTaskCompletion(taskId: string): Promise<{ status: string, streak: number, bonus_awarded: boolean }> {
        const { data, error } = await supabase.rpc('toggle_task_completion', {
            task_id_input: taskId
        })

        if (error) throw error
        return data
    },

    // Delete task
    async deleteTask(taskId: string): Promise<void> {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId)

        if (error) throw error
    }
}

// Payments API
export const paymentsApi = {
    // Get payments for a project
    async getProjectPayments(projectId: string): Promise<Payment[]> {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Create payment
    async createPayment(taskId: string, projectId: string, amount: number, payeeId: string): Promise<Payment> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('payments')
            .insert({
                task_id: taskId,
                project_id: projectId,
                payer_id: user.id,
                payee_id: payeeId,
                amount
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Update payment status
    async updatePaymentStatus(paymentId: string, status: string): Promise<Payment> {
        const updates: any = { status }
        if (status === 'completed') {
            updates.completed_at = new Date().toISOString()
        }

        const { data, error } = await supabase
            .from('payments')
            .update(updates)
            .eq('id', paymentId)
            .select()
            .single()

        if (error) throw error
        return data
    }
}

// Real-time subscriptions
export const subscribeToProject = (projectId: string, callback: (payload: any) => void) => {
    return supabase
        .channel(`project:${projectId}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'projects',
            filter: `id=eq.${projectId}`
        }, callback)
        .subscribe()
}

export const subscribeToProjectTasks = (projectId: string, callback: (payload: any) => void) => {
    return supabase
        .channel(`tasks:${projectId}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `project_id=eq.${projectId}`
        }, callback)
        .subscribe()
}

export const subscribeToProjectMembers = (projectId: string, callback: (payload: any) => void) => {
    return supabase
        .channel(`members:${projectId}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'project_members',
            filter: `project_id=eq.${projectId}`
        }, callback)
        .subscribe()
}
