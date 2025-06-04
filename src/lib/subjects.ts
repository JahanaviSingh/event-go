import { Subject } from 'rxjs'
import { NotificationType } from '@/types'

export const notification$ = new Subject<Omit<NotificationType, 'id'>>()
