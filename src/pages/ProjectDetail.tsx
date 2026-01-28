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
            <div className="flex items-center justify-center min-h-screen">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="text-gray-600 mb-4">Project not found</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                    Go to Dashboard
                </button>
            </div>
        )
    }

    const totalCost = tasks.reduce((sum, task) => sum + task.cost, 0)
    const paidAmount = tasks
        .filter(t => t.payment_status === 'paid')
        .reduce((sum, task) => sum + task.cost, 0)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                            {project.description && (
                                <p className="text-gray-600 mt-2">{project.description}</p>
                            )}
                        </div>

                        <button
                            onClick={() => setInviteModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            <UserPlus className="h-4 w-4" />
                            Invite Team
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="text-lg font-semibold text-gray-900">{project.status}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Budget</p>
                            <p className="text-lg font-semibold text-gray-900">${project.budget.toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Total Cost</p>
                            <p className="text-lg font-semibold text-gray-900">${totalCost.toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Paid</p>
                            <p className="text-lg font-semibold text-emerald-600">${paidAmount.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Team Members */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h2>
                        <div className="space-y-3">
                            {project.members && project.members.length > 0 ? (
                                project.members.map((member) => (
                                    <div key={member.id} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                                            {member.profiles?.avatar_url ? (
                                                <img src={member.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-medium text-emerald-700">
                                                    {member.profiles?.full_name?.charAt(0).toUpperCase() || member.profiles?.email?.charAt(0).toUpperCase() || '?'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {member.profiles?.full_name || member.profiles?.email || 'Unknown User'}
                                            </p>
                                            <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                                        </div>
                                        <span
                                            className={`text-xs px-2 py-1 rounded ${member.status === 'accepted'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                }`}
                                        >
                                            {member.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No team members yet</p>
                            )}
                        </div>
                    </div>

                    {/* Tasks */}
                    <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
                            <button 
                                onClick={() => setCreateTaskModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
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
                                        className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{task.title}</h3>
                                                {task.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded ${task.status === 'completed'
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : task.status === 'in_progress'
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'bg-gray-100 text-gray-700'
                                                            }`}
                                                    >
                                                        {task.status.replace('_', ' ')}
                                                    </span>
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded ${task.priority === 'urgent'
                                                                ? 'bg-red-100 text-red-700'
                                                                : task.priority === 'high'
                                                                    ? 'bg-orange-100 text-orange-700'
                                                                    : 'bg-gray-100 text-gray-700'
                                                            }`}
                                                    >
                                                        {task.priority}
                                                    </span>
                                                    {task.assignee && (
                                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                                            Assigned to: <span className="font-medium text-gray-700">{task.assignee.full_name || task.assignee.email}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 text-gray-900 font-semibold">
                                                    <DollarSign className="h-4 w-4" />
                                                    {task.cost.toFixed(2)}
                                                </div>
                                                <span
                                                    className={`text-xs ${task.payment_status === 'paid'
                                                            ? 'text-emerald-600'
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
                                <div className="text-center py-12">
                                    <p className="text-gray-500 mb-4">No tasks yet</p>
                                    <button 
                                        onClick={() => setCreateTaskModalOpen(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create First Task
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
