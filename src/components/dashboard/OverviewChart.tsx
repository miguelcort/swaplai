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
        <Card className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Overview</h3>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-600 rounded-sm"></div>
                        <span className="text-sm text-gray-600">Earnings</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <select className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            <option>This Year</option>
                            <option>Last Year</option>
                            <option>Last 6 Months</option>
                        </select>
                        <button className="text-gray-400 hover:text-gray-600">
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
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="relative w-full flex items-end justify-center" style={{ height: '200px' }}>
                                {isHighlighted && (
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                                        ${item.earnings.toLocaleString()}
                                    </div>
                                )}
                                <div
                                    className={`w-full rounded-t-md transition-all hover:opacity-80 ${isHighlighted ? 'bg-emerald-600' : 'bg-emerald-200'
                                        }`}
                                    style={{ height: `${heightPercentage}%` }}
                                ></div>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">{item.month}</span>
                        </div>
                    )
                })}
            </div>
            </div>
        </Card>
    )
}
