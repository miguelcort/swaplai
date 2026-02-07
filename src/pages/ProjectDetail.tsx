import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, Plus, Trash2, Edit2, Users, LayoutList, X, Sparkles, ArrowLeftRight, CheckCircle, Check, Calendar, Target, TrendingUp, AlertCircle } from 'lucide-react'
import type { Project, Task, ProjectMember } from '../types/projects'
import { projectsApi, tasksApi } from '../lib/projectsApi'
import { InviteTeamModal } from '../components/projects/InviteTeamModal'
import { CreateTaskModal } from '../components/projects/CreateTaskModal'
import { CreateProjectModal } from '../components/projects/CreateProjectModal'
import { SwapTaskModal } from '../components/projects/SwapTaskModal'
import { TaskApplicationsModal } from '../components/projects/TaskApplicationsModal'
import { PanicModal } from '../components/projects/PanicModal'
import { AccountabilityModal } from '../components/projects/AccountabilityModal'
import { FailurePatternsModal } from '../components/projects/FailurePatternsModal'
import { Modal } from '../components/ui/Modal'
import { useAuthStore } from '../stores/authStore'
import { toast } from '../hooks/useToast'

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    
    const [project, setProject] = useState<Project | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'tasks' | 'team'>('tasks')
    
    // Modals state
    const [inviteModalOpen, setInviteModalOpen] = useState(false)
    const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false)
    const [deleteProjectModalOpen, setDeleteProjectModalOpen] = useState(false)
    const [editProjectModalOpen, setEditProjectModalOpen] = useState(false)
    const [editMemberModalOpen, setEditMemberModalOpen] = useState(false)
    const [panicModalOpen, setPanicModalOpen] = useState(false)
    const [failurePatternsModalOpen, setFailurePatternsModalOpen] = useState(false)
    const [accountabilityModalOpen, setAccountabilityModalOpen] = useState(false)
    
    // Selection state
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
    const [taskForAccountability, setTaskForAccountability] = useState<Task | null>(null)
    const [memberToRemove, setMemberToRemove] = useState<string | null>(null)
    const [memberToEdit, setMemberToEdit] = useState<ProjectMember | null>(null)
    const [newRole, setNewRole] = useState<'admin' | 'member'>('member')

    // Swap/Support state
    const [swapModalOpen, setSwapModalOpen] = useState(false)
    const [taskToSwap, setTaskToSwap] = useState<Task | null>(null)
    
    // Community Applications state
    const [applicationsModalOpen, setApplicationsModalOpen] = useState(false)
    const [taskForApplications, setTaskForApplications] = useState<Task | null>(null)

    // AI Generation state
    const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
    const [generatedTasks, setGeneratedTasks] = useState<any[]>([])
    const [showGeneratedTasksModal, setShowGeneratedTasksModal] = useState(false)
    const [selectedGeneratedTaskIndices, setSelectedGeneratedTaskIndices] = useState<Set<number>>(new Set())

    const handleGenerateTasks = async () => {
        if (!project) return
        setIsGeneratingTasks(true)
        try {
            const tasks = await projectsApi.generateTasks(project.id)
            setGeneratedTasks(tasks)
            setSelectedGeneratedTaskIndices(new Set(tasks.map((_, i) => i)))
            setShowGeneratedTasksModal(true)
        } catch (error) {
            console.error('Failed to generate tasks:', error)
        } finally {
            setIsGeneratingTasks(false)
        }
    }

    const handleAddGeneratedTasks = async () => {
        if (!project) return
        try {
            const tasksToAdd = generatedTasks.filter((_, i) => selectedGeneratedTaskIndices.has(i))
            
            await Promise.all(tasksToAdd.map(task => tasksApi.createTask(project.id, {
                title: task.title,
                description: task.description,
                priority: task.priority || 'medium',
                cost: task.cost || 0,
                assigned_to: project.owner_id,
                due_date: task.due_date
            })))
            
            await loadTasks()
            setShowGeneratedTasksModal(false)
            setGeneratedTasks([])
        } catch (error) {
             console.error('Failed to add tasks:', error)
        }
    }

    const isOwner = project?.owner_id === user?.id

    useEffect(() => {
        if (id) {
            loadProject()
            loadTasks()
        }
    }, [id])

    const loadProject = async () => {
        try {
            const data = await projectsApi.getProject(id!)
            setProject(data)
        } catch (error) {
            console.error('Failed to load project:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadTasks = async () => {
        try {
            const data = await tasksApi.getProjectTasks(id!)
            setTasks(data)
        } catch (error) {
            console.error('Failed to load tasks:', error)
        }
    }
    
    const openEditTaskModal = (task: Task) => {
        setTaskToEdit(task)
        setCreateTaskModalOpen(true)
    }

    const closeTaskModal = () => {
        setCreateTaskModalOpen(false)
        setTaskToEdit(null)
    }

    const handleDeleteProject = async () => {
        try {
            await projectsApi.deleteProject(id!)
            navigate('/projects')
        } catch (error) {
            console.error('Failed to delete project:', error)
        }
    }

    const handleDeleteTask = async (taskId: string) => {
        try {
            await tasksApi.deleteTask(taskId)
            loadTasks()
            setTaskToDelete(null)
        } catch (error) {
            console.error('Failed to delete task:', error)
        }
    }

    const handleRemoveMember = async (memberId: string) => {
        try {
            await projectsApi.removeMember(memberId)
            loadProject()
            setMemberToRemove(null)
        } catch (error) {
            console.error('Failed to remove member:', error)
        }
    }

    const handleUpdateMemberRole = async () => {
        if (!memberToEdit) return
        try {
            await projectsApi.updateMemberRole(memberToEdit.id, newRole)
            loadProject()
            setEditMemberModalOpen(false)
            setMemberToEdit(null)
        } catch (error) {
            console.error('Failed to update member role:', error)
        }
    }

    const handleCompleteProject = async () => {
        if (!project) return
        try {
            // Atomic completion and reward
            const result = await projectsApi.completeProject(project.id)
            
            if (result.success) {
                toast({
                    title: "Project Completed!",
                    description: result.message || `You earned ${result.added || 5} credits!`,
                    type: "success"
                })
            } else {
                 toast({ 
                     title: "Project Completed", 
                     description: result.message || "Status updated", 
                     type: result.message?.includes('already') ? "info" : "error" 
                })
            }
            
            // Reload
            loadProject()
        } catch (error) {
            console.error('Failed to complete project:', error)
            toast({ title: "Error", description: "Failed to complete project", type: "error" })
        }
    }

    const handleAssignTask = async (taskId: string, memberId: string) => {
        try {
            await tasksApi.updateTask(taskId, { assigned_to: memberId })
            loadTasks()
        } catch (error) {
            console.error('Failed to assign task:', error)
        }
    }

    const handleToggleTaskCompletion = async (task: Task) => {
        try {
            const result = await tasksApi.toggleTaskCompletion(task.id)
            
            if (result.status === 'completed') {
                try {
                    const stats = await projectsApi.updateGlobalStreak(true)
                    toast({ 
                        title: "Task Completed", 
                        description: `Streak: ${stats.streak} | Credits: ${stats.credits_change > 0 ? '+' + stats.credits_change : '0'}`,
                        type: "success" 
                    })
                } catch (e) {
                    console.error("Failed to update global streak", e)
                }
            }
            
            if (result.bonus_awarded) {
                // You could add a toast notification here
                console.log('Credits awarded!')
            }
            
            loadTasks()
        } catch (error) {
            console.error('Failed to update task status:', error)
            toast({ title: "Error", description: "Failed to update task", type: "error" })
        }
    }

    const getTimeRemaining = (dueDate: string) => {
        const now = new Date()
        const due = new Date(dueDate)
        const diff = due.getTime() - now.getTime()
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
        
        if (days < 0) return 'Overdue'
        if (days === 0) return 'Today'
        if (days === 1) return 'Tomorrow'
        return `${days} days left`
    }
    
    // We can reuse CreateProjectModal for editing if we tweak it, but for now let's just use it as is or handle logic?  
    // Actually, CreateProjectModal expects CreateProjectInput and calls createProject. 
    // We should probably create a separate EditProjectModal or make CreateProjectModal adaptable.
    // For simplicity in this turn, I will assume we can't easily reuse it without modification.
    // I'll skip the Edit Modal implementation details for a moment and focus on the UI structure first.

    const activeMembers = project?.members?.filter(m => m.status === 'accepted') || []
    const pendingMembers = project?.members?.filter(m => m.status === 'pending') || []
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-bg-dark">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-bg-dark">
                <p className="text-text-secondary mb-4 font-mono">PROJECT NOT FOUND</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 bg-primary text-bg-dark hover:bg-primary/90 font-bold font-mono uppercase tracking-wider"
                >
                    Return to Dashboard
                </button>
            </div>
        )
    }

    const totalCost = tasks.reduce((sum, task) => sum + task.cost, 0)
    const paidAmount = tasks
        .filter(t => t.payment_status === 'paid')
        .reduce((sum, task) => sum + task.cost, 0)

    return (
        <div className="min-h-full bg-bg-dark">
            {/* Header */}
            <div className="bg-bg-dark border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => navigate('/projects')}
                            className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-mono text-sm uppercase tracking-wider transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Projects
                        </button>
                        
                        {isOwner && (
                            <div className="flex items-center gap-2">
                                {project.status !== 'Completed' && (
                                    <button
                                        onClick={handleCompleteProject}
                                        className="p-2 text-accent-green hover:bg-accent-green/10 transition-colors rounded-full"
                                        title="Mark as Completed"
                                    >
                                        <CheckCircle className="h-5 w-5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setEditProjectModalOpen(true)} // Placeholder
                                    className="p-2 text-text-secondary hover:text-text-primary hover:bg-primary/5 transition-colors"
                                    title="Edit Project"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setPanicModalOpen(true)}
                                    className="p-2 text-red-900 hover:text-red-500 hover:bg-primary/5 transition-colors"
                                    title="Delete Project"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary font-sans uppercase tracking-wide">{project.name}</h1>
                            {project.description && (
                                <p className="text-text-secondary mt-2 font-mono text-sm max-w-2xl">{project.description}</p>
                            )}
                        </div>

                        {activeTab === 'team' && (
                            <button
                                onClick={() => setInviteModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-border text-text-primary hover:bg-primary/5 transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                            >
                                <UserPlus className="h-4 w-4" />
                                Invite Team
                            </button>
                        )}
                        
                        {activeTab === 'tasks' && (
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setFailurePatternsModalOpen(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-bg-card border border-border text-text-secondary hover:text-primary hover:bg-primary/5 transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                                    title="Analyze Failure Patterns"
                                >
                                    <TrendingUp className="h-4 w-4" />
                                    Smart Schedule
                                </button>
                                <button 
                                    onClick={handleGenerateTasks}
                                    disabled={isGeneratingTasks}
                                    className="flex items-center gap-2 px-6 py-3 bg-bg-card border border-border text-primary hover:bg-primary/5 transition-colors font-mono uppercase text-xs tracking-wider font-bold disabled:opacity-50"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    {isGeneratingTasks ? 'Thinking...' : 'AI Suggest'}
                                </button>
                                <button 
                                    onClick={() => setCreateTaskModalOpen(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-bg-dark hover:bg-primary/90 transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Task
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
                        <div className="bg-bg-card border border-border p-4 group hover:border-primary transition-colors">
                            <p className="text-xs text-text-secondary font-mono uppercase tracking-wider">Status</p>
                            <p className="text-lg font-bold text-text-primary font-sans mt-1 uppercase">{project.status}</p>
                        </div>
                        <div className="bg-bg-card border border-border p-4 group hover:border-primary transition-colors">
                            <p className="text-xs text-text-secondary font-mono uppercase tracking-wider">Due Date</p>
                            <p className="text-lg font-bold text-text-primary font-mono mt-1">
                                {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not Set'}
                            </p>
                        </div>
                        <div className="bg-bg-card border border-border p-4 group hover:border-primary transition-colors">
                            <p className="text-xs text-text-secondary font-mono uppercase tracking-wider">Budget</p>
                            <p className="text-lg font-bold text-primary font-mono mt-1">${project.budget.toFixed(2)}</p>
                        </div>
                        <div className="bg-bg-card border border-border p-4 group hover:border-primary transition-colors">
                            <p className="text-xs text-text-secondary font-mono uppercase tracking-wider">Total Cost</p>
                            <p className="text-lg font-bold text-text-primary font-mono mt-1">${totalCost.toFixed(2)}</p>
                        </div>
                        <div className="bg-bg-card border border-border p-4 group hover:border-primary transition-colors">
                            <p className="text-xs text-text-secondary font-mono uppercase tracking-wider">Paid</p>
                            <p className="text-lg font-bold text-primary font-mono mt-1">${paidAmount.toFixed(2)}</p>
                        </div>
                    </div>
                    
                    {/* 12 Week Year Dashboard */}
                    <div className="mt-8 border-t border-border pt-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Timeline & Scorecard */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* 12-Week Timeline */}
                                <div className="bg-bg-card border border-border p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold font-sans uppercase flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-primary" />
                                            12-Week Timeline
                                        </h3>
                                        <span className="text-sm font-mono text-primary font-bold">
                                            Week {(() => {
                                                const start = new Date(project.created_at);
                                                const now = new Date();
                                                const diff = Math.abs(now.getTime() - start.getTime());
                                                const week = Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));
                                                return Math.min(week, 12);
                                            })()} of 12
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-12 gap-1">
                                        {Array.from({ length: 12 }).map((_, i) => {
                                            const currentWeek = (() => {
                                                const start = new Date(project.created_at);
                                                const now = new Date();
                                                const diff = Math.abs(now.getTime() - start.getTime());
                                                return Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));
                                            })();
                                            
                                            const weekNum = i + 1;
                                            const isPast = weekNum < currentWeek;
                                            const isCurrent = weekNum === currentWeek;
                                            
                                            return (
                                                <div 
                                                    key={i}
                                                    className={`
                                                        h-12 border flex items-center justify-center text-xs font-mono font-bold
                                                        ${isCurrent ? 'border-primary bg-primary/10 text-primary animate-pulse' : 
                                                          isPast ? 'border-primary/20 bg-primary/5 text-primary/50' : 
                                                          'border-border bg-bg-dark text-text-secondary'}
                                                    `}
                                                >
                                                    {weekNum}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs font-mono text-text-secondary">
                                        <span>Start</span>
                                        <span>Finish</span>
                                    </div>
                                </div>

                                {/* Tactics of the Week */}
                                <div className="bg-bg-card border border-border p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold font-sans uppercase flex items-center gap-2">
                                            <Target className="h-5 w-5 text-primary" />
                                            Tactics of the Week
                                        </h3>
                                        <span className="text-xs font-mono uppercase tracking-wider text-text-secondary">
                                            Focus on execution
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {tasks.filter(t => {
                                            if (!t.due_date) return false;
                                            const due = new Date(t.due_date);
                                            const now = new Date();
                                            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                                            const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
                                            return due >= startOfWeek && due <= endOfWeek && t.status !== 'completed';
                                        }).length > 0 ? (
                                            tasks.filter(t => {
                                                if (!t.due_date) return false;
                                                const due = new Date(t.due_date);
                                                const now = new Date();
                                                const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                                                const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
                                                return due >= startOfWeek && due <= endOfWeek && t.status !== 'completed';
                                            }).slice(0, 5).map(task => (
                                                <div key={task.id} className="flex items-center gap-3 p-3 bg-bg-dark border border-border hover:border-primary/50 transition-colors group cursor-pointer" onClick={() => openEditTaskModal(task)}>
                                                    <div className={`h-4 w-4 rounded-sm border flex items-center justify-center ${task.priority === 'urgent' ? 'border-accent-red' : 'border-primary'}`}>
                                                        <div className={`h-2 w-2 ${task.priority === 'urgent' ? 'bg-accent-red' : 'bg-primary'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                                    </div>
                                                    <span className="text-sm font-medium text-text-primary line-clamp-1 flex-1">{task.title}</span>
                                                    <span className="text-xs font-mono text-text-secondary">{new Date(task.due_date!).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 border border-dashed border-border">
                                                <p className="text-text-secondary font-mono text-sm">No tactics scheduled for this week.</p>
                                                <button onClick={() => setCreateTaskModalOpen(true)} className="mt-2 text-primary text-xs font-bold uppercase hover:underline">Add Tactic</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Scorecard & WAM */}
                            <div className="flex flex-col gap-6 h-full">
                                {/* Weekly Scorecard */}
                                <div className="bg-bg-card border border-border p-6 flex flex-col items-center justify-center text-center flex-1 min-h-[200px]">
                                    <h3 className="text-sm font-mono uppercase tracking-wider text-text-secondary mb-4">Weekly Execution Score</h3>
                                    <div className="relative h-32 w-32 flex items-center justify-center mb-4">
                                        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />
                                            <circle 
                                                cx="50" 
                                                cy="50" 
                                                r="45" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                strokeWidth="8" 
                                                className="text-primary transition-all duration-1000 ease-out"
                                                strokeDasharray={`${2 * Math.PI * 45}`}
                                                strokeDashoffset={`${2 * Math.PI * 45 * (1 - (() => {
                                                    const now = new Date();
                                                    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                                                    startOfWeek.setHours(0, 0, 0, 0);
                                                    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
                                                    endOfWeek.setHours(23, 59, 59, 999);
                                                    
                                                    const weeklyTasks = tasks.filter(t => {
                                                        if (!t.due_date) return false;
                                                        const due = new Date(t.due_date);
                                                        return due >= startOfWeek && due <= endOfWeek;
                                                    });
                                                    
                                                    if (weeklyTasks.length === 0) return 0;
                                                    const completed = weeklyTasks.filter(t => t.status === 'completed').length;
                                                    return completed / weeklyTasks.length;
                                                })())}`}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-3xl font-bold font-mono text-text-primary">
                                                {(() => {
                                                    const now = new Date();
                                                    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                                                    startOfWeek.setHours(0, 0, 0, 0);
                                                    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
                                                    endOfWeek.setHours(23, 59, 59, 999);
                                                    
                                                    const weeklyTasks = tasks.filter(t => {
                                                        if (!t.due_date) return false;
                                                        const due = new Date(t.due_date);
                                                        return due >= startOfWeek && due <= endOfWeek;
                                                    });
                                                    
                                                    if (weeklyTasks.length === 0) return 0;
                                                    const completed = weeklyTasks.filter(t => t.status === 'completed').length;
                                                    return Math.round((completed / weeklyTasks.length) * 100);
                                                })()}%
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-text-secondary max-w-[200px]">
                                        {(() => {
                                            const score = (() => {
                                                const now = new Date();
                                                const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                                                startOfWeek.setHours(0, 0, 0, 0);
                                                const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
                                                endOfWeek.setHours(23, 59, 59, 999);
                                                const weeklyTasks = tasks.filter(t => t.due_date && new Date(t.due_date) >= startOfWeek && new Date(t.due_date) <= endOfWeek);
                                                if (weeklyTasks.length === 0) return 0;
                                                return Math.round((weeklyTasks.filter(t => t.status === 'completed').length / weeklyTasks.length) * 100);
                                            })();
                                            
                                            if (score >= 85) return "Great job! You're crushing your weekly goals.";
                                            if (score >= 60) return "Keep pushing! You're close to the 85% target.";
                                            return "Focus needed! execute your key tactics to get back on track.";
                                        })()}
                                    </p>
                                </div>

                                {/* WAM Block */}
                                <div className="bg-bg-card border border-border p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold font-sans uppercase flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-primary" />
                                            WAM Check-in
                                        </h3>
                                        <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary bg-bg-dark px-2 py-1 rounded border border-border">Weekly</span>
                                    </div>
                                    <button 
                                        onClick={() => window.open('https://docs.google.com/document/create', '_blank')}
                                        className="w-full py-3 bg-bg-dark border border-border hover:border-primary/50 text-text-secondary hover:text-primary transition-all text-sm font-mono flex items-center justify-center gap-2 group"
                                    >
                                        <AlertCircle className="h-4 w-4 group-hover:text-primary transition-colors" />
                                        Start Weekly Review
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tabs Navigation */}
                    <div className="flex items-center gap-6 mt-8 border-b border-border">
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`pb-4 text-sm font-bold uppercase tracking-wider font-mono transition-colors relative ${
                                activeTab === 'tasks' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <LayoutList className="h-4 w-4" />
                                Tasks
                            </span>
                            {activeTab === 'tasks' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('team')}
                            className={`pb-4 text-sm font-bold uppercase tracking-wider font-mono transition-colors relative ${
                                activeTab === 'team' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Team
                            </span>
                            {activeTab === 'team' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'tasks' ? (
                    <div className="bg-bg-card border border-border overflow-hidden">
                        {tasks.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border bg-bg-card text-text-secondary font-mono text-xs uppercase tracking-wider">
                                            <th className="py-4 px-6 font-bold w-1/3">Task</th>
                                            <th className="py-4 px-6 font-bold">Status</th>
                                            <th className="py-4 px-6 font-bold">Priority</th>
                                            <th className="py-4 px-6 font-bold">Assignee</th>
                                            <th className="py-4 px-6 font-bold">Deadline</th>
                                            <th className="py-4 px-6 font-bold text-right">Budget</th>
                                            <th className="py-4 px-6 font-bold text-right w-24">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks.map((task) => (
                                            <tr 
                                                key={task.id} 
                                                className="border-b border-border hover:bg-primary/5 transition-colors group"
                                            >
                                                <td className="py-4 px-6">
                                                    <div>
                                                        <p className={`font-bold font-sans text-sm ${
                                                            task.status === 'completed' ? 'text-text-secondary line-through' : 'text-text-primary'
                                                        }`}>
                                                            {task.title}
                                                        </p>
                                                        {task.description && (
                                                            <p className="text-xs text-text-secondary truncate max-w-xs font-mono mt-1">
                                                                {task.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-1 text-xs font-bold uppercase tracking-wider font-mono border ${
                                                            task.status === 'completed'
                                                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                                : task.status === 'in_progress'
                                                                ? 'bg-primary/10 text-primary border-primary/20'
                                                                : 'bg-bg-dark text-text-secondary border-border'
                                                        }`}
                                                    >
                                                        {task.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`text-xs font-bold uppercase font-mono ${
                                                        task.priority === 'high' ? 'text-red-500' :
                                                        task.priority === 'medium' ? 'text-primary' :
                                                        'text-text-secondary'
                                                    }`}>
                                                        {task.priority}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                                            {task.assigned_to ? 
                                                                project?.members?.find(m => m.user_id === task.assigned_to)?.profiles?.email?.[0].toUpperCase() || '?' 
                                                                : '-'}
                                                        </div>
                                                        {task.is_community && isOwner && (
                                                            <button
                                                                onClick={() => { setTaskForApplications(task); setApplicationsModalOpen(true); }}
                                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/5 rounded text-text-secondary transition-all"
                                                                title="View Applications"
                                                            >
                                                                <Users className="h-3 w-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`text-xs font-mono font-bold ${
                                                        getTimeRemaining(task.due_date || '') === 'Overdue' ? 'text-red-500' : 'text-text-secondary'
                                                    }`}>
                                                        {getTimeRemaining(task.due_date || '')}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right font-mono text-sm font-bold text-text-primary">
                                                    ${task.cost}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleToggleTaskCompletion(task)}
                                                            className={`p-1.5 transition-colors ${
                                                                task.status === 'completed' 
                                                                    ? 'text-green-500 hover:text-green-400' 
                                                                    : 'text-text-secondary hover:text-green-500'
                                                            }`}
                                                            title={task.status === 'completed' ? "Mark Incomplete" : "Mark Complete"}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSwapModalOpen(true); setTaskToSwap(task); }}
                                                            className="p-1.5 text-text-secondary hover:text-primary transition-colors"
                                                            title="Swap/Assign Task"
                                                        >
                                                            <ArrowLeftRight className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setTaskForAccountability(task)
                                                                setAccountabilityModalOpen(true)
                                                            }}
                                                            className="p-1.5 text-text-secondary hover:text-primary transition-colors"
                                                            title="Get Accountability Coaching"
                                                        >
                                                            <Target className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openEditTaskModal(task)}
                                                            className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setTaskToDelete(task.id)
                                                            }}
                                                            className="p-1.5 text-text-secondary hover:text-red-500 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <LayoutList className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-text-primary font-sans uppercase">No tasks yet</h3>
                                <p className="text-text-secondary max-w-sm mt-2 font-mono text-sm">
                                    Get started by creating a task or use AI to generate a plan for you.
                                </p>
                                <div className="flex gap-4 mt-6">
                                    <button 
                                        onClick={handleGenerateTasks}
                                        disabled={isGeneratingTasks}
                                        className="flex items-center gap-2 px-6 py-3 bg-bg-card border border-border text-primary hover:bg-primary/5 transition-colors font-mono uppercase text-xs tracking-wider font-bold disabled:opacity-50"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        {isGeneratingTasks ? 'Thinking...' : 'AI Suggest'}
                                    </button>
                                    <button
                                        onClick={() => setCreateTaskModalOpen(true)}
                                        className="flex items-center gap-2 px-6 py-3 bg-primary text-bg-dark hover:bg-primary/90 transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create Task
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Active Members */}
                        {activeMembers.map((member) => (
                            <div key={member.id} className="bg-bg-card border border-border p-6 group hover:border-primary transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-primary flex items-center justify-center text-lg font-bold text-bg-dark font-mono">
                                            {member.profiles?.email?.[0].toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-text-primary font-sans uppercase text-sm">
                                                {member.profiles?.email?.split('@')[0] || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-text-secondary font-mono mt-1">{member.role}</p>
                                        </div>
                                    </div>
                                    {isOwner && member.user_id !== user?.id && (
                                        <div className="relative">
                                            <button
                                                onClick={() => {
                                                    setMemberToEdit(member)
                                                    setNewRole(member.role === 'owner' ? 'admin' : member.role)
                                                    setEditMemberModalOpen(true)
                                                }}
                                                className="p-2 text-text-secondary hover:text-text-primary hover:bg-primary/5 transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setMemberToRemove(member.id)
                                                }}
                                                className="p-2 text-text-secondary hover:text-red-500 hover:bg-primary/5 transition-colors ml-1"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Pending Members */}
                        {pendingMembers.map((member) => (
                            <div key={member.id} className="bg-bg-card border border-border border-dashed p-6 opacity-75">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-border flex items-center justify-center text-lg font-bold text-text-secondary font-mono">
                                            ?
                                        </div>
                                        <div>
                                            <p className="font-bold text-text-primary font-sans uppercase text-sm">
                                                {member.profiles?.email || 'Invited User'}
                                            </p>
                                            <p className="text-xs text-primary font-mono mt-1 uppercase tracking-wider">Pending</p>
                                        </div>
                                    </div>
                                    {isOwner && (
                                        <button
                                            onClick={() => {
                                                setMemberToRemove(member.id)
                                            }}
                                            className="p-2 text-text-secondary hover:text-red-500 hover:bg-primary/5 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {/* Add Member Card */}
                        <button
                            onClick={() => setInviteModalOpen(true)}
                            className="flex flex-col items-center justify-center p-6 border border-border border-dashed hover:border-primary hover:bg-primary/5 transition-all group min-h-[120px]"
                        >
                            <div className="h-10 w-10 rounded-full bg-border flex items-center justify-center group-hover:bg-primary group-hover:text-bg-dark transition-colors mb-3">
                                <Plus className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-bold text-text-secondary group-hover:text-text-primary font-mono uppercase tracking-wider">Invite Member</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <InviteTeamModal
                isOpen={inviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                projectId={id!}
                onSuccess={loadProject}
            />

            <CreateTaskModal
                isOpen={createTaskModalOpen}
                onClose={closeTaskModal}
                projectId={id!}
                members={project?.members || []}
                onSuccess={loadTasks}
                taskToEdit={taskToEdit}
            />

            {/* AI Generated Tasks Modal */}
            <Modal
                isOpen={showGeneratedTasksModal}
                onClose={() => setShowGeneratedTasksModal(false)}
                title="AI Suggested Tasks"
            >
                <div className="space-y-4">
                    <p className="text-text-secondary text-sm font-mono">
                        Select the tasks you want to add to your project.
                    </p>
                    <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
                        {generatedTasks.map((task, index) => (
                            <div 
                                key={index}
                                onClick={() => {
                                    const newSelected = new Set(selectedGeneratedTaskIndices)
                                    if (newSelected.has(index)) {
                                        newSelected.delete(index)
                                    } else {
                                        newSelected.add(index)
                                    }
                                    setSelectedGeneratedTaskIndices(newSelected)
                                }}
                                className={`p-4 border cursor-pointer transition-all ${
                                    selectedGeneratedTaskIndices.has(index)
                                        ? 'bg-primary/10 border-primary'
                                        : 'bg-bg-card border-border hover:border-primary/50'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 h-4 w-4 border flex items-center justify-center ${
                                        selectedGeneratedTaskIndices.has(index)
                                            ? 'bg-primary border-primary'
                                            : 'border-text-secondary'
                                    }`}>
                                        {selectedGeneratedTaskIndices.has(index) && <Check className="h-3 w-3 text-bg-dark" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text-primary font-sans text-sm uppercase">{task.title}</h4>
                                        <p className="text-xs text-text-secondary font-mono mt-1">{task.description}</p>
                                        <div className="flex gap-3 mt-2">
                                            <span className="text-[10px] font-bold text-primary uppercase border border-primary/30 px-1.5 py-0.5">{task.priority}</span>
                                            <span className="text-[10px] font-bold text-text-secondary uppercase border border-border px-1.5 py-0.5">${task.cost}</span>
                                            <span className="text-[10px] font-bold text-text-secondary uppercase border border-border px-1.5 py-0.5">{new Date(task.due_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button
                            onClick={() => setShowGeneratedTasksModal(false)}
                            className="px-4 py-2 text-text-secondary hover:text-text-primary font-mono text-sm font-bold uppercase"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddGeneratedTasks}
                            className="px-6 py-2 bg-primary text-bg-dark hover:bg-primary/90 font-mono text-sm font-bold uppercase tracking-wider"
                        >
                            Add Selected ({selectedGeneratedTaskIndices.size})
                        </button>
                    </div>
                </div>
            </Modal>
            
            {/* Delete Project Modal */}
            <Modal
                isOpen={deleteProjectModalOpen}
                onClose={() => setDeleteProjectModalOpen(false)}
                title="Delete Project"
            >
                <div className="space-y-4">
                    <p className="text-text-secondary font-mono text-sm">
                        Are you sure you want to delete <span className="text-text-primary font-bold">{project.name}</span>? 
                        This action cannot be undone and all tasks will be deleted.
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setDeleteProjectModalOpen(false)}
                            className="px-4 py-2 text-text-secondary hover:text-text-primary font-mono text-sm font-bold uppercase"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteProject}
                            className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 font-mono text-sm font-bold uppercase tracking-wider"
                        >
                            Delete Project
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Task Confirmation */}
            <Modal
                isOpen={!!taskToDelete}
                onClose={() => setTaskToDelete(null)}
                title="Delete Task"
            >
                <div className="space-y-4">
                    <p className="text-text-secondary font-mono text-sm">
                        Are you sure you want to delete this task? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setTaskToDelete(null)}
                            className="px-4 py-2 text-text-secondary hover:text-text-primary font-mono text-sm font-bold uppercase"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => taskToDelete && handleDeleteTask(taskToDelete)}
                            className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 font-mono text-sm font-bold uppercase tracking-wider"
                        >
                            Delete Task
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Remove Member Confirmation */}
            <Modal
                isOpen={!!memberToRemove}
                onClose={() => setMemberToRemove(null)}
                title="Remove Member"
            >
                <div className="space-y-4">
                    <p className="text-text-secondary font-mono text-sm">
                        Are you sure you want to remove this member from the project?
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setMemberToRemove(null)}
                            className="px-4 py-2 text-text-secondary hover:text-text-primary font-mono text-sm font-bold uppercase"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => memberToRemove && handleRemoveMember(memberToRemove)}
                            className="px-6 py-2 bg-red-600 text-white hover:bg-red-700 font-mono text-sm font-bold uppercase tracking-wider"
                        >
                            Remove Member
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Member Role Modal */}
            <Modal
                isOpen={editMemberModalOpen}
                onClose={() => {
                    setEditMemberModalOpen(false)
                    setMemberToEdit(null)
                }}
                title="Edit Member Role"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-primary font-mono uppercase">Role</label>
                        <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value as 'admin' | 'member')}
                            className="w-full bg-bg-dark border border-border text-text-primary p-3 font-mono text-sm focus:outline-none focus:border-primary"
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => {
                                setEditMemberModalOpen(false)
                                setMemberToEdit(null)
                            }}
                            className="px-4 py-2 text-text-secondary hover:text-text-primary font-mono text-sm font-bold uppercase"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateMemberRole}
                            className="px-6 py-2 bg-primary text-bg-dark hover:bg-primary/90 font-mono text-sm font-bold uppercase tracking-wider"
                        >
                            Update Role
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Project Modal */}
            {project && (
                <CreateProjectModal
                    isOpen={editProjectModalOpen}
                    onClose={() => setEditProjectModalOpen(false)}
                    onSuccess={() => {
                        setEditProjectModalOpen(false)
                        loadProject()
                    }}
                    projectToEdit={project}
                />
            )}

            <SwapTaskModal
                isOpen={swapModalOpen}
                onClose={() => {
                    setSwapModalOpen(false)
                    setTaskToSwap(null)
                }}
                task={taskToSwap}
                members={project?.members || []}
                onAssign={handleAssignTask}
                onUpdate={loadTasks}
            />

            <TaskApplicationsModal
                isOpen={applicationsModalOpen}
                onClose={() => {
                    setApplicationsModalOpen(false)
                    setTaskForApplications(null)
                }}
                task={taskForApplications}
                onAssign={handleAssignTask}
            />

            <PanicModal
                isOpen={panicModalOpen}
                onClose={() => setPanicModalOpen(false)}
                projectId={id!}
                projectName={project?.name || 'Project'}
                onDeleteConfirm={() => {
                    setPanicModalOpen(false)
                    setDeleteProjectModalOpen(true)
                }}
            />

            <FailurePatternsModal
                isOpen={failurePatternsModalOpen}
                onClose={() => setFailurePatternsModalOpen(false)}
                projectId={id!}
                onScheduleApplied={loadTasks}
            />

            <AccountabilityModal
                isOpen={accountabilityModalOpen}
                onClose={() => {
                    setAccountabilityModalOpen(false)
                    setTaskForAccountability(null)
                }}
                taskTitle={taskForAccountability?.title || ''}
            />
        </div>
    )
}
