import * as React from 'react'
import { cn } from '../../lib/utils'

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, helperText, ...props }, ref) => {
        return (
            <div className="w-full space-y-1">
                {label && (
                    <label className="text-sm font-medium text-text-primary leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    className={cn(
                        'flex h-10 w-full rounded-none border border-[#333333] bg-[#0A0A0A] px-3 py-2 text-sm ring-offset-bg-card file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200 text-white font-mono',
                        error && 'border-accent-red focus-visible:ring-accent-red',
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {helperText && !error && (
                    <p className="text-xs text-text-secondary">{helperText}</p>
                )}
                {error && (
                    <p className="text-xs text-accent-red">{error}</p>
                )}
            </div>
        )
    }
)
Input.displayName = 'Input'

export { Input }
