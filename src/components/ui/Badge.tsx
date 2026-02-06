import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-none border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono uppercase tracking-wider',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-black hover:bg-primary/80',
        secondary:
          'border-transparent bg-border text-text-primary hover:bg-border/80',
        destructive:
          'border-transparent bg-accent-red text-white hover:bg-accent-red/80',
        outline: 'text-text-primary border-border',
        success: 'border-transparent bg-green-900/50 text-green-400 hover:bg-green-900/60 border border-green-900',
        warning: 'border-transparent bg-yellow-900/50 text-yellow-400 hover:bg-yellow-900/60 border border-yellow-900',
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
