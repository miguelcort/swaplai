import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreVertical, Plus } from 'lucide-react'
import type { Project, ProjectStatus } from '../../types/projects'
import { projectsApi } from '../../lib/projectsApi'
import { CreateProjectModal } from '../projects/CreateProjectModal'
import { InviteTeamModal } from '../projects/InviteTeamModal'

const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
        case 'Active':
            return 'bg-emerald-100 text-emerald-700'
        case 'Recent':
            return 'bg-blue-100 text-blue-700'
        case 'Idle':
            return 'bg-yellow-100 text-yellow-700'
        case 'Completed':
            return 'bg-gray-100 text-gray-700'
        case 'Archived':
            return 'bg-gray-100 text-gray-500'
        default:
            return 'bg-gray-100 text-gray-700'
    }
}

const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500'
    if (progress < 70) return 'bg-yellow-500'
    return 'bg-emerald-500'
}

const calculateProgress = (project: Project): number => {
    if (!project.tasks || project.tasks.length === 0) return 0
    const completedTasks = project.tasks.filter(t => t.status === 'completed').length
    return Math.round((completedTasks / project.tasks.length) * 100)
}

export function ProjectsTable() {
    const navigate = useNavigate()
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [inviteModalOpen, setInviteModalOpen] = useState(false)
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

    const loadProjects = async () => {
        try {
            setLoading(true)
            const data = await projectsApi.getProjects()
            // Add progress calculation
            const projectsWithProgress = data.map(p => ({
                ...p,
                progress: calculateProgress(p)
            }))
            setProjects(projectsWithProgress)
        } catch (error) {
            console.error('Failed to load projects:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadProjects()
    }, [])

    const handleAction = async (projectId: string, action: 'open' | 'manage' | 'remove') => {
        setOpenMenuId(null)

        if (action === 'open') {
            navigate(`/projects/${projectId}`)
        } else if (action === 'manage') {
            setSelectedProjectId(projectId)
            setInviteModalOpen(true)
        } else if (action === 'remove') {
            if (confirm('Are you sure you want to delete this project?')) {
                try {
                    await projectsApi.deleteProject(projectId)
                    setProjects(prev => prev.filter(p => p.id !== projectId))
                } catch (error) {
                    console.error('Failed to delete project:', error)
                    alert('Failed to delete project')
                }
            }
        }
    }

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading projects...</p>
            </div>
        )
    }

    return (
        <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        New Project
                    </button>
                </div>

                {/* Table */}
                {projects.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Project
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Activity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Progress
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Team
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                                        {/* Project Name */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {project.name}
                                            </div>
                                            {project.description && (
                                                <div className="text-xs text-gray-500 truncate max-w-xs">
                                                    {project.description}
                                                </div>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(
                                                    project.status
                                                )}`}
                                            >
                                                {project.status}
                                            </span>
                                        </td>

                                        {/* Created Date */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </td>

                                        {/* Last Activity */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(project.updated_at).toLocaleDateString()}
                                        </td>

                                        {/* Progress */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
                                                    <div
                                                        className={`h-2 rounded-full ${getProgressColor(
                                                            project.progress || 0
                                                        )}`}
                                                        style={{ width: `${project.progress || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-600">{project.progress || 0}%</span>
                                            </div>
                                        </td>

                                        {/* Team */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex -space-x-2">
                                                {project.members && project.members.slice(0, 4).map((member) => (
                                                    <div
                                                        key={member.id}
                                                        className="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center"
                                                        title={member.user?.email || 'User'}
                                                    >
                                                        <span className="text-xs font-medium text-emerald-700">
                                                            {member.user?.email?.charAt(0).toUpperCase() || '?'}
                                                        </span>
                                                    </div>
                                                ))}
                                                {project.members && project.members.length > 4 && (
                                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center">
                                                        <span className="text-xs font-medium text-gray-600">
                                                            +{project.members.length - 4}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Action */}
                                        <td className="px-6 py-4 whitespace-nowrap relative">
                                            <button
                                                onClick={() =>
                                                    setOpenMenuId(openMenuId === project.id ? null : project.id)
                                                }
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                <MoreVertical className="h-5 w-5" />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {openMenuId === project.id && (
                                                <>
                                                    {/* Backdrop */}
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setOpenMenuId(null)}
                                                    />

                                                    {/* Menu */}
                                                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                                        <button
                                                            onClick={() => handleAction(project.id, 'open')}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                        >
                                                            Open
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(project.id, 'manage')}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                        >
                                                            Manage Team
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(project.id, 'remove')}
                                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="px-6 py-12 text-center">
                        <p className="text-gray-500 mb-4">No projects yet</p>
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                        >
                            <Plus className="h-4 w-4" />
                            Create Your First Project
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateProjectModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={loadProjects}
            />

            {selectedProjectId && (
                <InviteTeamModal
                    isOpen={inviteModalOpen}
                    onClose={() => {
                        setInviteModalOpen(false)
                        setSelectedProjectId(null)
                    }}
                    projectId={selectedProjectId}
                    onSuccess={loadProjects}
                />
            )}
        </>
    )
}
