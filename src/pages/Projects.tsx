import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectsApi } from '../lib/projectsApi'
import type { Project } from '../types/projects'
import { CreateTaskModal } from '../components/projects/CreateTaskModal'
import { CreateProjectModal } from '../components/projects/CreateProjectModal'
import { NotificationBell } from '../components/layout/NotificationBell'
import { Modal } from '../components/ui/Modal'
import { Plus, Trash2, Edit2 } from 'lucide-react'

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
    
    // Project Management State
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null)
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
    
    const navigate = useNavigate()

    const loadProjects = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await projectsApi.getProjects()
            setProjects(data)
        } catch (err: any) {
            setError(err.message || 'Failed to load projects')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadProjects()
    }, [])

    const handleCreateTaskClick = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedProject(project)
        setIsTaskModalOpen(true)
    }

    const handleTaskSuccess = () => {
        loadProjects()
    }

    const handleCreateProject = () => {
        setProjectToEdit(null)
        setIsProjectModalOpen(true)
    }

    const handleEditProject = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation()
        setProjectToEdit(project)
        setIsProjectModalOpen(true)
    }

    const handleDeleteClick = (project: Project, e: React.MouseEvent) => {
        e.stopPropagation()
        setProjectToDelete(project)
    }

    const confirmDeleteProject = async () => {
        if (!projectToDelete) return
        try {
            await projectsApi.deleteProject(projectToDelete.id)
            setProjectToDelete(null)
            loadProjects()
        } catch (error) {
            console.error('Failed to delete project:', error)
            setError('Failed to delete project')
        }
    }

    return (
        <div className="flex flex-col h-full bg-[#0A0A0A] font-sans">
            <div className="bg-[#0A0A0A] border-b border-[#333333] px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white font-serif tracking-tight">Projects</h1>
                        <p className="text-sm text-gray-400 mt-1 font-mono uppercase tracking-wider">
                            View all your projects and create tasks for each one.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleCreateProject}
                            className="flex items-center gap-2 px-4 py-2 bg-[#C9A962] text-[#0A0A0A] hover:bg-[#b09355] transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                        >
                            <Plus className="h-4 w-4" />
                            New Project
                        </button>
                        <NotificationBell />
                    </div>
                </div>
            </div>

            <div className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {error && (
                        <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-none text-sm text-red-400 font-mono">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="bg-[#0A0A0A] rounded-none border border-[#333333] p-12 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                            <p className="mt-4 text-gray-400 font-mono">Loading projects...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="bg-[#0A0A0A] rounded-none border border-[#333333] p-12 text-center">
                            <h2 className="text-lg font-semibold text-white mb-2 font-sans">No projects yet</h2>
                            <p className="text-gray-500 mb-6 font-mono">
                                Create your first project to start adding tasks.
                            </p>
                            <button
                                onClick={handleCreateProject}
                                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[#C9A962] text-[#0A0A0A] hover:bg-[#b09355] transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                            >
                                <Plus className="h-4 w-4" />
                                Create Project
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="bg-[#0A0A0A] rounded-none border border-[#333333] p-5 flex flex-col justify-between hover:border-[#C9A962] transition-colors group relative cursor-pointer"
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                >
                                    <div className="absolute top-3 right-3 flex items-center gap-2">
                                        <div className="text-xs font-mono text-[#C9A962] opacity-50 uppercase tracking-wider">
                                            {(project.status || '').toUpperCase()}
                                        </div>
                                    </div>
                                    
                                    {/* Edit/Delete Actions - Visible on Hover */}
                                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0A0A0A] pl-2">
                                        <button
                                            onClick={(e) => handleEditProject(project, e)}
                                            className="p-1.5 text-gray-500 hover:text-white transition-colors"
                                            title="Edit Project"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteClick(project, e)}
                                            className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                                            title="Delete Project"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-bold text-white font-sans uppercase tracking-wide pr-16 truncate">{project.name}</h2>
                                        {project.description && (
                                            <p className="text-sm text-gray-400 mt-2 line-clamp-2 font-mono h-10">
                                                {project.description}
                                            </p>
                                        )}
                                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500 font-mono uppercase tracking-wider">
                                            <span>
                                                Budget: <span className="text-[#C9A962]">${project.budget.toFixed(2)}</span>
                                            </span>
                                            <span className="text-[#333333]">|</span>
                                            <span>
                                                {new Date(project.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                navigate(`/projects/${project.id}`)
                                            }}
                                            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-[#333333] text-sm font-medium text-white rounded-none hover:bg-[#333333] transition-colors font-mono uppercase tracking-wider"
                                        >
                                            Details
                                        </button>
                                        <button
                                            onClick={(e) => handleCreateTaskClick(project, e)}
                                            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-[#C9A962] text-sm font-medium text-[#0A0A0A] rounded-none hover:bg-[#b09355] transition-colors font-mono uppercase tracking-wider font-bold"
                                        >
                                            Add task
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedProject && (
                <CreateTaskModal
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    projectId={selectedProject.id}
                    members={selectedProject.members || []}
                    onSuccess={handleTaskSuccess}
                />
            )}

            <CreateProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onSuccess={() => {
                    loadProjects()
                    setIsProjectModalOpen(false)
                }}
                projectToEdit={projectToEdit}
            />

            {/* Delete Project Confirmation Modal */}
            <Modal isOpen={!!projectToDelete} onClose={() => setProjectToDelete(null)} title="Delete Project">
                <div className="space-y-4">
                    <p className="text-gray-300 font-mono">
                        Are you sure you want to delete <span className="text-white font-bold">{projectToDelete?.name}</span>?
                        <br/>This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setProjectToDelete(null)}
                            className="px-4 py-2 border border-[#333333] text-white hover:bg-[#333333] transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDeleteProject}
                            className="px-4 py-2 bg-red-900/50 border border-red-900 text-red-400 hover:bg-red-900 hover:text-white transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                        >
                            Delete Project
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

