import { ReactNode } from 'react'
import { cn } from '@/util/styles'

export interface IAlertBoxProps {
  children?: ReactNode
  className?: string
}
export const AlertBox = ({ children, className }: IAlertBoxProps) => {
  return (
    <div
      className={cn(
        'flex py-12 bg-blue-100 text-blue-900 justify-center items-center',
        className,
      )}
    >
      {children}
    </div>
  )
}
