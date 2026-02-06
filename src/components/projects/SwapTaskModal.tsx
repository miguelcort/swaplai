import { useState } from 'react'
import { Sparkles, Users, ArrowLeft, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Task, ProjectMember } from '../../types/projects'
import { Modal } from '../ui/Modal'
import { projectsApi } from '../../lib/projectsApi'

interface SwapTaskModalProps {
    isOpen: boolean
    onClose: () => void
    task: Task | null
    members: ProjectMember[]
    onAssign: (taskId: string, memberId: string) => Promise<void>
}

export function SwapTaskModal({ isOpen, onClose, task, members, onAssign }: SwapTaskModalProps) {
    const [mode, setMode] = useState<'select' | 'ai' | 'team'>('select')
    const [loading, setLoading] = useState(false)
    const [aiResponse, setAiResponse] = useState<string | null>(null)

    const handleReset = () => {
        setMode('select')
        setAiResponse(null)
    }

    const handleClose = () => {
        handleReset()
        onClose()
    }

    const handleAssign = async (memberId: string) => {
        if (!task) return
        setLoading(true)
        try {
            await onAssign(task.id, memberId)
            handleClose()
        } catch (error) {
            console.error('Failed to assign task:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAiSupport = async () => {
        if (!task) return
        setMode('ai')
        setLoading(true)
        try {
            const advice = await projectsApi.getTaskAdvice(task.title, task.description || '')
            setAiResponse(advice)
        } catch (error) {
            console.error('Failed to get AI advice:', error)
            setAiResponse("Sorry, I couldn't generate advice at this moment.")
        } finally {
            setLoading(false)
        }
    }

    if (!task) return null

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Swap / Support Task">
            <div className="space-y-6">
                <div className="p-4 bg-bg-card border border-border">
                    <h4 className="font-bold text-text-primary font-sans mb-1">{task.title}</h4>
                    <p className="text-sm text-text-secondary font-mono">{task.description}</p>
                </div>

                {mode === 'select' && (
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleAiSupport}
                            className="p-6 border border-border hover:border-primary bg-bg-dark hover:bg-border transition-all group text-left relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Sparkles className="h-24 w-24 text-primary" />
                            </div>
                            <Sparkles className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform relative z-10" />
                            <h5 className="font-bold text-text-primary font-sans uppercase tracking-wide mb-2 relative z-10">AI Assistant</h5>
                            <p className="text-xs text-text-secondary font-mono relative z-10">Get AI help to break down, research, or solve this task.</p>
                        </button>

                        <button
                            onClick={() => setMode('team')}
                            className="p-6 border border-border hover:border-blue-500 bg-bg-dark hover:bg-border transition-all group text-left relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Users className="h-24 w-24 text-blue-500" />
                            </div>
                            <Users className="h-8 w-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform relative z-10" />
                            <h5 className="font-bold text-text-primary font-sans uppercase tracking-wide mb-2 relative z-10">Team Member</h5>
                            <p className="text-xs text-text-secondary font-mono relative z-10">Delegate or swap this task with a team member.</p>
                        </button>
                    </div>
                )}

                {mode === 'team' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <button 
                            onClick={() => setMode('select')}
                            className="flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-text-primary mb-2 uppercase tracking-wider"
                        >
                            <ArrowLeft className="h-3 w-3" /> Back
                        </button>
                        <h5 className="font-bold text-text-primary font-sans uppercase tracking-wide">Select Team Member</h5>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                            {members.length === 0 ? (
                                <p className="text-text-secondary font-mono text-sm">No active team members found.</p>
                            ) : (
                                members.map(member => (
                                    <button
                                        key={member.id}
                                        onClick={() => handleAssign(member.user_id)}
                                        disabled={loading || task.assigned_to === member.user_id}
                                        className={`w-full flex items-center justify-between p-3 border text-left transition-colors ${
                                            task.assigned_to === member.user_id
                                                ? 'bg-bg-card border-primary cursor-default'
                                                : 'bg-bg-dark border-border hover:border-text-secondary'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-border flex items-center justify-center text-xs font-bold text-text-primary">
                                                {member.profiles?.full_name?.substring(0, 2).toUpperCase() || member.profiles?.email?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold font-sans ${task.assigned_to === member.user_id ? 'text-primary' : 'text-text-primary'}`}>
                                                    {member.profiles?.full_name || member.profiles?.email}
                                                </p>
                                                <p className="text-xs text-text-secondary font-mono">{member.role}</p>
                                            </div>
                                        </div>
                                        {task.assigned_to === member.user_id && (
                                            <span className="text-xs font-mono text-primary uppercase tracking-wider flex items-center gap-1">
                                                <Check className="h-3 w-3" /> Assigned
                                            </span>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {mode === 'ai' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <button 
                            onClick={() => setMode('select')}
                            className="flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-text-primary mb-2 uppercase tracking-wider"
                        >
                            <ArrowLeft className="h-3 w-3" /> Back
                        </button>
                        
                        {loading ? (
                            <div className="text-center py-8">
                                <Sparkles className="h-8 w-8 text-primary animate-pulse mx-auto mb-4" />
                                <p className="text-text-secondary font-mono text-sm">AI is analyzing your task...</p>
                            </div>
                        ) : (
                            <div className="bg-bg-card border border-border p-4 font-mono text-sm text-text-secondary overflow-y-auto max-h-[60vh]">
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h1: ({node, ...props}) => <h1 className="text-lg font-bold text-text-primary mb-2 mt-4" {...props} />,
                                        h2: ({node, ...props}) => <h2 className="text-base font-bold text-text-primary mb-2 mt-3" {...props} />,
                                        h3: ({node, ...props}) => <h3 className="text-sm font-bold text-text-primary mb-1 mt-2" {...props} />,
                                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                        li: ({node, ...props}) => <li className="" {...props} />,
                                        strong: ({node, ...props}) => <strong className="text-primary font-bold" {...props} />,
                                        em: ({node, ...props}) => <em className="italic text-text-secondary" {...props} />,
                                        blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-primary pl-4 italic text-text-secondary my-2" {...props} />,
                                        code: ({node, ...props}) => <code className="bg-bg-dark px-1 py-0.5 rounded text-primary" {...props} />,
                                        pre: ({node, ...props}) => <pre className="bg-bg-dark p-2 rounded overflow-x-auto mb-2" {...props} />,
                                        a: ({node, ...props}) => <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                    }}
                                >
                                    {aiResponse || ''}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    )
}
