import { useState, useEffect } from 'react'
import { Check, X, User, Globe, FileText, Save, Sparkles } from 'lucide-react'
import { useProfileStore } from '../../stores/profileStore'
import { toast } from '../../hooks/useToast'

interface ProfileProposalCardProps {
    data: {
        first_name?: string
        last_name?: string
        bio?: string
        website?: string
        [key: string]: any
    }
    onDismiss: () => void
}

export function ProfileProposalCard({ data, onDismiss }: ProfileProposalCardProps) {
    const { updateProfile, profile } = useProfileStore()
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [shouldShow, setShouldShow] = useState(true)

    // Check if data is already saved in profile
    useEffect(() => {
        if (!profile) return

        const isAlreadySaved = Object.entries(data).every(([key, value]) => {
            // Skip fields that are not in profile or empty
            if (!value) return true
            // Loose comparison for strings
            return profile[key as keyof typeof profile] == value
        })

        if (isAlreadySaved) {
            setShouldShow(false)
        }
    }, [profile, data])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updateProfile(data)
            setIsSaved(true)
            setTimeout(() => {
                onDismiss()
            }, 2000)
        } catch (error) {
            console.error('Failed to save profile:', error)
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                type: "error"
            })
        } finally {
            setIsSaving(false)
        }
    }

    if (!shouldShow && !isSaved) return null

    if (isSaved) {
        return (
            <div className="bg-accent-green/10 border border-accent-green/30 rounded-none p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="h-8 w-8 rounded-full bg-accent-green/20 flex items-center justify-center shrink-0">
                    <Check className="h-4 w-4 text-accent-green" />
                </div>
                <div>
                    <h4 className="text-accent-green font-bold font-mono text-xs uppercase tracking-wider">Update Successful</h4>
                    <p className="text-text-secondary text-xs font-mono">Profile information saved to database.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-bg-dark border border-primary/30 rounded-none overflow-hidden animate-in fade-in slide-in-from-bottom-2 max-w-md my-4 shadow-lg shadow-black/50">
            {/* Header */}
            <div className="bg-primary/10 border-b border-primary/30 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-primary font-mono uppercase tracking-wider">
                        Profile Update Detected
                    </span>
                </div>
                <button 
                    onClick={onDismiss}
                    className="text-primary/60 hover:text-primary transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <p className="text-sm text-text-secondary font-sans mb-4">
                    I've detected new information for your profile. Would you like to save these changes?
                </p>

                <div className="space-y-2 bg-bg-card p-3 border border-border">
                    {(data.first_name || data.last_name) && (
                        <div className="flex items-start gap-3">
                            <User className="h-4 w-4 text-text-secondary mt-0.5" />
                            <div>
                                <span className="text-xs text-text-secondary font-mono uppercase block">Name</span>
                                <span className="text-sm text-text-primary font-sans">
                                    {[data.first_name, data.last_name].filter(Boolean).join(' ')}
                                </span>
                            </div>
                        </div>
                    )}
                    
                    {data.bio && (
                        <div className="flex items-start gap-3 pt-2 border-t border-border/50">
                            <FileText className="h-4 w-4 text-text-secondary mt-0.5" />
                            <div>
                                <span className="text-xs text-text-secondary font-mono uppercase block">Bio</span>
                                <span className="text-sm text-text-primary font-sans line-clamp-2">{data.bio}</span>
                            </div>
                        </div>
                    )}

                    {data.website && (
                        <div className="flex items-start gap-3 pt-2 border-t border-border/50">
                            <Globe className="h-4 w-4 text-text-secondary mt-0.5" />
                            <div>
                                <span className="text-xs text-text-secondary font-mono uppercase block">Website</span>
                                <span className="text-sm text-text-primary font-sans break-all">{data.website}</span>
                            </div>
                        </div>
                    )}

                    {data.preferences && (
                        <div className="flex items-start gap-3 pt-2 border-t border-border/50">
                            <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                            <div>
                                <span className="text-xs text-primary font-mono uppercase block">AI Agent Preferences (Gustos)</span>
                                <span className="text-sm text-text-primary font-sans italic">{data.preferences}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 bg-bg-card border-t border-border flex justify-end gap-3">
                <button
                    onClick={onDismiss}
                    className="px-3 py-1.5 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors"
                    disabled={isSaving}
                >
                    DISMISS
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-1.5 bg-primary hover:bg-primary/90 text-[var(--text-on-primary)] text-xs font-bold font-mono uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <>
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-black border-r-transparent" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-3 w-3" />
                            Save to Profile
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
