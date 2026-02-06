import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { tasksApi } from '../../lib/projectsApi'
import type { Task, TaskApplication } from '../../types/projects'
import { Loader2, Check, X, Star, TrendingUp, DollarSign } from 'lucide-react'
import { Avatar, AvatarFallback } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { toast } from '../../hooks/useToast'

interface TaskApplicationsModalProps {
    isOpen: boolean
    onClose: () => void
    task: Task | null
    onAssign: (taskId: string, memberId: string) => Promise<void>
}

export function TaskApplicationsModal({ isOpen, onClose, task, onAssign }: TaskApplicationsModalProps) {
    const [applications, setApplications] = useState<TaskApplication[]>([])
    const [loading, setLoading] = useState(false)
    const [processingId, setProcessingId] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && task) {
            loadApplications()
        }
    }, [isOpen, task])

    const calculateMatchScore = (app: TaskApplication) => {
        if (!task) return 0
        let score = 50 // Base score

        // Rating component (0-50 points)
        if (app.applicant?.rating_count && app.applicant.rating_count > 0) {
            const avgRating = (app.applicant.rating_sum || 0) / app.applicant.rating_count
            score += avgRating * 10
        }

        // Price component (bonus for good price)
        if (app.bid_amount && task.cost) {
            if (app.bid_amount <= task.cost) {
                score += 10
            }
            // Penalty for overbidding significantly
            if (app.bid_amount > task.cost * 1.2) {
                score -= 10
            }
        }

        return Math.min(100, Math.max(0, score))
    }

    const loadApplications = async () => {
        if (!task) return
        setLoading(true)
        try {
            const data = await tasksApi.getTaskApplications(task.id)
            // Sort by match score
            const sortedData = data.sort((a, b) => calculateMatchScore(b) - calculateMatchScore(a))
            setApplications(sortedData)
        } catch (error) {
            console.error('Failed to load applications:', error)
            toast({
                title: "Error",
                description: "Failed to load applications",
                type: "error"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleAccept = async (app: TaskApplication) => {
        if (!task) return
        setProcessingId(app.id)
        try {
            // 1. Update application status
            await tasksApi.updateApplicationStatus(app.id, 'accepted')
            
            // 2. Assign task to applicant
            // Note: This might fail if applicant is not a project member yet.
            //Ideally we should add them to the project first or have logic for that.
            // For now, assuming we just assign the task.
            await onAssign(task.id, app.applicant_id)
            
            toast({
                title: "Application Accepted",
                description: "Task has been assigned to the applicant.",
                type: "success"
            })
            onClose()
        } catch (error) {
            console.error('Failed to accept application:', error)
            toast({
                title: "Error",
                description: "Failed to accept application",
                type: "error"
            })
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (app: TaskApplication) => {
        setProcessingId(app.id)
        try {
            await tasksApi.updateApplicationStatus(app.id, 'rejected')
            // Update local state
            setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'rejected' } : a))
            toast({
                title: "Application Rejected",
                description: "Application status updated.",
                type: "success"
            })
        } catch (error) {
            console.error('Failed to reject application:', error)
            toast({
                title: "Error",
                description: "Failed to reject application",
                type: "error"
            })
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Applications for: ${task?.title}`}>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary font-mono">
                        No applications yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <div key={app.id} className="bg-bg-dark border border-border p-4 rounded-lg space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Avatar className="h-12 w-12 border border-border">
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {app.applicant?.email?.substring(0, 2).toUpperCase() || '??'}
                                                </AvatarFallback>
                                            </Avatar>
                                            {calculateMatchScore(app) >= 80 && (
                                                <div className="absolute -top-2 -right-2 bg-yellow-500 text-bg-dark text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center shadow-sm border border-bg-dark">
                                                    <Star className="h-3 w-3 fill-current mr-0.5" />
                                                    Top
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-text-primary text-sm">
                                                    {app.applicant?.full_name || app.applicant?.email || 'Unknown User'}
                                                </p>
                                                {app.applicant?.rating_count ? (
                                                    <div className="flex items-center text-xs text-yellow-500">
                                                        <Star className="h-3 w-3 fill-current mr-0.5" />
                                                        <span>{((app.applicant.rating_sum || 0) / app.applicant.rating_count).toFixed(1)}</span>
                                                        <span className="text-text-secondary ml-1">({app.applicant.rating_count})</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-text-secondary">No ratings</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <p className="text-xs text-text-secondary font-mono">
                                                    {new Date(app.created_at).toLocaleDateString()}
                                                </p>
                                                <div className="flex items-center text-xs font-mono text-green-500">
                                                    <TrendingUp className="h-3 w-3 mr-1" />
                                                    {calculateMatchScore(app)}% Match
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {app.status === 'pending' ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                    onClick={() => handleReject(app)}
                                                    disabled={!!processingId}
                                                >
                                                    {processingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                                    onClick={() => handleAccept(app)}
                                                    disabled={!!processingId}
                                                >
                                                    {processingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                </Button>
                                            </>
                                        ) : (
                                            <span className={`text-xs font-bold uppercase px-2 py-1 rounded border ${
                                                app.status === 'accepted' 
                                                    ? 'text-green-500 border-green-500/20 bg-green-500/5' 
                                                    : 'text-red-500 border-red-500/20 bg-red-500/5'
                                            }`}>
                                                {app.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    {app.message && (
                                        <div className="bg-bg-card p-3 rounded text-sm text-text-secondary font-mono italic flex-1">
                                            "{app.message}"
                                        </div>
                                    )}
                                    {app.bid_amount !== undefined && (
                                        <div className="flex flex-col items-end min-w-[80px]">
                                            <span className="text-xs text-text-secondary uppercase tracking-wider font-bold">Bid</span>
                                            <span className={`font-mono font-bold text-lg flex items-center ${
                                                task?.cost && app.bid_amount <= task.cost ? 'text-green-500' : 'text-text-primary'
                                            }`}>
                                                <DollarSign className="h-4 w-4" />
                                                {app.bid_amount}
                                            </span>
                                            {task?.cost && (
                                                <span className="text-[10px] text-text-secondary">
                                                    Target: ${task.cost}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    )
}
