export type ProjectStatus = 'Active' | 'Recent' | 'Idle' | 'Completed' | 'Archived'
export type MemberRole = 'owner' | 'admin' | 'member'
export type MemberStatus = 'pending' | 'accepted' | 'rejected'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type PaymentStatus = 'unpaid' | 'pending' | 'paid'
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

export interface TeamMember {
    id: string
    name: string
    avatar: string
    email?: string
}

export interface Profile {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
}

export interface ProjectMember {
    id: string
    project_id: string
    user_id: string
    role: MemberRole
    status: MemberStatus
    invited_by: string
    invited_at: string
    responded_at?: string
    profiles?: Profile
}

export interface Task {
    id: string
    project_id: string
    title: string
    description?: string
    status: TaskStatus
    priority: TaskPriority
    cost: number
    payment_status: PaymentStatus
    assigned_to?: string
    created_by: string
    due_date?: string
    completed_at?: string
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'
    duration?: string
    notes?: string
    streak_count?: number
    created_at: string
    updated_at: string
    assignee?: Profile
}

export interface Payment {
    id: string
    task_id: string
    project_id: string
    payer_id: string
    payee_id: string
    amount: number
    status: TransactionStatus
    payment_method?: string
    transaction_id?: string
    notes?: string
    created_at: string
    completed_at?: string
}

export interface Project {
    id: string
    owner_id: string
    name: string
    description?: string
    status: ProjectStatus
    budget: number
    due_date?: string | null
    created_at: string
    updated_at: string
    members?: ProjectMember[]
    tasks?: Task[]
    team?: TeamMember[]
    progress?: number
    isStarred?: boolean
}

export interface CreateProjectInput {
    name: string
    description?: string
    budget?: number
    due_date?: string | null
}

export interface InviteTeamMemberInput {
    email: string
    role: MemberRole
}

export interface CreateTaskInput {
    title: string
    description?: string
    priority?: TaskPriority
    cost?: number
    assigned_to?: string
    due_date?: string
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'
    duration?: string
    notes?: string
}

export interface UpdateTaskInput {
    title?: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    cost?: number
    payment_status?: PaymentStatus
    assigned_to?: string
    due_date?: string
    completed_at?: string
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'
    duration?: string
    notes?: string
}
