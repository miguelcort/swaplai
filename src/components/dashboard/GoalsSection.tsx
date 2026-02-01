import { MoreHorizontal } from 'lucide-react'
import { Card } from '../ui/Card'

interface Goal {
    id: string
    icon: string
    iconBg: string
    name: string
    current: number
    target: number
    percentage: number
}

export function GoalsSection() {
    const goals: Goal[] = [
        {
            id: '1',
            icon: '📈',
            iconBg: 'bg-[#333333]',
            name: 'Investment Goal',
            current: 15600,
            target: 25000,
            percentage: 62
        },
        {
            id: '2',
            icon: '🏥',
            iconBg: 'bg-[#333333]',
            name: 'Emergency Fund',
            current: 8200,
            target: 15000,
            percentage: 55
        }
    ]

    return (
        <Card className="p-6 relative">
            <div className="absolute top-4 left-4 text-xs font-mono text-primary opacity-50">05</div>
            <div className="flex items-center justify-between mb-6 pl-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-none">
                        <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white uppercase tracking-wider font-sans">My Savings Plan</h3>
                </div>
                <button className="text-gray-400 hover:text-white">
                    <MoreHorizontal className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-4">
                {goals.map((goal) => (
                    <GoalCard key={goal.id} {...goal} />
                ))}
            </div>
        </Card>
    )
}

function GoalCard({ icon, iconBg, name, current, target, percentage }: Goal) {
    return (
        <div className="p-4 bg-transparent border border-[#333333] hover:border-primary transition-colors group">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${iconBg} flex items-center justify-center text-lg grayscale group-hover:grayscale-0`}>
                        {icon}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white font-sans uppercase tracking-wide">{name}</p>
                        <p className="text-xs text-gray-500 font-mono">
                            ${current.toLocaleString()}/${target.toLocaleString()}
                        </p>
                    </div>
                </div>
                <span className="text-sm font-semibold text-primary font-mono">{percentage}%</span>
            </div>

            <div className="w-full bg-[#333333] h-1">
                <div
                    className="bg-primary h-1 transition-all"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    )
}
