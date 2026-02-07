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
    rating_sum?: number
    rating_count?: number
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
    is_community?: boolean
    created_at: string
    updated_at: string
    assignee?: Profile
    project?: {
        title: string
    }
    applications?: { count: number }[]
}

export interface TaskApplication {
    id: string
    task_id: string
    applicant_id: string
    status: 'pending' | 'accepted' | 'rejected'
    message?: string
    bid_amount?: number
    delivery_status?: 'pending' | 'submitted' | 'changes_requested' | 'approved'
    delivery_content?: string
    delivery_file_path?: string
    delivery_feedback?: string
    rating?: number
    created_at: string
    applicant?: Profile
    task?: Task
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
    due_date?: string | null
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'
    duration?: string
    notes?: string
    is_community?: boolean
}

export interface UpdateTaskInput {
    title?: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    cost?: number
    payment_status?: PaymentStatus
    assigned_to?: string
    due_date?: string | null
    completed_at?: string
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'
    duration?: string
    notes?: string
    is_community?: boolean
}
