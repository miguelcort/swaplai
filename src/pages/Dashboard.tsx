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
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Welcome back Swaplai User</h1>
                        <p className="text-sm text-gray-600 mt-1">Monitor and control what happens with your money today for financial health.</p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                        <NotificationBell />
                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg flex-1 md:flex-none justify-center md:justify-start">
                            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{currentDate}</span>
                        </div>
                        <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap">
                            Export
                        </button>
                    </div>
                </div>
            </div>            


            {/* Main Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Stats Cards */}
                    <DashboardStats />

                    {/* Wallet and Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
