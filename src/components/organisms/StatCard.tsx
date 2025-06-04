import Link from 'next/link'
import { ReactNode } from 'react'

export const StatCard = ({
  title,
  children,
  href,
}: {
  title: string
  href?: string
  children: ReactNode
}) => {
  const Comp = href ? Link : 'div'
  return (
    <Comp href={href || '/'} className="p-4 bg-white rounded-lg shadow-md">
      <div className="text-lg">{title}</div>
      <div className="text-2xl font-bold">{children}</div>
    </Comp>
  )
}
