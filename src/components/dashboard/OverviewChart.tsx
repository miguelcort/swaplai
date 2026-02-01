import { MoreHorizontal } from 'lucide-react'
import { Card } from '../ui/Card'

interface ChartData {
    month: string
    earnings: number
}

export function OverviewChart() {
    const data: ChartData[] = [
        { month: 'Jan', earnings: 25000 },
        { month: 'Feb', earnings: 35000 },
        { month: 'Mar', earnings: 30000 },
        { month: 'Apr', earnings: 40000 },
        { month: 'May', earnings: 45000 },
        { month: 'Jun', earnings: 38000 },
        { month: 'Jul', earnings: 42000 },
        { month: 'Aug', earnings: 84849.93 },
        { month: 'Sep', earnings: 35000 },
        { month: 'Oct', earnings: 32000 },
        { month: 'Nov', earnings: 28000 },
        { month: 'Dec', earnings: 38000 }
    ]

    const maxEarnings = Math.max(...data.map(d => d.earnings))

    return (
        <Card className="p-6 relative">
            <div className="absolute top-4 left-4 text-xs font-mono text-primary opacity-50">06</div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pl-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-none">
                        <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white uppercase tracking-wider font-sans">Overview</h3>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary rounded-none"></div>
                        <span className="text-sm text-gray-400 font-mono">Earnings</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <select className="px-3 py-1 text-sm border border-[#333333] bg-[#0A0A0A] text-white rounded-none focus:outline-none focus:ring-1 focus:ring-primary font-mono uppercase">
                            <option>This Year</option>
                            <option>Last Year</option>
                            <option>Last 6 Months</option>
                        </select>
                        <button className="text-gray-400 hover:text-white">
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="flex items-end justify-between gap-2 h-64 min-w-[600px]">
                    {data.map((item, index) => {
                    const heightPercentage = (item.earnings / maxEarnings) * 100
                    const isHighlighted = item.month === 'Aug'

                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="relative w-full flex items-end justify-center" style={{ height: '200px' }}>
                                {isHighlighted && (
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary text-black px-2 py-1 rounded-none text-xs font-mono font-medium whitespace-nowrap z-10">
                                        ${item.earnings.toLocaleString()}
                                    </div>
                                )}
                                <div
                                    className={`w-full rounded-none transition-all hover:opacity-100 ${isHighlighted ? 'bg-primary' : 'bg-[#333333] opacity-60 hover:bg-primary/50'
                                        }`}
                                    style={{ height: `${heightPercentage}%` }}
                                ></div>
                            </div>
                            <span className={`text-xs font-mono font-medium ${isHighlighted ? 'text-primary' : 'text-gray-500'}`}>{item.month}</span>
                        </div>
                    )
                })}
            </div>
            </div>
        </Card>
    )
}
