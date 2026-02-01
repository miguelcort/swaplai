import { create } from 'zustand'
import { type Session, type User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
    user: User | null
    session: Session | null
    isLoading: boolean
    credits: number
    initialize: () => Promise<void>
    signOut: () => Promise<void>
    fetchCredits: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    isLoading: true,
    credits: 0,

    initialize: async () => {
        try {
            // Check active session
            const { data: { session } } = await supabase.auth.getSession()
            set({ session, user: session?.user ?? null, isLoading: false })

            if (session?.user) {
                get().fetchCredits()
            }

            // Listen for changes
            supabase.auth.onAuthStateChange((_event, session) => {
                set({ session, user: session?.user ?? null, isLoading: false })
                if (session?.user) {
                    get().fetchCredits()
                } else {
                    set({ credits: 0 })
                }
            })
        } catch (error) {
            console.error('Auth initialization error:', error)
            set({ isLoading: false })
        }
    },

    fetchCredits: async () => {
        const { user } = get()
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('user_credits')
                .select('amount')
                .eq('user_id', user.id)
                .single()
            
            if (error) {
                // If not found, it might be a new user where trigger hasn't fired or migration not run
                console.error('Error fetching credits:', error)
                return
            }

            if (data) {
                set({ credits: data.amount })
            }
        } catch (error) {
            console.error('Failed to fetch credits:', error)
        }
    },

    signOut: async () => {
        await supabase.auth.signOut()
        set({ session: null, user: null, credits: 0 })
    },
}))
