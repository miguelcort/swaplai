import { MoreHorizontal } from 'lucide-react'
import { Card } from '../ui/Card'

interface WalletAccount {
    id: string
    currency: string
    currencyCode: string
    balance: number
    status: 'Active' | 'Inactive'
    flag: string
}

export function WalletSection() {
    const accounts: WalletAccount[] = [
        {
            id: '1',
            currency: 'USD',
            currencyCode: 'USD',
            balance: 22678.00,
            status: 'Active',
            flag: '🇺🇸'
        },
        {
            id: '2',
            currency: 'EUR',
            currencyCode: 'EUR',
            balance: 18345.00,
            status: 'Active',
            flag: '🇪🇺'
        },
        {
            id: '3',
            currency: 'BDT',
            currencyCode: 'BDT',
            balance: 122678.00,
            status: 'Active',
            flag: '🇧🇩'
        },
        {
            id: '4',
            currency: 'GBP',
            currencyCode: 'GBP',
            balance: 15000.00,
            status: 'Inactive',
            flag: '🇬🇧'
        }
    ]

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">My Wallet</h3>
                <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    + Add New
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {accounts.map((account) => (
                    <WalletCard key={account.id} {...account} />
                ))}
            </div>
        </Card>
    )
}

function WalletCard({ currencyCode, balance, status, flag }: WalletAccount) {
    const isActive = status === 'Active'

    const formatBalance = (amount: number, code: string) => {
        const symbols: Record<string, string> = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            BDT: '৳'
        }
        return `${symbols[code] || ''}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    return (
        <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{flag}</span>
                    <span className="text-sm font-medium text-gray-700">{currencyCode}</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </div>

            <div className="space-y-1">
                <p className="text-xl font-bold text-gray-900">
                    {formatBalance(balance, currencyCode)}
                </p>
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                    }`}>
                    {status}
                </span>
            </div>
        </div>
    )
}
