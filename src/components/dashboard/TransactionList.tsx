import { Filter, MoreHorizontal } from 'lucide-react'
import { Card } from '../ui/Card'

interface Transaction {
    id: string
    icon: string
    iconBg: string
    activity: string
    date: string
    price: number
    status: 'Success' | 'Pending' | 'Failed'
}

export function TransactionList() {
    const transactions: Transaction[] = [
        {
            id: '1',
            icon: '📱',
            iconBg: 'bg-blue-100',
            activity: 'Mobile App Purchase',
            date: 'Wed, 12 Jun 2026',
            price: 806.50,
            status: 'Success'
        },
        {
            id: '2',
            icon: '📄',
            iconBg: 'bg-red-100',
            activity: 'Software License',
            date: 'Tue, 11 Jun 2026',
            price: 102.99,
            status: 'Success'
        },
        {
            id: '3',
            icon: '🛒',
            iconBg: 'bg-yellow-100',
            activity: 'Grocery Purchase',
            date: 'Sun, 09 Jun 2026',
            price: 2500.00,
            status: 'Success'
        }
    ]

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Recent Transaction</h3>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Filter className="h-4 w-4" />
                    Filter
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                            <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="pb-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="pb-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {transactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 ${transaction.iconBg} rounded-lg flex items-center justify-center text-lg`}>
                                            {transaction.icon}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{transaction.activity}</span>
                                    </div>
                                </td>
                                <td className="py-4 text-sm text-gray-600">{transaction.date}</td>
                                <td className="py-4 text-sm font-medium text-gray-900">${transaction.price.toFixed(2)}</td>
                                <td className="py-4">
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                                        {transaction.status}
                                    </span>
                                </td>
                                <td className="py-4">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    )
}
