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
        <div className="flex flex-col h-full bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Projects</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            View all your projects and create tasks for each one.
                        </p>
                    </div>
                    <div>
                        <NotificationBell />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
                            <p className="mt-4 text-gray-600">Loading projects...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h2>
                            <p className="text-gray-500 mb-6">
                                Create your first project from the dashboard to start adding tasks.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col justify-between"
                                >
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
                                        {project.description && (
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                                                {project.description}
                                            </p>
                                        )}
                                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                                                Status: {project.status}
                                            </span>
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
                                            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            View details
                                        </button>
                                        <button
                                            onClick={() => handleCreateTaskClick(project)}
                                            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-sm font-medium text-white rounded-lg hover:bg-emerald-700 transition-colors"
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

