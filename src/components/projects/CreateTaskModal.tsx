import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { tasksApi } from '../../lib/projectsApi'
import { Calendar, DollarSign, User, Flag } from 'lucide-react'
import type { CreateTaskInput, ProjectMember, TaskPriority } from '../../types/projects'

interface CreateTaskModalProps {
    isOpen: boolean
    onClose: () => void
    projectId: string
    members: ProjectMember[]
    onSuccess: () => void
}

export function CreateTaskModal({ isOpen, onClose, projectId, members, onSuccess }: CreateTaskModalProps) {
    const [formData, setFormData] = useState<CreateTaskInput>({
        title: '',
        description: '',
        priority: 'medium',
        cost: 0,
        assigned_to: '',
        due_date: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await tasksApi.createTask(projectId, formData)
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                cost: 0,
                assigned_to: '',
                due_date: ''
            })
            onSuccess()
            onClose()
        } catch (err: any) {
            setError(err.message || 'Failed to create task')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 bg-[#0A0A0A] border border-red-900 text-sm text-red-500 font-mono">
                        {error}
                    </div>
                )}

                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider font-mono">
                        Task Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] text-white focus:outline-none focus:border-[#C9A962] transition-colors font-mono"
                        placeholder="e.g. Implement user authentication"
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider font-mono">
                        Description
                    </label>
                    <textarea
                        id="description"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] text-white focus:outline-none focus:border-[#C9A962] transition-colors font-mono"
                        placeholder="Add details about the task..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Priority */}
                    <div>
                        <label htmlFor="priority" className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider font-mono">
                            <div className="flex items-center gap-1">
                                <Flag className="h-3 w-3" />
                                Priority
                            </div>
                        </label>
                        <select
                            id="priority"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                            className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] text-white focus:outline-none focus:border-[#C9A962] transition-colors font-mono appearance-none"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    {/* Cost */}
                    <div>
                        <label htmlFor="cost" className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider font-mono">
                            <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Cost (Credits)
                            </div>
                        </label>
                        <input
                            type="number"
                            id="cost"
                            min="0"
                            step="0.01"
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] text-white focus:outline-none focus:border-[#C9A962] transition-colors font-mono"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Assigned To */}
                    <div>
                        <label htmlFor="assigned_to" className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider font-mono">
                            <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Assign To
                            </div>
                        </label>
                        <select
                            id="assigned_to"
                            value={formData.assigned_to || ''}
                            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                            className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] text-white focus:outline-none focus:border-[#C9A962] transition-colors font-mono appearance-none"
                        >
                            <option value="">Unassigned</option>
                            {members.map((member) => (
                                <option key={member.user_id} value={member.user_id}>
                                    {member.profiles?.full_name || member.profiles?.email || member.user_id.substring(0, 8)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label htmlFor="due_date" className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider font-mono">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Due Date
                            </div>
                        </label>
                        <input
                            type="date"
                            id="due_date"
                            value={formData.due_date || ''}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] text-white focus:outline-none focus:border-[#C9A962] transition-colors font-mono"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-[#333333] text-gray-400 hover:text-white hover:border-white transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-[#C9A962] text-[#0A0A0A] hover:bg-[#b09355] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono uppercase text-xs tracking-wider font-bold"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Task'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
