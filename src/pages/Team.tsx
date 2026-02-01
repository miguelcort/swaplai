import { useState, useEffect } from 'react'
import { Plus, Users, UserPlus } from 'lucide-react'
//import { useAuthStore } from '../stores/authStore'
import { projectsApi } from '../lib/projectsApi'
import { NotificationBell } from '../components/layout/NotificationBell'
import { InviteTeamModal } from '../components/projects/InviteTeamModal'
import { CreateProjectModal } from '../components/projects/CreateProjectModal'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Avatar, AvatarFallback } from '../components/ui/Avatar'
import type { Project } from '../types/projects'

export default function Team() {
    //const { user } = useAuthStore()
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
        return <div className="p-8 text-white font-mono">Loading...</div>
    }

    return (
        <div className="flex flex-col h-full bg-[#0A0A0A]">
            <div className="bg-[#0A0A0A] border-b border-[#333333] px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white font-sans uppercase tracking-wide">Team Management</h1>
                        <p className="text-sm text-gray-400 mt-1 font-mono">Manage your project teams and invitations</p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                        <NotificationBell />
                        <Button onClick={() => setIsCreateProjectModalOpen(true)} className="w-full md:w-auto bg-primary text-black hover:bg-primary/90 rounded-none font-bold uppercase tracking-wider">
                            <Plus className="h-4 w-4 mr-2" />
                            New Project
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {projects.length === 0 ? (
                        <div className="text-center py-12 bg-[#0A0A0A] rounded-none border border-[#333333]">
                            <Users className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                            <h3 className="text-lg font-bold text-white uppercase tracking-wide">No projects found</h3>
                            <p className="text-gray-400 mb-6 font-mono">Create a project to start building your team</p>
                            <Button onClick={() => setIsCreateProjectModalOpen(true)} className="bg-primary text-black rounded-none uppercase font-bold tracking-wider">
                                Create Project
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {projects.map((project) => (
                                <Card key={project.id} className="p-6 bg-[#0A0A0A] border border-[#333333] rounded-none">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-white font-sans uppercase tracking-wide">{project.name}</h3>
                                            <p className="text-sm text-gray-400 font-mono mt-1">{project.description}</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleInviteClick(project)}
                                            className="border-[#333333] text-white hover:bg-[#333333] rounded-none uppercase font-mono text-xs tracking-wider"
                                        >
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Invite Member
                                        </Button>
                                    </div>

                                    <div className="border-t border-[#333333] pt-4">
                                        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2 font-mono uppercase tracking-wider">
                                            <Users className="h-4 w-4 text-primary" />
                                            Team Members
                                        </h4>
                                        <div className="space-y-3">
                                            {project.members && project.members.length > 0 ? (
                                                project.members.map((member: any) => (
                                                    <div key={member.id} className="flex items-center justify-between bg-[#111111] p-3 rounded-none border border-[#333333]">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8 rounded-none border border-[#333333]">
                                                                <AvatarFallback className="bg-black text-white font-mono rounded-none font-bold">
                                                                    {member.profiles?.full_name?.substring(0, 2).toUpperCase() || member.profiles?.email?.substring(0, 2).toUpperCase() || 'U'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="text-sm font-bold text-white font-sans uppercase tracking-wide">
                                                                    {member.profiles?.full_name || member.profiles?.email || `User ${member.user_id.substring(0, 8)}`}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded-none uppercase font-mono border ${member.role === 'admin'
                                                                        ? 'bg-[#333333] text-primary border-primary'
                                                                        : 'bg-[#111] text-gray-400 border-[#333333]'
                                                                        }`}>
                                                                        {member.role}
                                                                    </span>
                                                                    <span className={`text-[10px] px-2 py-0.5 rounded-none uppercase font-mono border ${member.status === 'active' || member.status === 'accepted'
                                                                        ? 'bg-green-900/20 text-green-400 border-green-900'
                                                                        : 'bg-yellow-900/20 text-yellow-400 border-yellow-900'
                                                                        }`}>
                                                                        {member.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 italic font-mono">No members yet</p>
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
