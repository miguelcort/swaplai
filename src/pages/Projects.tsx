import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectsApi } from '../lib/projectsApi'
import type { Project } from '../types/projects'
import { CreateTaskModal } from '../components/projects/CreateTaskModal'
import { NotificationBell } from '../components/layout/NotificationBell'

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
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

    const handleCreateTaskClick = (project: Project) => {
        setSelectedProject(project)
        setIsTaskModalOpen(true)
    }

    const handleTaskSuccess = () => {
        loadProjects()
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
                    <div>
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
                                Create your first project from the dashboard to start adding tasks.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="bg-[#0A0A0A] rounded-none border border-[#333333] p-5 flex flex-col justify-between hover:border-primary transition-colors group relative"
                                >
                                    <div className="absolute top-3 right-3 text-xs font-mono text-primary opacity-50">
                                        {(project.status || '').toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white font-sans uppercase tracking-wide pr-8">{project.name}</h2>
                                        {project.description && (
                                            <p className="text-sm text-gray-400 mt-2 line-clamp-3 font-mono">
                                                {project.description}
                                            </p>
                                        )}
                                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500 font-mono uppercase tracking-wider">
                                            <span>
                                                Budget: ${project.budget.toFixed(2)}
                                            </span>
                                            <span>
                                                Created: {new Date(project.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between gap-3">
                                        <button
                                            onClick={() => navigate(`/projects/${project.id}`)}
                                            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-[#333333] text-sm font-medium text-white rounded-none hover:bg-[#333333] transition-colors font-mono uppercase"
                                        >
                                            View details
                                        </button>
                                        <button
                                            onClick={() => handleCreateTaskClick(project)}
                                            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-primary text-sm font-medium text-black rounded-none hover:bg-primary/90 transition-colors font-mono uppercase"
                                        >
                                            Create task
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
        </div>
    )
}

