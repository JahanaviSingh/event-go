import { Tickets } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/util/styles'

export interface IDeveloperInfoProps {
  className?: string
}

export const DeveloperInfo = ({ className }: IDeveloperInfoProps) => {
  return (
    <Link href="" target="_blank" className={cn('text-xs group ', className)}>
      <div className="flex items-center gap-1 group-hover:underline underline-offset-4">
        A{' '}
        <Tickets 
          className={`inline w-4 h-4 group-hover:fill-red-400 group-hover:w-5 group-hover:h-5 transition-all`}
        />
        Booking Platform
      </div>
    </Link>
  )
}
