import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { type Message } from '../../types/chat.types'
import { Avatar, AvatarFallback } from '../ui/Avatar'
import { Sparkles, Copy, RotateCcw, ThumbsUp, ThumbsDown, Check } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { ProfileProposalCard } from './ProfileProposalCard'
import { ProjectProposalCard } from './ProjectProposalCard'
import { TaskProposalCard } from './TaskProposalCard'

interface MessageBubbleProps {
    message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user'
    const [copied, setCopied] = useState(false)
    const [showProfile, setShowProfile] = useState(true)
    const [showProject, setShowProject] = useState(true)
    const [showTask, setShowTask] = useState(true)
    const { user } = useAuthStore()
    
    // Check for Proposal Patterns
    const profileRegex = /<<<PROPOSAL:\s*({[\s\S]*?})\s*>>>/
    const projectRegex = /<<<PROJECT_PROPOSAL:\s*({[\s\S]*?})\s*>>>/
    const taskRegex = /<<<TASK_PROPOSAL:\s*({[\s\S]*?})\s*>>>/
    
    const profileMatch = !isUser && message.content.match(profileRegex)
    const projectMatch = !isUser && message.content.match(projectRegex)
    const taskMatch = !isUser && message.content.match(taskRegex)
    
    let displayContent = message.content
    let profileData = null
    let projectData = null
    let taskData = null

    if (profileMatch) {
        try {
            profileData = JSON.parse(profileMatch[1])
            displayContent = displayContent.replace(profileMatch[0], '')
        } catch (e) { console.error('Failed to parse profile JSON', e) }
    }

    if (projectMatch) {
        try {
            projectData = JSON.parse(projectMatch[1])
            displayContent = displayContent.replace(projectMatch[0], '')
        } catch (e) { console.error('Failed to parse project JSON', e) }
    }

    if (taskMatch) {
        try {
            taskData = JSON.parse(taskMatch[1])
            displayContent = displayContent.replace(taskMatch[0], '')
        } catch (e) { console.error('Failed to parse task JSON', e) }
    }
    
    displayContent = displayContent.trim()
    
    const initials = user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || 
                     user?.email?.substring(0, 2).toUpperCase() || "U"

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(displayContent)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    // Bot Action Button Component
    const ActionButton = ({ icon: Icon, onClick, label }: { icon: any, onClick?: () => void, label?: string }) => (
        <button 
            onClick={onClick}
            className="p-1 rounded-none text-text-secondary hover:text-primary hover:bg-border transition-colors duration-200"
            title={label}
        >
            <Icon className="h-4 w-4" />
        </button>
    )

    if (isUser) {
        return (
            <div className="flex w-full justify-end px-4 py-4">
                <div className="flex gap-3 max-w-[85%] flex-row-reverse">
                    <Avatar className="h-8 w-8 mt-1 border border-primary shadow-none shrink-0 rounded-none bg-bg-dark">
                        <AvatarFallback className="bg-bg-dark text-text-primary font-mono rounded-none font-bold text-xs">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className="bg-primary rounded-none px-5 py-3 text-bg-dark border border-primary font-bold">
                        <p className="whitespace-pre-wrap leading-relaxed font-mono text-sm">{message.content}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex w-full gap-4 px-4 py-6 hover:bg-bg-light transition-colors group border-b border-border/50">
            <Avatar className="h-8 w-8 mt-1 border border-primary/30 bg-bg-dark shrink-0 shadow-none rounded-none">
                <AvatarFallback className="bg-bg-dark rounded-none">
                    <Sparkles className="h-4 w-4 text-primary" />
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2 overflow-hidden min-w-0">
                <div className="prose prose-sm prose-invert max-w-none text-text-secondary prose-headings:font-bold prose-headings:text-text-primary prose-a:text-primary hover:prose-a:text-primary/80 prose-code:text-primary prose-pre:bg-bg-light prose-pre:text-text-secondary prose-strong:text-text-primary font-sans">
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                    >
                        {displayContent}
                    </ReactMarkdown>
                </div>

                {/* Profile Proposal Card */}
                {profileData && showProfile && (
                    <ProfileProposalCard 
                        data={profileData} 
                        onDismiss={() => setShowProfile(false)} 
                    />
                )}

                {/* Project Proposal Card */}
                {projectData && showProject && (
                    <ProjectProposalCard 
                        data={projectData} 
                        onDismiss={() => setShowProject(false)} 
                    />
                )}

                {/* Task Proposal Card */}
                {taskData && showTask && (
                    <TaskProposalCard 
                        data={taskData} 
                        onDismiss={() => setShowTask(false)} 
                    />
                )}

                {/* Bot Actions */}
                <div className="flex items-center gap-2 mt-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ActionButton 
                        icon={copied ? Check : Copy} 
                        onClick={handleCopy} 
                        label={copied ? "Copied!" : "Copy text"} 
                    />
                    <ActionButton 
                        icon={RotateCcw} 
                        onClick={() => {}} // Placeholder for retry
                        label="Retry response" 
                    />
                    <div className="h-4 w-px bg-border mx-1" />
                    <ActionButton 
                        icon={ThumbsUp} 
                        onClick={() => {}} 
                        label="Good response" 
                    />
                    <ActionButton 
                        icon={ThumbsDown} 
                        onClick={() => {}} 
                        label="Bad response" 
                    />
                </div>
            </div>
        </div>
    )
}
