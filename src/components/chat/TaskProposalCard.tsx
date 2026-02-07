import { useState, useEffect } from 'react'
import { Check, CheckSquare, Loader2, ChevronDown } from 'lucide-react'
import { projectsApi, tasksApi } from '../../lib/projectsApi'
import { toast } from '../../hooks/useToast'
import { type Project, type TaskPriority } from '../../types/projects'

interface TaskProposalData {
    title: string
    description: string
    priority?: TaskPriority
    due_date?: string
    cost?: number
    estimated_duration?: string
}

interface TaskProposalCardProps {
    data: TaskProposalData
    onDismiss: () => void
}

export function TaskProposalCard({ data, onDismiss }: TaskProposalCardProps) {
    const [isCreating, setIsCreating] = useState(false)
    const [isCreated, setIsCreated] = useState(false)
    const [projects, setProjects] = useState<Project[]>([])
    const [selectedProjectId, setSelectedProjectId] = useState<string>('')
    const [isLoadingProjects, setIsLoadingProjects] = useState(true)

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await projectsApi.getProjects()
                setProjects(data)
                if (data.length > 0) {
                    setSelectedProjectId(data[0].id)
                }
            } catch (error) {
                console.error('Failed to fetch projects:', error)
            } finally {
                setIsLoadingProjects(false)
            }
        }
        fetchProjects()
    }, [])

    const handleCreate = async () => {
        if (!selectedProjectId) {
             toast({
                title: "Error",
                description: "Please select a project first.",
                type: "error"
            })
            return
        }

        setIsCreating(true)
        try {
            await tasksApi.createTask(selectedProjectId, {
                title: data.title,
                description: data.description,
                priority: data.priority || 'medium',
                cost: data.cost || 0,
                due_date: data.due_date,
                duration: data.estimated_duration,
                assigned_to: projects.find(p => p.id === selectedProjectId)?.owner_id // Default to project owner
            })
            setIsCreated(true)
            toast({
                title: "Task Created",
                description: `Task "${data.title}" has been added.`,
                type: "success"
            })
            setTimeout(() => {
                onDismiss()
            }, 2000)
        } catch (error) {
            console.error('Failed to create task:', error)
            toast({
                title: "Error",
                description: "Failed to create task. Please try again.",
                type: "error"
            })
        } finally {
            setIsCreating(false)
        }
    }

    if (isCreated) {
        return (
            <div className="bg-accent-green/10 border border-accent-green/30 rounded-none p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="h-8 w-8 rounded-full bg-accent-green/20 flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-accent-green" />
                </div>
                <div>
                    <h4 className="text-accent-green font-bold font-mono text-xs uppercase tracking-wider">Task Created</h4>
                    <p className="text-text-secondary text-xs font-mono">Task added to project.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-bg-dark border border-primary/30 rounded-none overflow-hidden animate-in fade-in slide-in-from-bottom-2 max-w-md my-4 shadow-lg shadow-black/50">
            {/* Header */}
            <div className="bg-primary/10 border-b border-primary/30 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span className="text-primary font-mono text-xs font-bold uppercase tracking-wider">Task Proposal</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <div className="space-y-1">
                    <label className="text-[10px] text-text-secondary font-mono uppercase tracking-wider">Task Title</label>
                    <div className="text-text-primary font-medium font-sans">{data.title}</div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-text-secondary font-mono uppercase tracking-wider">Description</label>
                    <div className="text-text-secondary text-sm leading-relaxed">{data.description}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    {data.priority && (
                        <div className="space-y-1">
                            <label className="text-[10px] text-text-secondary font-mono uppercase tracking-wider">Priority</label>
                            <div className="text-text-secondary text-xs font-mono uppercase">{data.priority}</div>
                        </div>
                    )}
                    {data.due_date && (
                        <div className="space-y-1">
                            <label className="text-[10px] text-text-secondary font-mono uppercase tracking-wider">Due Date</label>
                            <div className="text-text-secondary text-xs font-mono">{data.due_date}</div>
                        </div>
                    )}
                </div>

                {/* Project Selector */}
                <div className="space-y-1 pt-2 border-t border-border/50">
                    <label className="text-[10px] text-text-secondary font-mono uppercase tracking-wider">Add to Project</label>
                    {isLoadingProjects ? (
                        <div className="text-text-secondary text-xs italic">Loading projects...</div>
                    ) : projects.length > 0 ? (
                        <div className="relative">
                            <select 
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                className="w-full bg-bg-card border border-border text-text-secondary text-xs py-2 pl-3 pr-8 appearance-none focus:outline-none focus:border-primary"
                            >
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-text-secondary pointer-events-none" />
                        </div>
                    ) : (
                        <div className="text-red-400 text-xs">No projects found. Create a project first.</div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="p-3 bg-bg-card border-t border-border flex justify-end gap-2">
                <button 
                    onClick={onDismiss}
                    disabled={isCreating}
                    className="px-3 py-1.5 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors"
                >
                    Dismiss
                </button>
                <button 
                    onClick={handleCreate}
                    disabled={isCreating || !selectedProjectId}
                    className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-[var(--text-on-primary)] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isCreating ? (
                        <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            Create Task
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
