import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: {
                default:
                    'border-transparent bg-primary text-white hover:bg-primary/80',
                secondary:
                    'border-transparent bg-bg-light text-text-primary hover:bg-bg-light/80',
                destructive:
                    'border-transparent bg-accent-red text-white hover:bg-accent-red/80',
                outline: 'text-text-primary',
                success: 'border-transparent bg-accent-green/20 text-accent-green hover:bg-accent-green/30',
                warning: 'border-transparent bg-accent-orange/20 text-accent-orange hover:bg-accent-orange/30',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
