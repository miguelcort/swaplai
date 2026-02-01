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
            return 'bg-primary text-black border-transparent'
        case 'Recent':
            return 'bg-[#333333] text-white border-transparent'
        case 'Idle':
            return 'bg-[#333333] text-gray-400 border-transparent'
        case 'Completed':
            return 'bg-white text-black border-transparent'
        case 'Archived':
            return 'bg-transparent text-gray-500 border border-[#333333]'
        default:
            return 'bg-[#333333] text-white border-transparent'
    }
}

const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500'
    if (progress >= 50) return 'bg-primary'
    if (progress >= 25) return 'bg-yellow-500'
    return 'bg-red-500'
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
            <div className="bg-[#0A0A0A] rounded-none border border-[#333333] p-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4 text-gray-400 font-mono">Loading projects...</p>
            </div>
        )
    }

    return (
        <>
            <div className="bg-[#0A0A0A] rounded-none border border-[#333333] overflow-hidden relative">
                 <div className="absolute top-4 left-4 text-xs font-mono text-primary opacity-50 z-10">07</div>
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#333333] flex items-center justify-between pl-12">
                    <h2 className="text-lg font-semibold text-white uppercase tracking-wider font-sans">Projects</h2>
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-none hover:bg-gray-200 transition-colors text-sm font-medium uppercase tracking-wider font-mono"
                    >
                        <Plus className="h-4 w-4" />
                        New Project
                    </button>
                </div>

                {/* Table */}
                {projects.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-primary border-b border-[#333333]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider font-mono">
                                        Project
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider font-mono">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider font-mono">
                                        Created Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider font-mono">
                                        Last Activity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider font-mono">
                                        Progress
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider font-mono">
                                        Team
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider font-mono">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-[#0A0A0A] divide-y divide-[#333333]">
                                {projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-[#333333] transition-colors group">
                                        {/* Project Name */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-white font-sans">
                                                {project.name}
                                            </div>
                                            {project.description && (
                                                <div className="text-xs text-gray-500 truncate max-w-xs font-mono">
                                                    {project.description}
                                                </div>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex px-2.5 py-1 rounded-none text-xs font-medium font-mono uppercase tracking-wider ${getStatusColor(
                                                    project.status
                                                )}`}
                                            >
                                                {project.status}
                                            </span>
                                        </td>

                                        {/* Created Date */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </td>

                                        {/* Last Activity */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                                            {new Date(project.updated_at).toLocaleDateString()}
                                        </td>

                                        {/* Progress */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-[#333333] rounded-none h-1 max-w-[120px]">
                                                    <div
                                                        className={`h-1 rounded-none ${getProgressColor(
                                                            project.progress || 0
                                                        )}`}
                                                        style={{ width: `${project.progress || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-400 font-mono">{project.progress || 0}%</span>
                                            </div>
                                        </td>

                                        {/* Team */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex -space-x-2">
                                                {project.members && project.members.slice(0, 4).map((member) => (
                                                    <div
                                                        key={member.id}
                                                        className="w-8 h-8 rounded-none border border-[#0A0A0A] bg-[#333333] flex items-center justify-center text-white text-xs font-mono"
                                                        title={member.profiles?.email || 'User'}
                                                    >
                                                        {member.profiles?.email?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                ))}
                                                {project.members && project.members.length > 4 && (
                                                    <div className="w-8 h-8 rounded-none border border-[#0A0A0A] bg-[#333333] flex items-center justify-center">
                                                        <span className="text-xs font-medium text-gray-400 font-mono">
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
                                                className="text-gray-400 hover:text-white transition-colors"
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
                                                    <div className="absolute right-0 mt-2 w-40 bg-[#0A0A0A] rounded-none shadow-lg border border-[#333333] py-1 z-20">
                                                        <button
                                                            onClick={() => handleAction(project.id, 'open')}
                                                            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] transition-colors font-mono uppercase tracking-wider"
                                                        >
                                                            Open
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(project.id, 'manage')}
                                                            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] transition-colors font-mono uppercase tracking-wider"
                                                        >
                                                            Manage Team
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(project.id, 'remove')}
                                                            className="w-full px-4 py-2 text-left text-sm text-accent-red hover:bg-[#333333] transition-colors font-mono uppercase tracking-wider"
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
                        <p className="text-gray-500 mb-4 font-mono">No projects yet</p>
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black rounded-none hover:bg-gray-200 transition-colors text-sm font-medium uppercase tracking-wider font-mono"
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
