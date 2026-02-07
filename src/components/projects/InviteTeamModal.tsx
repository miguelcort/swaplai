import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { projectsApi } from '../../lib/projectsApi'
import type { InviteTeamMemberInput, MemberRole } from '../../types/projects'
import { UserPlus } from 'lucide-react'

interface InviteTeamModalProps {
    isOpen: boolean
    onClose: () => void
    projectId: string
    onSuccess: () => void
}

export function InviteTeamModal({ isOpen, onClose, projectId, onSuccess }: InviteTeamModalProps) {
    const [formData, setFormData] = useState<InviteTeamMemberInput>({
        email: '',
        role: 'member'
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            await projectsApi.inviteTeamMember(projectId, formData)
            setSuccess(true)
            setFormData({ email: '', role: 'member' })
            setTimeout(() => {
                onSuccess()
                onClose()
                setSuccess(false)
            }, 1500)
        } catch (err: any) {
            setError(err.message || 'Failed to invite team member')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Invite Team Member">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 bg-bg-dark border border-red-900 text-sm text-red-500 font-mono">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-3 bg-bg-dark border border-emerald-900 text-sm text-emerald-500 font-mono">
                        Invitation sent successfully!
                    </div>
                )}

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">
                        Email Address *
                    </label>
                    <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-bg-dark border border-border text-text-primary focus:outline-none focus:border-primary transition-colors font-mono"
                        placeholder="colleague@example.com"
                    />
                    <p className="mt-2 text-xs text-text-secondary font-mono">
                        The user must have an account to receive the invitation
                    </p>
                </div>

                {/* Role */}
                <div>
                    <label htmlFor="role" className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">
                        Role
                    </label>
                    <select
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as MemberRole })}
                        className="w-full px-4 py-3 bg-bg-dark border border-border text-text-primary focus:outline-none focus:border-primary transition-colors font-mono appearance-none"
                    >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                    </select>
                    <p className="mt-2 text-xs text-text-secondary font-mono">
                        Admins can invite other members and manage tasks
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-border text-text-secondary hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !formData.email}
                        className="flex-1 px-4 py-3 bg-primary text-[var(--text-on-primary)] hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-mono uppercase text-xs tracking-wider font-bold"
                    >
                        <UserPlus className="h-4 w-4" />
                        {loading ? 'Sending...' : 'Send Invitation'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
