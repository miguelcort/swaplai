import { useState, useEffect } from 'react'
import { AlertTriangle, Pause, Scissors, ArrowRight, Heart } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { projectsApi } from '../../lib/projectsApi'
import { toast } from '../../hooks/useToast'

interface PanicModalProps {
    isOpen: boolean
    onClose: () => void
    projectId: string
    projectName: string
    onDeleteConfirm: () => void
}

export function PanicModal({ isOpen, onClose, projectId, projectName, onDeleteConfirm }: PanicModalProps) {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<{ message: string, options: any[] } | null>(null)

    useEffect(() => {
        if (isOpen && !data) {
            loadOptions()
        }
    }, [isOpen])

    const loadOptions = async () => {
        setLoading(true)
        try {
            const result = await projectsApi.getPanicOptions(projectId)
            setData(result)
        } catch (error) {
            console.error(error)
            toast({ title: 'Error', description: 'Could not load panic options', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const handleOptionClick = (action: string) => {
        // Implement actions (simplified for now)
        if (action === 'delete') {
            onDeleteConfirm()
        } else {
            toast({ title: 'Action Taken', description: `Applied action: ${action} (Simulation)`, type: 'success' })
            onClose()
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Wait! Don't give up on ${projectName} yet.`}>
            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : data ? (
                    <>
                        <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg flex items-start gap-3">
                            <Heart className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <p className="text-sm text-text-primary italic">"{data.message}"</p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Alternatives to Quitting</h4>
                            
                            {data.options.map((option: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionClick(option.action)}
                                    className="w-full text-left p-4 rounded-xl bg-bg-card border border-border hover:border-primary/50 transition-all group"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-bg-dark rounded-lg text-primary group-hover:scale-110 transition-transform">
                                                {option.action === 'pause' ? <Pause className="h-4 w-4" /> : 
                                                 option.action === 'simplify' ? <Scissors className="h-4 w-4" /> : 
                                                 <ArrowRight className="h-4 w-4" />}
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-text-primary">{option.title}</h5>
                                                <p className="text-xs text-text-secondary">{option.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}

                            <button
                                onClick={onDeleteConfirm}
                                className="w-full mt-4 p-3 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <AlertTriangle className="h-4 w-4" />
                                I still want to delete this project
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-text-secondary">Failed to load options.</div>
                )}
            </div>
        </Modal>
    )
}
