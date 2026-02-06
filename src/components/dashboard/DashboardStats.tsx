import { Folder, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { Card } from '../ui/Card'
import { Link } from 'react-router-dom'

interface DashboardStatsProps {
    totalProjects: number
    pendingTasks: number
    completedTasks: number
    isLoading?: boolean
}

export function DashboardStats({ totalProjects, pendingTasks, completedTasks, isLoading }: DashboardStatsProps) {
    const stats = [
        {
            title: 'Active Projects',
            value: totalProjects,
            icon: 'projects' as const,
            link: '/projects',
            color: 'text-blue-500'
        },
        {
            title: 'Pending Tasks',
            value: pendingTasks,
            icon: 'pending' as const,
            link: '/tasks', // Assuming there is a tasks page or similar, if not we can link to projects
            color: 'text-yellow-500'
        },
        {
            title: 'Completed Tasks',
            value: completedTasks,
            icon: 'completed' as const,
            link: '/tasks?status=completed',
            color: 'text-green-500'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} index={index + 1} isLoading={isLoading} />
            ))}
        </div>
    )
}

interface StatCardProps {
    title: string
    value: number
    icon: 'projects' | 'pending' | 'completed'
    link: string
    color: string
    index: number
    isLoading?: boolean
}

function StatCard({ title, value, icon, link, color, index, isLoading }: StatCardProps) {
    const getIcon = () => {
        switch (icon) {
            case 'projects':
                return <Folder className={`h-6 w-6 ${color}`} />
            case 'pending':
                return <Clock className={`h-6 w-6 ${color}`} />
            case 'completed':
                return <CheckCircle className={`h-6 w-6 ${color}`} />
        }
    }

    return (
        <Card className="p-6 relative group hover:border-primary transition-colors bg-bg-card border-border">
            {/* Numbering */}
            <div className="absolute top-4 left-4 text-xs font-mono text-text-secondary group-hover:text-primary transition-colors">
                {index.toString().padStart(2, '0')}
            </div>

            <div className="flex items-start justify-end mb-4">
                <div className="p-3 bg-bg-dark rounded-full border border-border group-hover:border-primary/50 transition-colors">
                    {getIcon()}
                </div>
            </div>

            <div className="space-y-2 mt-4">
                <p className="text-sm text-text-secondary uppercase tracking-wider font-mono">{title}</p>
                
                {isLoading ? (
                    <div className="h-9 w-24 bg-bg-dark animate-pulse rounded" />
                ) : (
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-text-primary font-sans">{value}</span>
                    </div>
                )}
                
                <div className="pt-4 mt-4 border-t border-border">
                    <Link to={link} className="inline-flex items-center gap-2 text-xs font-mono text-text-secondary hover:text-primary transition-colors uppercase tracking-wider">
                        View Details <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
            </div>
        </Card>
    )
}
