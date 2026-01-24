import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
    id: string
    title: string
    description?: string
    type?: ToastType
    duration?: number
}

interface ToastState {
    toasts: Toast[]
    addToast: (toast: Omit<Toast, 'id'>) => void
    removeToast: (id: string) => void
}

export const useToast = create<ToastState>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = crypto.randomUUID()
        set((state) => ({
            toasts: [...state.toasts, { ...toast, id }],
        }))

        // Auto remove after duration (default 3s)
        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id)
            }))
        }, toast.duration || 3000)
    },
    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
}))

export const toast = (props: Omit<Toast, 'id'>) => useToast.getState().addToast(props)
