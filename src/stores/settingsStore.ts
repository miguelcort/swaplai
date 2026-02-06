import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NotificationSettings {
    email: boolean
    push: boolean
    marketing: boolean
}

interface SettingsState {
    notifications: NotificationSettings
    theme: 'light' | 'dark' | 'system' | 'custom'
    language: 'en' | 'es'
    customColors?: {
        background: string
        primary: string
        text: string
    }

    toggleNotification: (key: keyof NotificationSettings) => void
    setTheme: (theme: 'light' | 'dark' | 'system' | 'custom') => void
    setLanguage: (lang: 'en' | 'es') => void
    setCustomColors: (colors: { background: string; primary: string; text: string }) => void
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
            customColors: {
                background: '#0A0A0A',
                primary: '#C9A962',
                text: '#FFFFFF'
            },

            toggleNotification: (key) =>
                set((state) => ({
                    notifications: {
                        ...state.notifications,
                        [key]: !state.notifications[key],
                    },
                })),
            setTheme: (theme) => set({ theme }),
            setLanguage: (language) => set({ language }),
            setCustomColors: (colors) => set({ customColors: colors }),
        }),
        {
            name: 'app-settings', // unique name
        }
    )
)
