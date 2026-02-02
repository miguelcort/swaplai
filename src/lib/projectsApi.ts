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
                budget: input.budget || 0
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Update project
    async updateProject(id: string, updates: Partial<CreateProjectInput>): Promise<Project> {
        const { data, error } = await supabase
            .from('projects')
            .update(updates)
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
