export type Role = 'admin' | 'manager'
import { ReactNode } from 'react'
export type BaseComponent = {
  children?: ReactNode
  className?: string
}
