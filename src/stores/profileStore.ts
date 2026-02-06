import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export interface Profile {
    id: string
    first_name: string | null
    last_name: string | null
    email: string | null
    avatar_url: string | null
    bio: string | null
    preferences: string | null
    website: string | null
    is_searchable: boolean | null
}

interface ProfileState {
    profile: Profile | null
    isLoading: boolean
    fetchProfile: () => Promise<void>
    updateProfile: (updates: Partial<Profile>) => Promise<void>
}

export const useProfileStore = create<ProfileState>((set, get) => ({
    profile: null,
    isLoading: false,

    fetchProfile: async () => {
        set({ isLoading: true })
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) {
                // If profile doesn't exist (e.g. created before migration trigger), try creating it
                if (error.code === 'PGRST116') {
                    const { data: newProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert({ id: user.id, email: user.email })
                        .select()
                        .single()
                    
                    if (createError) throw createError
                    set({ profile: newProfile })
                    return
                }
                throw error
            }
            set({ profile: data })
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            set({ isLoading: false })
        }
    },

    updateProfile: async (updates) => {
        set({ isLoading: true })
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)

            if (error) throw error
            
            // Update local state
            const { profile } = get()
            set({ profile: { ...profile!, ...updates } })
        } catch (error) {
            console.error('Error updating profile:', error)
            throw error
        } finally {
            set({ isLoading: false })
        }
    }
}))
