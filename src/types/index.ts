export interface NotificationType {
  id?: string
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
}

export interface StripeItemType {
  screenId: number
  showtimeId: number
  seats: Array<{
    row: number
    column: number
    price: number
  }>
}
