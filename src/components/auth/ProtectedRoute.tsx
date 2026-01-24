import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute() {
    const { user, isLoading } = useAuthStore()

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-bg-light">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}
