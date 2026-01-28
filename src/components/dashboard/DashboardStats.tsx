import { ArrowDownLeft, ArrowUpRight, DollarSign, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '../ui/Card'

interface StatCardProps {
    title: string
    amount: string
    change: number
    icon: 'balance' | 'expenses' | 'savings'
    currency?: string
}

export function DashboardStats() {
    const stats: StatCardProps[] = [
        {
            title: 'Account Balance',
            amount: '35,340.89',
            change: 3.8,
            icon: 'balance',
            currency: 'USD'
        },
        {
            title: 'Total Expenses',
            amount: '9,845.20',
            change: -21.3,
            icon: 'expenses',
            currency: 'USD'
        },
        {
            title: 'Total Savings',
            amount: '18,420.75',
            change: 4.5,
            icon: 'savings',
            currency: 'USD'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    )
}

function StatCard({ title, amount, change, icon, currency = 'USD' }: StatCardProps) {
    const isPositive = change > 0
    const isBalance = icon === 'balance'

    const getIcon = () => {
        switch (icon) {
            case 'balance':
                return <DollarSign className="h-5 w-5 text-emerald-600" />
            case 'expenses':
                return <TrendingDown className="h-5 w-5 text-emerald-600" />
            case 'savings':
                return <PiggyBank className="h-5 w-5 text-emerald-600" />
        }
    }

    return (
        <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-emerald-50 rounded-lg">
                    {getIcon()}
                </div>
                {currency && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md">
                        <span className="text-xs font-medium text-gray-600">{currency}</span>
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <p className="text-sm text-gray-600">{title}</p>
                <p className="text-3xl font-bold text-gray-900">${amount}</p>
                <div className="flex items-center gap-1">
                    {isPositive ? (
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{change}%
                    </span>
                    <span className="text-sm text-gray-500">from last month</span>
                </div>
            </div>

            {isBalance && (
                <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap">
                        <ArrowUpRight className="h-4 w-4" />
                        Send Money
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm font-medium whitespace-nowrap">
                        <ArrowDownLeft className="h-4 w-4" />
                        Request Money
                    </button>
                </div>
            )}
        </Card>
    )
}
