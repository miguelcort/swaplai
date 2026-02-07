import { useState } from 'react'
import { Check, FolderPlus, Loader2 } from 'lucide-react'
import { projectsApi } from '../../lib/projectsApi'
import { toast } from '../../hooks/useToast'

interface ProjectProposalData {
    name: string
    description: string
    budget?: number
}

interface ProjectProposalCardProps {
    data: ProjectProposalData
    onDismiss: () => void
}

export function ProjectProposalCard({ data, onDismiss }: ProjectProposalCardProps) {
    const [isCreating, setIsCreating] = useState(false)
    const [isCreated, setIsCreated] = useState(false)

    const handleCreate = async () => {
        setIsCreating(true)
        try {
            await projectsApi.createProject({
                name: data.name,
                description: data.description,
                budget: data.budget || 0
            })
            setIsCreated(true)
            toast({
                title: "Project Created",
                description: `Project "${data.name}" has been created successfully.`,
                type: "success"
            })
            setTimeout(() => {
                onDismiss()
                // Optional: navigate to the new project
                // navigate(`/projects/${newProject.id}`)
            }, 2000)
        } catch (error) {
            console.error('Failed to create project:', error)
            toast({
                title: "Error",
                description: "Failed to create project. Please try again.",
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
                    <h4 className="text-accent-green font-bold font-mono text-xs uppercase tracking-wider">Project Created</h4>
                    <p className="text-text-secondary text-xs font-mono">"{data.name}" is now active.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-bg-dark border border-primary/30 rounded-none overflow-hidden animate-in fade-in slide-in-from-bottom-2 max-w-md my-4 shadow-lg shadow-black/50">
            {/* Header */}
            <div className="bg-primary/10 border-b border-primary/30 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FolderPlus className="h-4 w-4 text-primary" />
                    <span className="text-primary font-mono text-xs font-bold uppercase tracking-wider">Project Proposal</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <div className="space-y-1">
                    <label className="text-[10px] text-text-secondary font-mono uppercase tracking-wider">Project Name</label>
                    <div className="text-text-primary font-medium font-sans">{data.name}</div>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-text-secondary font-mono uppercase tracking-wider">Description</label>
                    <div className="text-text-secondary text-sm leading-relaxed">{data.description}</div>
                </div>
                {data.budget && (
                     <div className="space-y-1">
                        <label className="text-[10px] text-text-secondary font-mono uppercase tracking-wider">Budget</label>
                        <div className="text-text-secondary text-sm font-mono">${data.budget}</div>
                    </div>
                )}
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
                    disabled={isCreating}
                    className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-[var(--text-on-primary)] text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isCreating ? (
                        <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            Create Project
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
