import * as React from 'react'
import { cn } from '../../lib/utils'

const Switch = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { checked?: boolean; onCheckedChange?: (checked: boolean) => void }
>(({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            data-state={checked ? 'checked' : 'unchecked'}
            ref={ref}
            className={cn(
                'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-none border border-[#333333] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
                checked ? 'bg-primary border-primary' : 'bg-[#0A0A0A]',
                className
            )}
            onClick={() => onCheckedChange?.(!checked)}
            {...props}
        >
            <span
                data-state={checked ? 'checked' : 'unchecked'}
                className={cn(
                    'pointer-events-none block h-4 w-4 rounded-none bg-black shadow-none ring-0 transition-transform ml-0.5',
                    checked ? 'translate-x-5' : 'translate-x-0 bg-gray-500'
                )}
            />
        </button>
    )
})
Switch.displayName = 'Switch'

export { Switch }
