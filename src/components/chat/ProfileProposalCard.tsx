import { useState } from 'react'
import { Check, X, User, Globe, FileText, Save } from 'lucide-react'
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
    const { updateProfile } = useProfileStore()
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // Filter data to only include valid profile fields
            const validFields = ['first_name', 'last_name', 'bio', 'website', 'preferences', 'avatar_url']
            const updates = Object.keys(data)
                .filter(key => validFields.includes(key))
                .reduce((obj, key) => {
                    obj[key] = data[key]
                    return obj
                }, {} as any)

            if (Object.keys(updates).length === 0) {
                 toast({
                    title: "No changes to save",
                    description: "The proposed data doesn't match any profile fields.",
                    type: "info"
                })
                setIsSaving(false)
                return
            }

            await updateProfile(updates)
            setIsSaved(true)
            toast({
                title: "Profile Updated",
                description: "Your profile information has been successfully updated.",
                type: "success"
            })
        } catch (error) {
            console.error('Failed to update profile:', error)
            toast({
                title: "Update Failed",
                description: "Failed to update profile information. Please try again.",
                type: "error"
            })
        } finally {
            setIsSaving(false)
        }
    }

    if (isSaved) {
        return (
            <div className="mt-4 p-4 bg-green-900/10 border border-green-900/30 rounded-none flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="h-8 w-8 rounded-full bg-green-900/20 flex items-center justify-center border border-green-900/50">
                    <Check className="h-4 w-4 text-green-500" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-green-500 font-mono uppercase tracking-wide">Update Successful</h4>
                    <p className="text-xs text-green-400/70 font-mono">Profile information saved to database.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-4 border border-[#C9A962] bg-[#0A0A0A] rounded-none overflow-hidden animate-in fade-in slide-in-from-top-2 shadow-[0_0_15px_-3px_rgba(201,169,98,0.1)]">
            {/* Header */}
            <div className="bg-[#C9A962]/10 border-b border-[#C9A962]/30 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#C9A962]" />
                    <span className="text-xs font-bold text-[#C9A962] font-mono uppercase tracking-wider">
                        Profile Update Detected
                    </span>
                </div>
                <button 
                    onClick={onDismiss}
                    className="text-[#C9A962]/60 hover:text-[#C9A962] transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <p className="text-sm text-gray-400 font-sans mb-4">
                    I've detected new information for your profile. Would you like to save these changes?
                </p>

                <div className="space-y-2 bg-[#111] p-3 border border-[#333333]">
                    {(data.first_name || data.last_name) && (
                        <div className="flex items-start gap-3">
                            <User className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                                <span className="text-xs text-gray-500 font-mono uppercase block">Name</span>
                                <span className="text-sm text-white font-sans">
                                    {[data.first_name, data.last_name].filter(Boolean).join(' ')}
                                </span>
                            </div>
                        </div>
                    )}
                    
                    {data.bio && (
                        <div className="flex items-start gap-3 pt-2 border-t border-[#333333]/50">
                            <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                                <span className="text-xs text-gray-500 font-mono uppercase block">Bio</span>
                                <span className="text-sm text-white font-sans line-clamp-2">{data.bio}</span>
                            </div>
                        </div>
                    )}

                    {data.website && (
                        <div className="flex items-start gap-3 pt-2 border-t border-[#333333]/50">
                            <Globe className="h-4 w-4 text-gray-500 mt-0.5" />
                            <div>
                                <span className="text-xs text-gray-500 font-mono uppercase block">Website</span>
                                <span className="text-sm text-white font-sans break-all">{data.website}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 bg-[#111] border-t border-[#333333] flex justify-end gap-3">
                <button
                    onClick={onDismiss}
                    className="px-3 py-1.5 text-xs font-mono text-gray-400 hover:text-white transition-colors"
                    disabled={isSaving}
                >
                    DISMISS
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-1.5 bg-[#C9A962] hover:bg-[#b09355] text-black text-xs font-bold font-mono uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
