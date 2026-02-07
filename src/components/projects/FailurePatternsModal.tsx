import { useState, useEffect } from 'react'
import { Sparkles, ArrowRight, Check } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { projectsApi, tasksApi } from '../../lib/projectsApi'
import { toast } from '../../hooks/useToast'

interface FailurePatternsModalProps {
    isOpen: boolean
    onClose: () => void
    projectId: string
    onScheduleApplied?: () => void
}

interface RescheduleSuggestion {
    task_id: string
    task_title: string
    current_date: string
    new_date: string
    reason: string
}

interface AnalysisResult {
    pattern_analysis: string
    suggested_schedule: RescheduleSuggestion[]
}

export function FailurePatternsModal({ isOpen, onClose, projectId, onScheduleApplied }: FailurePatternsModalProps) {
    const [loading, setLoading] = useState(false)
    const [applying, setApplying] = useState(false)
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (isOpen && !result) {
            analyzePatterns()
        }
    }, [isOpen])

    const analyzePatterns = async () => {
        setLoading(true)
        try {
            const data = await projectsApi.analyzeFailurePatterns(projectId)
            setResult(data)
            // Select all by default
            if (data.suggested_schedule) {
                setSelectedSuggestions(new Set(data.suggested_schedule.map((s: any) => s.task_id)))
            }
        } catch (error) {
            console.error('Failed to analyze patterns:', error)
            toast({ title: 'Error', description: 'Could not analyze failure patterns', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const toggleSuggestion = (taskId: string) => {
        const newSelected = new Set(selectedSuggestions)
        if (newSelected.has(taskId)) {
            newSelected.delete(taskId)
        } else {
            newSelected.add(taskId)
        }
        setSelectedSuggestions(newSelected)
    }

    const handleApplySchedule = async () => {
        if (!result) return
        
        setApplying(true)
        try {
            const suggestionsToApply = result.suggested_schedule.filter(s => selectedSuggestions.has(s.task_id))
            
            await Promise.all(suggestionsToApply.map(suggestion => 
                tasksApi.updateTask(suggestion.task_id, { due_date: suggestion.new_date })
            ))
            
            toast({ 
                title: 'Schedule Updated', 
                description: `Rescheduled ${suggestionsToApply.length} tasks based on your patterns.`, 
                type: 'success' 
            })
            
            if (onScheduleApplied) {
                onScheduleApplied()
            }
            onClose()
        } catch (error) {
            console.error('Failed to apply schedule:', error)
            toast({ title: 'Error', description: 'Failed to update task dates', type: 'error' })
        } finally {
            setApplying(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Analysis of Failure Patterns">
            <div className="space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Sparkles className="h-12 w-12 text-primary animate-pulse mb-4" />
                        <p className="text-text-secondary font-mono animate-pulse">Analyzing your completion history...</p>
                    </div>
                ) : result ? (
                    <>
                        <div className="bg-bg-card border border-border p-4 rounded-lg">
                            <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                AI Insight
                            </h3>
                            <p className="text-text-primary font-sans leading-relaxed">
                                {result.pattern_analysis}
                            </p>
                        </div>

                        {result.suggested_schedule && result.suggested_schedule.length > 0 ? (
                            <div>
                                <h4 className="text-sm font-mono text-text-secondary uppercase mb-3">Suggested Adjustments</h4>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {result.suggested_schedule.map((suggestion) => (
                                        <div 
                                            key={suggestion.task_id}
                                            onClick={() => toggleSuggestion(suggestion.task_id)}
                                            className={`
                                                p-3 border rounded cursor-pointer transition-colors flex items-start gap-3
                                                ${selectedSuggestions.has(suggestion.task_id) 
                                                    ? 'bg-primary/5 border-primary' 
                                                    : 'bg-bg-dark border-border hover:border-primary/50'}
                                            `}
                                        >
                                            <div className={`
                                                mt-1 h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors
                                                ${selectedSuggestions.has(suggestion.task_id)
                                                    ? 'bg-primary border-primary text-bg-dark'
                                                    : 'border-text-secondary'}
                                            `}>
                                                {selectedSuggestions.has(suggestion.task_id) && <Check className="h-3 w-3" />}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <p className="font-bold text-sm text-text-primary">{suggestion.task_title || 'Untitled Task'}</p>
                                                <div className="flex items-center gap-2 mt-1 text-xs font-mono">
                                                    <span className="text-text-secondary line-through">
                                                        {suggestion.current_date ? new Date(suggestion.current_date).toLocaleDateString() : 'No Date'}
                                                    </span>
                                                    <ArrowRight className="h-3 w-3 text-primary" />
                                                    <span className="text-primary font-bold">
                                                        {new Date(suggestion.new_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-text-secondary mt-1 italic">"{suggestion.reason}"</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 border border-dashed border-border rounded">
                                <p className="text-text-secondary font-mono text-sm">No schedule adjustments needed right now.</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-text-secondary hover:text-text-primary font-mono text-xs uppercase tracking-wider"
                            >
                                Close
                            </button>
                            {result.suggested_schedule && result.suggested_schedule.length > 0 && (
                                <button
                                    onClick={handleApplySchedule}
                                    disabled={applying || selectedSuggestions.size === 0}
                                    className="flex items-center gap-2 px-6 py-2 bg-primary text-bg-dark hover:bg-primary/90 font-bold font-mono uppercase text-xs tracking-wider disabled:opacity-50"
                                >
                                    {applying ? 'Applying...' : `Apply ${selectedSuggestions.size} Changes`}
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8 text-text-secondary">
                        <p>No analysis available.</p>
                        <button onClick={analyzePatterns} className="mt-4 text-primary hover:underline">Try Again</button>
                    </div>
                )}
            </div>
        </Modal>
    )
}
