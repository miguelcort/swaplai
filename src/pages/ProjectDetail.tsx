import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, Plus, Trash2, Edit2, Users, LayoutList, X } from 'lucide-react'
import type { Project, Task, ProjectMember } from '../types/projects'
import { projectsApi, tasksApi } from '../lib/projectsApi'
import { InviteTeamModal } from '../components/projects/InviteTeamModal'
import { CreateTaskModal } from '../components/projects/CreateTaskModal'
import { CreateProjectModal } from '../components/projects/CreateProjectModal'
import { Modal } from '../components/ui/Modal'
import { useAuthStore } from '../stores/authStore'

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
    const [editProjectModalOpen, setEditProjectModalOpen] = useState(false)
    const [deleteProjectModalOpen, setDeleteProjectModalOpen] = useState(false)
    const [editMemberModalOpen, setEditMemberModalOpen] = useState(false)
    
    // Selection state
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
    const [memberToRemove, setMemberToRemove] = useState<string | null>(null)
    const [memberToEdit, setMemberToEdit] = useState<ProjectMember | null>(null)
    const [newRole, setNewRole] = useState<'admin' | 'member'>('member')

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
    
    // We can reuse CreateProjectModal for editing if we tweak it, but for now let's just use it as is or handle logic? 
    // Actually, CreateProjectModal expects CreateProjectInput and calls createProject. 
    // We should probably create a separate EditProjectModal or make CreateProjectModal adaptable.
    // For simplicity in this turn, I will assume we can't easily reuse it without modification.
    // I'll skip the Edit Modal implementation details for a moment and focus on the UI structure first.

    const activeMembers = project?.members?.filter(m => m.status === 'accepted') || []
    const pendingMembers = project?.members?.filter(m => m.status === 'pending') || []
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-[#C9A962] border-r-transparent"></div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A]">
                <p className="text-gray-400 mb-4 font-mono">PROJECT NOT FOUND</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-[#C9A962] text-[#0A0A0A] hover:bg-[#b09355] font-bold font-mono uppercase tracking-wider"
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
        <div className="min-h-full bg-[#0A0A0A]">
            {/* Header */}
            <div className="bg-[#0A0A0A] border-b border-[#333333]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => navigate('/projects')}
                            className="flex items-center gap-2 text-gray-400 hover:text-white font-mono text-sm uppercase tracking-wider transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Projects
                        </button>
                        
                        {isOwner && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setEditProjectModalOpen(true)} // Placeholder
                                    className="p-2 text-gray-400 hover:text-white hover:bg-[#333333] transition-colors"
                                    title="Edit Project"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setDeleteProjectModalOpen(true)}
                                    className="p-2 text-red-900 hover:text-red-500 hover:bg-[#333333] transition-colors"
                                    title="Delete Project"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white font-sans uppercase tracking-wide">{project.name}</h1>
                            {project.description && (
                                <p className="text-gray-400 mt-2 font-mono text-sm max-w-2xl">{project.description}</p>
                            )}
                        </div>

                        {activeTab === 'team' && (
                            <button
                                onClick={() => setInviteModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-[#333333] text-white hover:bg-[#333333] transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                            >
                                <UserPlus className="h-4 w-4" />
                                Invite Team
                            </button>
                        )}
                        
                        {activeTab === 'tasks' && (
                            <button 
                                onClick={() => setCreateTaskModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-[#C9A962] text-[#0A0A0A] hover:bg-[#b09355] transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                            >
                                <Plus className="h-4 w-4" />
                                Add Task
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                        <div className="bg-[#0A0A0A] border border-[#333333] p-4 group hover:border-[#C9A962] transition-colors">
                            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">Status</p>
                            <p className="text-lg font-bold text-white font-sans mt-1 uppercase">{project.status}</p>
                        </div>
                        <div className="bg-[#0A0A0A] border border-[#333333] p-4 group hover:border-[#C9A962] transition-colors">
                            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">Budget</p>
                            <p className="text-lg font-bold text-[#C9A962] font-mono mt-1">${project.budget.toFixed(2)}</p>
                        </div>
                        <div className="bg-[#0A0A0A] border border-[#333333] p-4 group hover:border-[#C9A962] transition-colors">
                            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">Total Cost</p>
                            <p className="text-lg font-bold text-white font-mono mt-1">${totalCost.toFixed(2)}</p>
                        </div>
                        <div className="bg-[#0A0A0A] border border-[#333333] p-4 group hover:border-[#C9A962] transition-colors">
                            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">Paid</p>
                            <p className="text-lg font-bold text-[#C9A962] font-mono mt-1">${paidAmount.toFixed(2)}</p>
                        </div>
                    </div>
                    
                    {/* Tabs Navigation */}
                    <div className="flex items-center gap-6 mt-8 border-b border-[#333333]">
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`pb-4 text-sm font-bold uppercase tracking-wider font-mono transition-colors relative ${
                                activeTab === 'tasks' ? 'text-[#C9A962]' : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <LayoutList className="h-4 w-4" />
                                Tasks
                            </span>
                            {activeTab === 'tasks' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C9A962]"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('team')}
                            className={`pb-4 text-sm font-bold uppercase tracking-wider font-mono transition-colors relative ${
                                activeTab === 'team' ? 'text-[#C9A962]' : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            <span className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Team
                            </span>
                            {activeTab === 'team' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C9A962]"></span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'tasks' ? (
                    <div className="bg-[#0A0A0A] border border-[#333333] overflow-hidden">
                        {tasks.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#333333] bg-[#0F0F0F] text-gray-500 font-mono text-xs uppercase tracking-wider">
                                            <th className="py-4 px-6 font-bold w-1/3">Task</th>
                                            <th className="py-4 px-6 font-bold">Status</th>
                                            <th className="py-4 px-6 font-bold">Priority</th>
                                            <th className="py-4 px-6 font-bold">Assignee</th>
                                            <th className="py-4 px-6 font-bold text-right">Budget</th>
                                            <th className="py-4 px-6 font-bold text-right w-24">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#333333]">
                                        {tasks.map((task) => (
                                            <tr key={task.id} className="group hover:bg-[#111111] transition-colors">
                                                <td className="py-4 px-6">
                                                    <div>
                                                        <div className="font-bold text-white font-sans text-sm">{task.title}</div>
                                                        {task.description && (
                                                            <div className="text-xs text-gray-500 mt-1 font-mono truncate max-w-xs">{task.description}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span
                                                        className={`inline-flex items-center justify-center px-3 py-1 text-xs font-bold font-mono uppercase tracking-wider w-32 ${
                                                            task.status === 'completed'
                                                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                                : task.status === 'in_progress'
                                                                    ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                                                    : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                                                        }`}
                                                    >
                                                        {task.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider ${
                                                            task.priority === 'urgent'
                                                                ? 'text-red-500'
                                                                : task.priority === 'high'
                                                                    ? 'text-orange-500'
                                                                    : 'text-gray-400'
                                                        }`}
                                                    >
                                                        <span className={`w-2 h-2 rounded-full ${
                                                            task.priority === 'urgent' ? 'bg-red-500' :
                                                            task.priority === 'high' ? 'bg-orange-500' :
                                                            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                                                        }`}></span>
                                                        {task.priority}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {task.assignee ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-[#333333] flex items-center justify-center text-[10px] font-bold text-white border border-gray-600">
                                                                {task.assignee.full_name?.substring(0, 2).toUpperCase() || task.assignee.email?.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <span className="text-sm text-gray-300 font-mono truncate max-w-[150px]">
                                                                {task.assignee.full_name || task.assignee.email}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-600 font-mono italic">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="font-mono font-bold text-[#C9A962]">
                                                        ${task.cost.toFixed(2)}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                openEditTaskModal(task)
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-white hover:bg-[#333333] rounded transition-colors"
                                                            title="Edit Task"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setTaskToDelete(task.id)
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-[#333333] rounded transition-colors"
                                                            title="Delete Task"
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
                            <div className="text-center py-16">
                                <p className="text-gray-500 mb-6 font-mono text-sm">NO TASKS IN SYSTEM</p>
                                <button 
                                    onClick={() => setCreateTaskModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 border border-[#C9A962] text-[#C9A962] hover:bg-[#C9A962] hover:text-[#0A0A0A] transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                                >
                                    <Plus className="h-4 w-4" />
                                    Initialize First Task
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Pending Invitations */}
                        {pendingMembers.length > 0 && (
                            <div className="bg-[#0A0A0A] border border-[#333333] overflow-hidden">
                                <div className="px-6 py-4 border-b border-[#333333] bg-[#0F0F0F] flex items-center justify-between">
                                    <h3 className="font-mono text-sm font-bold text-[#C9A962] uppercase tracking-wider flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#C9A962] animate-pulse"></div>
                                        Pending Invitations
                                    </h3>
                                    <span className="text-xs font-mono text-gray-500">{pendingMembers.length} PENDING</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[#333333] text-gray-500 font-mono text-xs uppercase tracking-wider">
                                                <th className="py-4 px-6 font-bold w-1/3">Email</th>
                                                <th className="py-4 px-6 font-bold">Role</th>
                                                <th className="py-4 px-6 font-bold">Invited</th>
                                                <th className="py-4 px-6 font-bold text-right w-24">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#333333]">
                                            {pendingMembers.map((member) => (
                                                <tr key={member.id} className="group hover:bg-[#111111] transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-[#333333] border border-gray-700 flex items-center justify-center">
                                                                <span className="text-xs font-bold text-gray-400 font-mono">
                                                                    @
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white font-mono">
                                                                    {member.profiles?.email || 'Unknown Email'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-xs font-mono uppercase tracking-wider text-gray-300 bg-[#333333] px-2 py-1 rounded">
                                                            {member.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-xs text-gray-500 font-mono">
                                                            {new Date(member.invited_at).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        {isOwner && (
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        setMemberToEdit(member)
                                                                        setNewRole(member.role as 'admin' | 'member')
                                                                        setEditMemberModalOpen(true)
                                                                    }}
                                                                    className="p-2 text-gray-400 hover:text-white hover:bg-[#333333] rounded transition-colors"
                                                                    title="Edit Role"
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </button>
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        setMemberToRemove(member.id)
                                                                    }}
                                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-[#333333] rounded transition-colors"
                                                                    title="Cancel Invitation"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Active Team Members */}
                        <div className="bg-[#0A0A0A] border border-[#333333] overflow-hidden">
                            <div className="px-6 py-4 border-b border-[#333333] bg-[#0F0F0F] flex items-center justify-between">
                                <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
                                    Active Team Members
                                </h3>
                                <span className="text-xs font-mono text-gray-500">{activeMembers.length} MEMBERS</span>
                            </div>
                            
                            {activeMembers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[#333333] text-gray-500 font-mono text-xs uppercase tracking-wider">
                                                <th className="py-4 px-6 font-bold w-1/3">Member</th>
                                                <th className="py-4 px-6 font-bold">Role</th>
                                                <th className="py-4 px-6 font-bold">Joined</th>
                                                <th className="py-4 px-6 font-bold text-right w-24">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#333333]">
                                            {activeMembers.map((member) => (
                                                <tr key={member.id} className="group hover:bg-[#111111] transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-black border border-[#333333] flex items-center justify-center overflow-hidden group-hover:border-[#C9A962] transition-colors">
                                                                <span className="text-sm font-bold text-white font-mono">
                                                                    {member.profiles?.full_name?.substring(0, 2).toUpperCase() || member.profiles?.email?.substring(0, 2).toUpperCase() || '?'}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white truncate font-sans">
                                                                    {member.profiles?.full_name || member.profiles?.email || 'Unknown User'}
                                                                </p>
                                                                <p className="text-xs text-gray-500 font-mono">{member.profiles?.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-xs font-mono uppercase tracking-wider text-gray-300 bg-[#333333] px-2 py-1 rounded">
                                                            {member.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="text-xs text-gray-500 font-mono">
                                                            {new Date(member.responded_at || member.invited_at).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        {isOwner && member.user_id !== user?.id && (
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        setMemberToEdit(member)
                                                                        setNewRole(member.role as 'admin' | 'member')
                                                                        setEditMemberModalOpen(true)
                                                                    }}
                                                                    className="p-2 text-gray-400 hover:text-white hover:bg-[#333333] rounded transition-colors"
                                                                    title="Edit Role"
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </button>
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        setMemberToRemove(member.id)
                                                                    }}
                                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-[#333333] rounded transition-colors"
                                                                    title="Remove Member"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-sm text-gray-500 font-mono">No active team members yet</p>
                                </div>
                            )}
                        </div>

                        {/* Rejected/Other Members (Hidden by default or shown if needed, currently skipping to keep UI clean) */}
                    </div>
                )}
            </div>

            {/* Modals */}
            {id && (
                <InviteTeamModal
                    isOpen={inviteModalOpen}
                    onClose={() => setInviteModalOpen(false)}
                    projectId={id}
                    onSuccess={loadProject}
                />
            )}

            {id && project && (
                <CreateTaskModal
                    isOpen={createTaskModalOpen}
                    onClose={closeTaskModal}
                    projectId={id}
                    members={project.members || []}
                    onSuccess={() => {
                        loadTasks()
                        loadProject()
                    }}
                    taskToEdit={taskToEdit}
                />
            )}

            {project && (
                <CreateProjectModal
                    isOpen={editProjectModalOpen}
                    onClose={() => setEditProjectModalOpen(false)}
                    onSuccess={loadProject}
                    projectToEdit={project}
                />
            )}
            
            {/* Delete Project Confirmation Modal */}
            <Modal isOpen={deleteProjectModalOpen} onClose={() => setDeleteProjectModalOpen(false)} title="Delete Project">
                <div className="space-y-4">
                    <p className="text-gray-300 font-mono">Are you sure you want to delete this project? This action cannot be undone.</p>
                    <div className="flex gap-3 justify-end">
                         <button
                            onClick={() => setDeleteProjectModalOpen(false)}
                            className="px-4 py-2 border border-[#333333] text-white hover:bg-[#333333] transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteProject}
                            className="px-4 py-2 bg-red-900/50 border border-red-900 text-red-400 hover:bg-red-900 hover:text-white transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                        >
                            Delete Project
                        </button>
                    </div>
                </div>
            </Modal>
            
            {/* Delete Task Confirmation Modal */}
            <Modal isOpen={!!taskToDelete} onClose={() => setTaskToDelete(null)} title="Delete Task">
                 <div className="space-y-4">
                    <p className="text-gray-300 font-mono">Are you sure you want to delete this task?</p>
                    <div className="flex gap-3 justify-end">
                         <button
                            onClick={() => setTaskToDelete(null)}
                            className="px-4 py-2 border border-[#333333] text-white hover:bg-[#333333] transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => taskToDelete && handleDeleteTask(taskToDelete)}
                            className="px-4 py-2 bg-red-900/50 border border-red-900 text-red-400 hover:bg-red-900 hover:text-white transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                        >
                            Delete Task
                        </button>
                    </div>
                </div>
            </Modal>

             {/* Remove Member Confirmation Modal */}
             <Modal isOpen={!!memberToRemove} onClose={() => setMemberToRemove(null)} title="Remove Member">
                 <div className="space-y-4">
                    <p className="text-gray-300 font-mono">Are you sure you want to remove this member from the team?</p>
                    <div className="flex gap-3 justify-end">
                         <button
                            onClick={() => setMemberToRemove(null)}
                            className="px-4 py-2 border border-[#333333] text-white hover:bg-[#333333] transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => memberToRemove && handleRemoveMember(memberToRemove)}
                            className="px-4 py-2 bg-red-900/50 border border-red-900 text-red-400 hover:bg-red-900 hover:text-white transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                        >
                            Remove Member
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Edit Member Role Modal */}
            <Modal isOpen={editMemberModalOpen} onClose={() => setEditMemberModalOpen(false)} title="Edit Member Role">
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">
                            Select Role
                        </label>
                        <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value as 'admin' | 'member')}
                            className="w-full bg-[#0A0A0A] border border-[#333333] text-white px-4 py-2 focus:outline-none focus:border-[#C9A962] font-mono text-sm"
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-2 font-mono">
                            Admins can manage tasks and view project settings. Members can only view and complete assigned tasks.
                        </p>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setEditMemberModalOpen(false)}
                            className="px-4 py-2 border border-[#333333] text-white hover:bg-[#333333] transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateMemberRole}
                            className="px-4 py-2 bg-[#C9A962] text-[#0A0A0A] hover:bg-[#b09355] transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                        >
                            Update Role
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
