import { DashboardStats } from '../components/dashboard/DashboardStats'
import { WalletSection } from '../components/dashboard/WalletSection'
import { OverviewChart } from '../components/dashboard/OverviewChart'
//import { TransactionList } from '../components/dashboard/TransactionList'
import { GoalsSection } from '../components/dashboard/GoalsSection'
import { ProjectsTable } from '../components/dashboard/ProjectsTable'
import { NotificationBell } from '../components/layout/NotificationBell'
//import { Crown } from 'lucide-react'

export default function Dashboard() {
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })

    return (
        <div className="flex flex-col min-h-full bg-bg-dark text-text-primary font-sans">
            {/* Header */}
            <div className="bg-bg-dark border-b border-[#333333] px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight font-serif">Welcome back Swaplai User</h1>
                        <p className="text-sm text-gray-400 mt-1 font-mono uppercase tracking-wider">Monitor and control what happens with your money.</p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                        <NotificationBell />
                        <div className="flex items-center gap-2 px-3 py-2 bg-[#0A0A0A] border border-[#333333] rounded-none flex-1 md:flex-none justify-center md:justify-start">
                            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium text-white font-mono whitespace-nowrap">{currentDate}</span>
                        </div>
                        <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-black rounded-none transition-colors text-sm font-medium whitespace-nowrap uppercase tracking-wider font-mono border border-transparent">
                            Export
                        </button>
                    </div>
                </div>
            </div>            


            {/* Main Content */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Stats Cards */}
                    <DashboardStats />

                    {/* Wallet and Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <WalletSection />
                        <GoalsSection />
                    </div>

                    {/* Chart */}
                    <OverviewChart />

                    {/* Projects Table */}
                    <ProjectsTable />

                </div>
            </div>

        </div>
    )
}
