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
    async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
        const cleanUpdates: any = { ...updates }
        if (cleanUpdates.due_date === '') {
            cleanUpdates.due_date = null
        }

        // Remove non-updatable fields if passed (safeguard)
        delete cleanUpdates.id
        delete cleanUpdates.owner_id
        delete cleanUpdates.created_at
        delete cleanUpdates.updated_at
        delete cleanUpdates.members
        delete cleanUpdates.tasks

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

        // Logic handled by backend ideally, or client-side check
        // For now, we rely on the App.tsx logic calling this or the backend endpoint
        // This is a placeholder as the real logic seems to be in App.tsx or similar
        return { success: false }
    },

    // Panic Button - Get Options
    async getPanicOptions(projectId: string): Promise<{ message: string, options: any[] }> {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
        const response = await fetch(`${API_URL}/projects/${projectId}/panic-button`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        if (!response.ok) throw new Error('Failed to get panic options')
        return response.json()
    },

    // Accountability Coach
    async getAccountabilityCoaching(taskTitle: string, excuse: string): Promise<{ message: string, negotiation: string }> {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
        const response = await fetch(`${API_URL}/projects/accountability-coach`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_title: taskTitle, excuse })
        })
        if (!response.ok) throw new Error('Failed to get coaching')
        return response.json()
    },

    // Smart Rescheduling
    async analyzeFailurePatterns(projectId: string): Promise<{ pattern_analysis: string, suggested_schedule: any[] }> {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
        const response = await fetch(`${API_URL}/projects/${projectId}/analyze-patterns`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        if (!response.ok) throw new Error('Failed to analyze patterns')
        const data = await response.json()
        return data.suggestions
    },

    // Health Plan Methods
    async getActiveHealthPlan() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')
        
        const { data, error } = await supabase
            .from('health_plans')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
            
        if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
             console.error('Error fetching health plan:', error)
             return null
        }
        return data
    },

    async checkInHealthDaily() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase.rpc('check_in_health_daily', {
            user_id_input: user.id
        })

        if (error) throw error
        return data
    },

    // Complete project and trigger reward (Atomic)
    async completeProject(projectId: string): Promise<{ success: boolean, message?: string, added?: number }> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, message: 'Not authenticated' }

        try {
            const { data, error } = await supabase.rpc('complete_project_and_reward', {
                p_id: projectId,
                u_id: user.id
            })
            
            if (error) throw error
            return data
        } catch (e: any) {
             // Fallback for dev if migration not run: use old method
             if (e.code === 'PGRST202' || e.message?.includes('Could not find the function')) {
                console.warn('Using fallback completion logic (migration 017 missing)')
                await this.updateProject(projectId, { status: 'Completed' })
                return this.rewardProjectCompletion()
            }
            console.error('Project completion RPC failed:', e)
            return { success: false, message: e.message }
        }
    },

    // Trigger project completion reward (Deprecated - use completeProject)
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
                is_community: input.is_community || false,
                created_by: user.id
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Get community tasks
    async getCommunityTasks(): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                project:projects(title:name),
                assignee:profiles!tasks_assigned_to_profiles_fk(*)
            `)
            .eq('is_community', true)
            .neq('status', 'completed')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Apply to task
    async applyToTask(taskId: string, message?: string, bidAmount?: number): Promise<any> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('task_applications')
            .insert({
                task_id: taskId,
                applicant_id: user.id,
                message,
                bid_amount: bidAmount
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Get applications for a task
    async getTaskApplications(taskId: string): Promise<any[]> {
        // First get the applications
        const { data: applications, error } = await supabase
            .from('task_applications')
            .select('*')
            .eq('task_id', taskId)

        if (error) throw error
        if (!applications || applications.length === 0) return []

        // Then get the profiles for the applicants
        const applicantIds = [...new Set(applications.map(app => app.applicant_id))]
        
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', applicantIds)

        if (profilesError) throw profilesError

        // Merge profiles into applications
        const profilesMap = new Map(profiles?.map(p => [p.id, p]))
        
        return applications.map(app => ({
            ...app,
            applicant: profilesMap.get(app.applicant_id) || null
        }))
    },

    // Update application status
    async updateApplicationStatus(applicationId: string, status: 'accepted' | 'rejected'): Promise<void> {
        const { error } = await supabase
            .from('task_applications')
            .update({ status })
            .eq('id', applicationId)

        if (error) throw error
    },

    // Submit task delivery
    async submitTaskDelivery(applicationId: string, content: string, filePath?: string): Promise<void> {
        const updates: any = { 
            delivery_status: 'submitted',
            delivery_content: content
        }

        if (filePath) {
            updates.delivery_file_path = filePath
        }

        const { error } = await supabase
            .from('task_applications')
            .update(updates)
            .eq('id', applicationId)

        if (error) throw error
    },

    // Upload deliverable file
    async uploadDeliverable(taskId: string, file: File): Promise<string> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')
        
        // Path structure: user_id/task_id/timestamp_filename
        // This structure ensures uniqueness and matches our RLS policies
        const timestamp = new Date().getTime()
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const filePath = `${user.id}/${taskId}/${timestamp}_${cleanName}`
        
        const { error } = await supabase.storage
            .from('task-deliverables')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            })
            
        if (error) throw error
        return filePath
    },

    // Get signed URL for deliverable
    async getDeliverableUrl(path: string): Promise<string> {
        const { data, error } = await supabase.storage
            .from('task-deliverables')
            .createSignedUrl(path, 3600) // 1 hour expiry
            
        if (error) throw error
        return data.signedUrl
    },

    // Review task delivery
    async reviewTaskDelivery(applicationId: string, status: 'changes_requested' | 'approved', feedback?: string): Promise<void> {
        if (status === 'approved') {
            // Use RPC for atomic approval and credit transfer
            const { error } = await supabase.rpc('approve_task_delivery', {
                application_id_input: applicationId,
                feedback_input: feedback
            })
            
            if (error) throw error
        } else {
            const { error } = await supabase
                .from('task_applications')
                .update({ 
                    delivery_status: status,
                    delivery_feedback: feedback
                })
                .eq('id', applicationId)

            if (error) throw error
        }
    },

    // Rate user
    async rateUser(applicationId: string, rating: number): Promise<void> {
        const { error } = await supabase
            .from('task_applications')
            .update({ rating })
            .eq('id', applicationId)

        if (error) throw error
    },

    // Get tasks I applied to
    async getMyAppliedTasks(): Promise<any[]> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('task_applications')
            .select(`
                *,
                task:tasks!task_applications_task_id_fkey(*)
            `)
            .eq('applicant_id', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Get my community tasks (tasks I created)
    async getMyCommunityTasks(): Promise<Task[]> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                project:projects(title:name),
                applications:task_applications(count)
            `)
            .eq('is_community', true)
            .eq('created_by', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },


    // Update task
    async updateTask(taskId: string, updates: UpdateTaskInput): Promise<Task> {
        const cleanUpdates = { ...updates }
        if (cleanUpdates.due_date === '') {
            cleanUpdates.due_date = null
        }

        const { data, error } = await supabase
            .from('tasks')
            .update(cleanUpdates)
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
