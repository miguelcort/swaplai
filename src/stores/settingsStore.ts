import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NotificationSettings {
    email: boolean
    push: boolean
    marketing: boolean
}

interface SettingsState {
    notifications: NotificationSettings
    theme: 'light' | 'dark' | 'system'
    language: 'en' | 'es'

    toggleNotification: (key: keyof NotificationSettings) => void
    setTheme: (theme: 'light' | 'dark' | 'system') => void
    setLanguage: (lang: 'en' | 'es') => void
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            notifications: {
                email: true,
                push: true,
                marketing: false,
            },
            theme: 'system',
            language: 'en',

            toggleNotification: (key) =>
                set((state) => ({
                    notifications: {
                        ...state.notifications,
                        [key]: !state.notifications[key],
                    },
                })),
            setTheme: (theme) => set({ theme }),
            setLanguage: (language) => set({ language }),
        }),
        {
            name: 'app-settings', // unique name
        }
    )
)
