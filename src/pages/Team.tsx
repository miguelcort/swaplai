import { useState, useEffect } from 'react'
import { Plus, Users, Mail, Shield } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { projectsApi } from '../lib/projectsApi'
import { InviteTeamModal } from '../components/projects/InviteTeamModal'
import { CreateProjectModal } from '../components/projects/CreateProjectModal'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar'
import type { Project } from '../types/projects'

export default function Team() {
    const { user } = useAuthStore()
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false)

    useEffect(() => {
        loadProjects()
    }, [])

    const loadProjects = async () => {
        try {
            const data = await projectsApi.getProjects()
            setProjects(data)
        } catch (error) {
            console.error('Error loading projects:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleInviteClick = (project: Project) => {
        setSelectedProject(project)
        setIsInviteModalOpen(true)
    }

    const handleInviteSuccess = () => {
        loadProjects() // Reload to show new members
    }

    if (loading) {
        return <div className="p-8">Loading...</div>
    }

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Team Management</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage your project teams and invitations</p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                        <Button onClick={() => setIsCreateProjectModalOpen(true)} className="w-full md:w-auto">
                            <Plus className="h-4 w-4 mr-2" />
                            New Project
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {projects.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
                    <p className="text-gray-500 mb-6">Create a project to start building your team</p>
                    <Button onClick={() => setIsCreateProjectModalOpen(true)}>
                        Create Project
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {projects.map((project) => (
                        <Card key={project.id} className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                                    <p className="text-sm text-gray-500">{project.description}</p>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleInviteClick(project)}
                                >
                                    <UserPlusIcon className="h-4 w-4 mr-2" />
                                    Invite Member
                                </Button>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Team Members
                                </h4>
                                <div className="space-y-3">
                                    {project.members && project.members.length > 0 ? (
                                        project.members.map((member: any) => (
                                            <div key={member.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={member.profiles?.avatar_url || undefined} />
                                                        <AvatarFallback>
                                                            {member.profiles?.full_name?.charAt(0).toUpperCase() || member.profiles?.email?.charAt(0).toUpperCase() || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {member.profiles?.full_name || member.profiles?.email || `User ${member.user_id.substring(0, 8)}`}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                                                                member.role === 'admin' 
                                                                    ? 'bg-purple-100 text-purple-700' 
                                                                    : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                                {member.role}
                                                            </span>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                                                                member.status === 'active' || member.status === 'accepted'
                                                                    ? 'bg-green-100 text-green-700' 
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                                {member.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No members yet</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {selectedProject && (
                <InviteTeamModal
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                    projectId={selectedProject.id}
                    onSuccess={handleInviteSuccess}
                />
            )}

            <CreateProjectModal
                isOpen={isCreateProjectModalOpen}
                onClose={() => setIsCreateProjectModalOpen(false)}
                onSuccess={loadProjects}
            />
                </div>
            </div>
        </div>
    )
}

function UserPlusIcon({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" y1="8" x2="20" y2="14" />
            <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
    )
}
