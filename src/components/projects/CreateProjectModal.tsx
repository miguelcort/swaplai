import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { projectsApi } from '../../lib/projectsApi'
import type { CreateProjectInput, Project } from '../../types/projects'

interface CreateProjectModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    projectToEdit?: Project | null
}

export function CreateProjectModal({ isOpen, onClose, onSuccess, projectToEdit }: CreateProjectModalProps) {
    const [formData, setFormData] = useState<CreateProjectInput>({
        name: '',
        description: '',
        budget: 0
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (projectToEdit) {
            setFormData({
                name: projectToEdit.name,
                description: projectToEdit.description || '',
                budget: projectToEdit.budget
            })
        } else {
            setFormData({
                name: '',
                description: '',
                budget: 0
            })
        }
    }, [projectToEdit, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (projectToEdit) {
                await projectsApi.updateProject(projectToEdit.id, formData)
            } else {
                await projectsApi.createProject(formData)
            }
            
            if (!projectToEdit) {
                setFormData({ name: '', description: '', budget: 0 })
            }
            onSuccess()
            onClose()
        } catch (err: any) {
            setError(err.message || `Failed to ${projectToEdit ? 'update' : 'create'} project`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={projectToEdit ? "Edit Project" : "Create New Project"}>
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 bg-[#0A0A0A] border border-red-900 text-sm text-red-500 font-mono">
                        {error}
                    </div>
                )}

                {/* Project Name */}
                <div>
                    <label htmlFor="name" className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider font-mono">
                        Project Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] text-white focus:outline-none focus:border-[#C9A962] transition-colors font-mono"
                        placeholder="Enter project name"
                    />
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider font-mono">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] text-white focus:outline-none focus:border-[#C9A962] transition-colors font-mono"
                        placeholder="Describe your project..."
                    />
                </div>

                {/* Budget */}
                <div>
                    <label htmlFor="budget" className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider font-mono">
                        Budget ($)
                    </label>
                    <input
                        type="number"
                        id="budget"
                        min="0"
                        step="0.01"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] text-white focus:outline-none focus:border-[#C9A962] transition-colors font-mono"
                        placeholder="0.00"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t border-[#333333]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-[#333333] text-white hover:bg-[#333333] transition-colors font-mono uppercase text-xs tracking-wider font-bold"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-[#C9A962] text-[#0A0A0A] hover:bg-[#b09355] transition-colors font-mono uppercase text-xs tracking-wider font-bold disabled:opacity-50"
                    >
                        {loading ? (projectToEdit ? 'UPDATING...' : 'CREATING...') : (projectToEdit ? 'UPDATE PROJECT' : 'CREATE PROJECT')}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
