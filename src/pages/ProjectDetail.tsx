import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, Plus, DollarSign } from 'lucide-react'
import type { Project, Task } from '../types/projects'
import { projectsApi, tasksApi } from '../lib/projectsApi'
import { InviteTeamModal } from '../components/projects/InviteTeamModal'
import { CreateTaskModal } from '../components/projects/CreateTaskModal'

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [project, setProject] = useState<Project | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [inviteModalOpen, setInviteModalOpen] = useState(false)
    const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false)

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
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 font-mono text-sm uppercase tracking-wider transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white font-sans uppercase tracking-wide">{project.name}</h1>
                            {project.description && (
                                <p className="text-gray-400 mt-2 font-mono text-sm max-w-2xl">{project.description}</p>
                            )}
                        </div>

                        <button
                            onClick={() => setInviteModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-[#333333] text-white hover:bg-[#333333] transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                        >
                            <UserPlus className="h-4 w-4" />
                            Invite Team
                        </button>
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
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Team Members */}
                    <div className="bg-[#0A0A0A] border border-[#333333] p-6">
                        <h2 className="text-lg font-bold text-white mb-6 font-sans uppercase tracking-wide border-b border-[#333333] pb-4">Team Members</h2>
                        <div className="space-y-4">
                            {project.members && project.members.length > 0 ? (
                                project.members.map((member) => (
                                    <div key={member.id} className="flex items-center gap-3 group">
                                        <div className="w-10 h-10 bg-black border border-[#333333] flex items-center justify-center overflow-hidden group-hover:border-[#C9A962] transition-colors">
                                            <span className="text-sm font-bold text-white font-mono">
                                                {member.profiles?.full_name?.substring(0, 2).toUpperCase() || member.profiles?.email?.substring(0, 2).toUpperCase() || '?'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate font-sans">
                                                {member.profiles?.full_name || member.profiles?.email || 'Unknown User'}
                                            </p>
                                            <p className="text-xs text-gray-500 capitalize font-mono">{member.role}</p>
                                        </div>
                                        <span
                                            className={`text-xs px-2 py-1 font-mono uppercase tracking-wider border ${member.status === 'accepted'
                                                    ? 'border-[#C9A962] text-[#C9A962]'
                                                    : 'border-yellow-700 text-yellow-700'
                                                }`}
                                        >
                                            {member.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 font-mono">No team members yet</p>
                            )}
                        </div>
                    </div>

                    {/* Tasks */}
                    <div className="lg:col-span-2 bg-[#0A0A0A] border border-[#333333] p-6">
                        <div className="flex items-center justify-between mb-6 border-b border-[#333333] pb-4">
                            <h2 className="text-lg font-bold text-white font-sans uppercase tracking-wide">Tasks</h2>
                            <button 
                                onClick={() => setCreateTaskModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#C9A962] text-[#0A0A0A] hover:bg-[#b09355] transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                            >
                                <Plus className="h-4 w-4" />
                                Add Task
                            </button>
                        </div>

                        <div className="space-y-3">
                            {tasks.length > 0 ? (
                                tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="border border-[#333333] p-4 hover:border-[#C9A962] transition-colors group bg-[#0F0F0F]"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-white font-sans uppercase tracking-wide text-sm">{task.title}</h3>
                                                {task.description && (
                                                    <p className="text-sm text-gray-400 mt-2 font-mono leading-relaxed">{task.description}</p>
                                                )}
                                                <div className="flex flex-wrap items-center gap-2 mt-4">
                                                    <span
                                                        className={`text-xs px-2 py-1 font-mono uppercase tracking-wider border ${task.status === 'completed'
                                                                ? 'border-emerald-900 text-emerald-500'
                                                                : task.status === 'in_progress'
                                                                    ? 'border-blue-900 text-blue-500'
                                                                    : 'border-[#333333] text-gray-500'
                                                            }`}
                                                    >
                                                        {task.status.replace('_', ' ')}
                                                    </span>
                                                    <span
                                                        className={`text-xs px-2 py-1 font-mono uppercase tracking-wider border ${task.priority === 'urgent'
                                                                ? 'border-red-900 text-red-500'
                                                                : task.priority === 'high'
                                                                    ? 'border-orange-900 text-orange-500'
                                                                    : 'border-[#333333] text-gray-500'
                                                            }`}
                                                    >
                                                        {task.priority}
                                                    </span>
                                                    {task.assignee && (
                                                        <span className="text-xs text-gray-500 flex items-center gap-1 font-mono ml-2">
                                                            Assigned to: <span className="font-bold text-gray-300">{task.assignee.full_name || task.assignee.email}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right pl-4">
                                                <div className="flex items-center justify-end gap-1 text-[#C9A962] font-bold font-mono">
                                                    <DollarSign className="h-4 w-4" />
                                                    {task.cost.toFixed(2)}
                                                </div>
                                                <span
                                                    className={`text-xs block mt-1 font-mono uppercase tracking-wider ${task.payment_status === 'paid'
                                                            ? 'text-emerald-500'
                                                            : 'text-gray-500'
                                                        }`}
                                                >
                                                    {task.payment_status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 border border-dashed border-[#333333]">
                                    <p className="text-gray-500 mb-4 font-mono text-sm">NO TASKS IN SYSTEM</p>
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
                    </div>
                </div>
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
                    onClose={() => setCreateTaskModalOpen(false)}
                    projectId={id}
                    members={project.members || []}
                    onSuccess={() => {
                        loadTasks()
                        loadProject()
                    }}
                />
            )}
        </div>
    )
}
