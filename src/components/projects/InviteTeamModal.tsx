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
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-600">
                        Invitation sent successfully!
                    </div>
                )}

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                    </label>
                    <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="colleague@example.com"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        The user must have an account to receive the invitation
                    </p>
                </div>

                {/* Role */}
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                    </label>
                    <select
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as MemberRole })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                        Admins can invite other members and manage tasks
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !formData.email}
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <UserPlus className="h-4 w-4" />
                        {loading ? 'Sending...' : 'Send Invitation'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
