import { useEffect, useState } from 'react'
import { DashboardStats } from '../components/dashboard/DashboardStats'
import { ProjectsTable } from '../components/dashboard/ProjectsTable'
import { NotificationBell } from '../components/layout/NotificationBell'
import { projectsApi } from '../lib/projectsApi'
//import { Crown } from 'lucide-react'

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalProjects: 0,
        pendingTasks: 0,
        completedTasks: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await projectsApi.getDashboardStats()
                setStats(data)
            } catch (error) {
                console.error('Failed to load dashboard stats:', error)
            } finally {
                setLoading(false)
            }
        }
        loadStats()
    }, [])

    return (
        <div className="flex flex-col min-h-full bg-bg-dark text-text-primary font-sans">
            {/* Header */}
            <div className="bg-bg-dark border-b border-border px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold text-primary tracking-tight font-serif">Welcome back Swaplai User</h1>
                        <p className="text-sm text-text-secondary mt-1 font-mono uppercase tracking-wider">Monitor and control your projects and tasks.</p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                        <NotificationBell />
                    </div>
                </div>
            </div>            


            {/* Main Content */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Stats Cards */}
                    <DashboardStats 
                        totalProjects={stats.totalProjects}
                        pendingTasks={stats.pendingTasks}
                        completedTasks={stats.completedTasks}
                        isLoading={loading}
                    />

                    {/* Projects Table */}
                    <ProjectsTable />

                </div>
            </div>

        </div>
    )
}
