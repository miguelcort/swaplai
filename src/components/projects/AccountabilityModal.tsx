import { useState } from 'react'
import { MessageSquare, ThumbsUp } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { projectsApi } from '../../lib/projectsApi'
import { toast } from '../../hooks/useToast'

interface AccountabilityModalProps {
    isOpen: boolean
    onClose: () => void
    taskTitle: string
}

export function AccountabilityModal({ isOpen, onClose, taskTitle }: AccountabilityModalProps) {
    const [step, setStep] = useState<'excuse' | 'coaching'>('excuse')
    const [excuse, setExcuse] = useState('')
    const [loading, setLoading] = useState(false)
    const [coaching, setCoaching] = useState<{ message: string, negotiation: string } | null>(null)

    const handleSubmitExcuse = async () => {
        if (!excuse.trim()) return
        setLoading(true)
        try {
            const result = await projectsApi.getAccountabilityCoaching(taskTitle, excuse)
            setCoaching(result)
            setStep('coaching')
        } catch (error) {
            console.error(error)
            toast({ title: 'Error', description: 'Coach is offline', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    const handleAccept = () => {
        toast({ title: 'Deal!', description: 'Updating task requirements...', type: 'success' })
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tough Love Coach">
            <div className="space-y-6">
                {step === 'excuse' ? (
                    <>
                        <p className="text-text-secondary">Why do you want to skip <strong>"{taskTitle}"</strong> today?</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {['Too tired', 'Not enough time', 'Too difficult', 'Just don\'t want to'].map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => setExcuse(opt)}
                                    className={`p-3 rounded-lg border text-sm transition-all ${excuse === opt ? 'bg-primary/20 border-primary text-primary' : 'bg-bg-dark border-border text-text-secondary hover:border-primary/50'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                        
                        <textarea
                            value={excuse}
                            onChange={(e) => setExcuse(e.target.value)}
                            placeholder="Or type your own reason..."
                            className="w-full bg-bg-dark border border-border rounded-lg p-3 text-text-primary focus:outline-none focus:border-primary/50 text-sm h-24 resize-none"
                        />

                        <button
                            onClick={handleSubmitExcuse}
                            disabled={!excuse || loading}
                            className="w-full bg-primary text-bg-dark font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {loading ? 'Consulting Coach...' : 'Tell Coach'}
                        </button>
                    </>
                ) : (
                    <>
                         <div className="bg-bg-card border border-border p-6 rounded-xl space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-full text-blue-500 shrink-0">
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-text-primary text-lg mb-2">Coach says:</h4>
                                    <p className="text-text-primary/90 italic">"{coaching?.message}"</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border">
                                <h5 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">The Counter-Offer</h5>
                                <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                                    <p className="text-primary font-bold text-lg text-center">{coaching?.negotiation}</p>
                                </div>
                            </div>
                         </div>

                         <div className="flex gap-3">
                             <button
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl border border-border text-text-secondary hover:bg-bg-card transition-colors font-medium"
                             >
                                 I'll still skip it
                             </button>
                             <button
                                onClick={handleAccept}
                                className="flex-1 py-3 px-4 rounded-xl bg-primary text-bg-dark hover:bg-primary/90 transition-colors font-bold flex justify-center items-center gap-2"
                             >
                                 <ThumbsUp className="h-4 w-4" />
                                 Deal. I'll do it.
                             </button>
                         </div>
                    </>
                )}
            </div>
        </Modal>
    )
}
