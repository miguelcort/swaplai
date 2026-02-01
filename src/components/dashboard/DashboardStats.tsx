import { ArrowDownLeft, ArrowUpRight, DollarSign, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '../ui/Card'

interface StatCardProps {
    title: string
    amount: string
    change: number
    icon: 'balance' | 'expenses' | 'savings'
    currency?: string
    index: number
}

export function DashboardStats() {
    const stats = [
        {
            title: 'Account Balance',
            amount: '35,340.89',
            change: 3.8,
            icon: 'balance' as const,
            currency: 'USD'
        },
        {
            title: 'Total Expenses',
            amount: '9,845.20',
            change: -21.3,
            icon: 'expenses' as const,
            currency: 'USD'
        },
        {
            title: 'Total Savings',
            amount: '18,420.75',
            change: 4.5,
            icon: 'savings' as const,
            currency: 'USD'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} index={index + 1} />
            ))}
        </div>
    )
}

function StatCard({ title, amount, change, icon, currency = 'USD', index }: StatCardProps) {
    const isPositive = change > 0
    const isBalance = icon === 'balance'

    const getIcon = () => {
        switch (icon) {
            case 'balance':
                return <DollarSign className="h-5 w-5 text-black" />
            case 'expenses':
                return <TrendingDown className="h-5 w-5 text-black" />
            case 'savings':
                return <PiggyBank className="h-5 w-5 text-black" />
        }
    }

    return (
        <Card className="p-6 relative group hover:border-primary transition-colors">
            {/* Numbering */}
            <div className="absolute top-4 left-4 text-xs font-mono text-primary opacity-50">
                {index.toString().padStart(2, '0')}
            </div>

            <div className="flex items-start justify-end mb-4">
                <div className="p-2 bg-primary rounded-none">
                    {getIcon()}
                </div>
            </div>

            <div className="space-y-2 mt-8">
                <p className="text-sm text-gray-400 uppercase tracking-wider font-mono">{title}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white font-sans">${amount}</span>
                    {currency && <span className="text-xs text-primary font-mono">{currency}</span>}
                </div>
                
                <div className="flex items-center gap-2 pt-2 border-t border-[#333333] mt-4">
                    {isPositive ? (
                        <TrendingUp className="h-4 w-4 text-primary" />
                    ) : (
                        <TrendingDown className="h-4 w-4 text-accent-red" />
                    )}
                    <span className={`text-sm font-mono ${isPositive ? 'text-primary' : 'text-accent-red'}`}>
                        {isPositive ? '+' : ''}{change}%
                    </span>
                    <span className="text-xs text-gray-500 font-mono uppercase">from last month</span>
                </div>
            </div>

            {isBalance && (
                <div className="flex flex-col sm:flex-row gap-0 mt-6 pt-0 border-t border-[#333333]">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#333333] hover:bg-primary hover:text-black text-white transition-colors text-xs font-mono uppercase tracking-wider">
                        <ArrowUpRight className="h-3 w-3" />
                        Send
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-l border-[#0A0A0A] bg-[#333333] hover:bg-white hover:text-black text-white transition-colors text-xs font-mono uppercase tracking-wider">
                        <ArrowDownLeft className="h-3 w-3" />
                        Request
                    </button>
                </div>
            )}
        </Card>
    )
}
