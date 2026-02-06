import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { tasksApi } from '../../lib/projectsApi'
import { Calendar, DollarSign, User, Flag } from 'lucide-react'
import type { CreateTaskInput, ProjectMember, TaskPriority, Task } from '../../types/projects'

interface CreateTaskModalProps {
    isOpen: boolean
    onClose: () => void
    projectId: string
    members: ProjectMember[]
    onSuccess: () => void
    taskToEdit?: Task | null
}

export function CreateTaskModal({ isOpen, onClose, projectId, members, onSuccess, taskToEdit }: CreateTaskModalProps) {
    const [formData, setFormData] = useState<CreateTaskInput>({
        title: '',
        description: '',
        priority: 'medium',
        cost: 0,
        assigned_to: '',
        due_date: '',
        frequency: 'once',
        duration: '',
        notes: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (taskToEdit) {
            setFormData({
                title: taskToEdit.title,
                description: taskToEdit.description || '',
                priority: taskToEdit.priority,
                cost: taskToEdit.cost,
                assigned_to: taskToEdit.assigned_to || '',
                due_date: taskToEdit.due_date ? taskToEdit.due_date.split('T')[0] : '',
                frequency: taskToEdit.frequency || 'once',
                duration: taskToEdit.duration || '',
                notes: taskToEdit.notes || ''
            })
        } else {
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                cost: 0,
                assigned_to: '',
                due_date: '',
                frequency: 'once',
                duration: '',
                notes: ''
            })
        }
    }, [taskToEdit, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (taskToEdit) {
                await tasksApi.updateTask(taskToEdit.id, formData)
            } else {
                await tasksApi.createTask(projectId, formData)
            }
            
            if (!taskToEdit) {
                setFormData({
                    title: '',
                    description: '',
                    priority: 'medium',
                    cost: 0,
                    assigned_to: '',
                    due_date: '',
                    frequency: 'once',
                    duration: '',
                    notes: ''
                })
            }
            onSuccess()
            onClose()
        } catch (err: any) {
            setError(err.message || `Failed to ${taskToEdit ? 'update' : 'create'} task`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={taskToEdit ? "Edit Task" : "Create New Task"}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 bg-bg-dark border border-red-900 text-sm text-red-500 font-mono">
                        {error}
                    </div>
                )}

                {/* Title */}
                <div>
                    <label htmlFor="title" className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">
                        Task Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-bg-dark border border-border text-text-primary focus:outline-none focus:border-primary transition-colors font-mono"
                        placeholder="e.g. Implement user authentication"
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">
                        Description
                    </label>
                    <textarea
                        id="description"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 bg-bg-dark border border-border text-text-primary focus:outline-none focus:border-primary transition-colors font-mono"
                        placeholder="Add details about the task..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Priority */}
                    <div>
                        <label htmlFor="priority" className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">
                            <div className="flex items-center gap-1">
                                <Flag className="h-3 w-3" />
                                Priority
                            </div>
                        </label>
                        <select
                            id="priority"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                            className="w-full px-4 py-3 bg-bg-dark border border-border text-text-primary focus:outline-none focus:border-primary transition-colors font-mono"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    {/* Cost */}
                    <div>
                        <label htmlFor="cost" className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">
                            <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Cost ($)
                            </div>
                        </label>
                        <input
                            type="number"
                            id="cost"
                            min="0"
                            step="0.01"
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-3 bg-bg-dark border border-border text-text-primary focus:outline-none focus:border-primary transition-colors font-mono"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Assignee */}
                    <div>
                        <label htmlFor="assigned_to" className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">
                            <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Assignee
                            </div>
                        </label>
                        <select
                            id="assigned_to"
                            value={formData.assigned_to || ''}
                            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value || undefined })}
                            className="w-full px-4 py-3 bg-bg-dark border border-border text-text-primary focus:outline-none focus:border-primary transition-colors font-mono"
                        >
                            <option value="">Unassigned</option>
                            {members.map((member) => (
                                <option key={member.id} value={member.user_id}>
                                    {member.profiles?.full_name || member.profiles?.email || 'Unknown User'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label htmlFor="due_date" className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">
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
                            className="w-full px-4 py-3 bg-bg-dark border border-border text-text-primary focus:outline-none focus:border-primary transition-colors font-mono"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Frequency */}
                    <div>
                        <label htmlFor="frequency" className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">
                             Frequency
                        </label>
                        <select
                            id="frequency"
                            value={formData.frequency || 'once'}
                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                            className="w-full px-4 py-3 bg-bg-dark border border-border text-text-primary focus:outline-none focus:border-primary transition-colors font-mono"
                        >
                            <option value="once">Once</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    {/* Duration */}
                    <div>
                        <label htmlFor="duration" className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">
                             Duration
                        </label>
                        <input
                            type="text"
                            id="duration"
                            value={formData.duration || ''}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            className="w-full px-4 py-3 bg-bg-dark border border-border text-text-primary focus:outline-none focus:border-primary transition-colors font-mono"
                            placeholder="e.g. 30 mins"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label htmlFor="notes" className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider font-mono">
                        Notes
                    </label>
                    <textarea
                        id="notes"
                        rows={2}
                        value={formData.notes || ''}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-3 bg-bg-dark border border-border text-text-primary focus:outline-none focus:border-primary transition-colors font-mono"
                        placeholder="Additional notes..."
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t border-border">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-border text-text-secondary hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-primary text-black hover:bg-primary/90 transition-colors font-mono uppercase text-xs tracking-wider font-bold disabled:opacity-50"
                    >
                        {loading ? (taskToEdit ? 'UPDATING...' : 'CREATING...') : (taskToEdit ? 'UPDATE TASK' : 'CREATE TASK')}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
