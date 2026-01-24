import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from './useToast'

interface RealtimeOptions {
    table: string
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
    schema?: string
    filter?: string
}

export function useSupabaseRealtime(
    options: RealtimeOptions,
    callback?: (payload: any) => void
) {
    useEffect(() => {
        const channel = supabase
            .channel(`public:${options.table}`)
            .on(
                'postgres_changes',
                {
                    event: (options.event || '*') as any, // Cast to any to bypass strict literal check issues with supabase-js versions
                    schema: options.schema || 'public',
                    table: options.table,
                    filter: options.filter,
                },
                (payload) => {
                    // Default behavior: Show a toast
                    if (!callback) {
                        toast({
                            title: 'New Update',
                            description: `New event in ${options.table}`,
                            type: 'info'
                        })
                    } else {
                        callback(payload)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [options.table, options.event, options.filter, options.schema, callback])
}
