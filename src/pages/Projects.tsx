import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { projectsApi } from '../lib/projectsApi'
import type { Project, CreateProjectInput } from '../types/projects'
import { CreateTaskModal } from '../components/projects/CreateTaskModal'
import { CreateProjectModal } from '../components/projects/CreateProjectModal'
import { NotificationBell } from '../components/layout/NotificationBell'
import { Modal } from '../components/ui/Modal'
import { Plus, Trash2, Edit2, Copy } from 'lucide-react'

const HABIT_TEMPLATES = [
    {
        name: "Morning Routine Protocol",
        description: "Optimized start: Hydration, Sunlight exposure, Movement, and Mindfulness.",
        budget: 0
    },
    {
        name: "Deep Work Block",
        description: "90-minute focused session with zero distractions.",
        budget: 0
    },
    {
        name: "Evening Wind-Down",
        description: "Digital sunset and preparation for restorative sleep.",
        budget: 0
    }
]

const SUCCESS_TEMPLATES = [
    {
        name: "Elon Musk's First Principles",
        description: "Boil things down to their fundamental truths and reason up from there.",
        budget: 0
    },
    {
        name: "Bezos' 6-Page Memo",
        description: "Replace PowerPoint with narrative memos for high-quality decisions.",
        budget: 0
    },
    {
        name: "Jobs' Minimalism",
        description: "Focus on the essential, eliminate the rest. Radical simplification.",
        budget: 0
    }
]

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
    
    // Project Management State
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null)
    const [initialProjectData, setInitialProjectData] = useState<Partial<CreateProjectInput> | null>(null)
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
        setInitialProjectData(null)
        setIsProjectModalOpen(true)
    }

    const handleUseTemplate = (template: Partial<CreateProjectInput>) => {
        setProjectToEdit(null)
        setInitialProjectData(template)
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
        <div className="flex flex-col h-full bg-bg-dark font-sans">
            <div className="bg-bg-dark border-b border-border px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-primary font-serif tracking-tight">Projects</h1>
                        <p className="text-sm text-text-secondary mt-1 font-mono uppercase tracking-wider">
                            View all your projects and create tasks for each one.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleCreateProject}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-bg-dark hover:bg-primary/90 transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                        >
                            <Plus className="h-4 w-4" />
                            New Project
                        </button>
                        <NotificationBell />
                    </div>
                </div>
            </div>

            <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-none text-sm text-red-400 font-mono">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="bg-bg-dark rounded-none border border-border p-12 text-center">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                                <p className="mt-4 text-text-secondary font-mono">Loading projects...</p>
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="bg-bg-dark rounded-none border border-border p-12 text-center">
                                <h2 className="text-lg font-semibold text-text-primary mb-2 font-sans">No projects yet</h2>
                                <p className="text-text-secondary mb-6 font-mono">
                                    Create your first project to start adding tasks.
                                </p>
                                <button
                                    onClick={handleCreateProject}
                                    className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-primary text-bg-dark hover:bg-primary/90 transition-colors font-mono uppercase text-xs tracking-wider font-bold"
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
                                        className="bg-bg-dark rounded-none border border-border p-5 flex flex-col justify-between hover:border-primary transition-colors group relative cursor-pointer"
                                        onClick={() => navigate(`/projects/${project.id}`)}
                                    >
                                        <div className="absolute top-3 right-3 flex items-center gap-2">
                                            <div className="text-xs font-mono text-primary opacity-50 uppercase tracking-wider">
                                                {(project.status || '').toUpperCase()}
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => handleEditProject(project, e)}
                                                    className="p-1.5 text-text-secondary hover:text-text-primary transition-colors"
                                                    title="Edit Project"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteClick(project, e)}
                                                    className="p-1.5 text-text-secondary hover:text-red-500 transition-colors"
                                                    title="Delete Project"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <h2 className="text-lg font-bold text-text-primary font-sans uppercase tracking-wide pr-16 truncate">{project.name}</h2>
                                            {project.description && (
                                                <p className="text-sm text-text-secondary mt-2 line-clamp-2 font-mono h-10">
                                                    {project.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-6 flex items-center gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    navigate(`/projects/${project.id}`)
                                                }}
                                                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-border text-sm font-medium text-text-primary rounded-none hover:bg-primary/5 transition-colors font-mono uppercase tracking-wider"
                                            >
                                                Details
                                            </button>
                                            <button
                                                onClick={(e) => handleCreateTaskClick(project, e)}
                                                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-primary text-sm font-medium text-bg-dark rounded-none hover:bg-primary/90 transition-colors font-mono uppercase tracking-wider font-bold"
                                            >
                                                Add task
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {!loading && (
                        <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-border">
                            {/* Healthy Habits */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-text-primary font-serif tracking-tight flex items-center gap-2">
                                    <span className="text-primary">✦</span> Healthy Habits Templates
                                </h3>
                                <div className="space-y-3">
                                    {HABIT_TEMPLATES.map((template, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => handleUseTemplate(template)}
                                            className="group bg-bg-dark border border-border p-4 hover:border-primary transition-all cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-text-primary group-hover:text-primary transition-colors">{template.name}</h4>
                                                <Copy className="h-4 w-4 text-text-secondary group-hover:text-primary" />
                                            </div>
                                            <p className="text-sm text-text-secondary font-mono line-clamp-2">{template.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Successful People */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-text-primary font-serif tracking-tight flex items-center gap-2">
                                    <span className="text-primary">✦</span> Successful People Routines
                                </h3>
                                <div className="space-y-3">
                                    {SUCCESS_TEMPLATES.map((template, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => handleUseTemplate(template)}
                                            className="group bg-bg-dark border border-border p-4 hover:border-primary transition-all cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-text-primary group-hover:text-primary transition-colors">{template.name}</h4>
                                                <Copy className="h-4 w-4 text-text-secondary group-hover:text-primary" />
                                            </div>
                                            <p className="text-sm text-text-secondary font-mono line-clamp-2">{template.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
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
                onClose={() => {
                    setIsProjectModalOpen(false)
                    setInitialProjectData(null)
                }}
                onSuccess={() => {
                    loadProjects()
                    setIsProjectModalOpen(false)
                    setInitialProjectData(null)
                }}
                projectToEdit={projectToEdit}
                initialData={initialProjectData}
            />

            {/* Delete Project Confirmation Modal */}
            <Modal isOpen={!!projectToDelete} onClose={() => setProjectToDelete(null)} title="Delete Project">
                <div className="space-y-4">
                    <p className="text-text-secondary font-mono">
                        Are you sure you want to delete <span className="text-text-primary font-bold">{projectToDelete?.name}</span>?
                        <br/>This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setProjectToDelete(null)}
                            className="px-4 py-2 border border-border text-text-primary hover:bg-primary/5 transition-colors font-mono uppercase text-xs tracking-wider font-bold"
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

