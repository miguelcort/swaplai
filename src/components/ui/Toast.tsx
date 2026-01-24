import { useToast } from '../../hooks/useToast'
import { cn } from '../../lib/utils'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
}

const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
}

export function ToastContainer() {
    const { toasts, removeToast } = useToast()

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
            {toasts.map((t) => {
                const Icon = icons[t.type || 'info']
                return (
                    <div
                        key={t.id}
                        className={cn(
                            "pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-right-full duration-300",
                            styles[t.type || 'info']
                        )}
                        role="alert"
                    >
                        <Icon className="h-5 w-5 shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-medium text-sm">{t.title}</h3>
                            {t.description && (
                                <p className="mt-1 text-sm opacity-90">{t.description}</p>
                            )}
                        </div>
                        <button
                            onClick={() => removeToast(t.id)}
                            className="shrink-0 rounded-md p-1 opacity-50 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
