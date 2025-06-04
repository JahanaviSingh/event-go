'use client'

import { cn } from '@/lib/utils'

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Loader = ({ className, ...props }: LoaderProps) => {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export const LoaderPanel = ({ className, ...props }: LoaderProps) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
        className,
      )}
      {...props}
    >
      <Loader className="h-8 w-8" />
    </div>
  )
}
