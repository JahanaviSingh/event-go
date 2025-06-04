import { create } from 'zustand'

type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface Notification {
  id: string
  type: NotificationType
  message: string
}

interface NotificationStore {
  notifications: Notification[]
  addNotification: (type: NotificationType, message: string) => void
  removeNotification: (id: string) => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (type, message) => {
    const id = Math.random().toString(36).substring(7)
    set((state) => ({
      notifications: [...state.notifications, { id, type, message }],
    }))
    // Auto remove after 5 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }))
    }, 5000)
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}))

// Create a simple event emitter for notifications
class NotificationEmitter {
  private listeners: ((type: NotificationType, message: string) => void)[] = []

  subscribe(listener: (type: NotificationType, message: string) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  emit(type: NotificationType, message: string) {
    this.listeners.forEach((listener) => listener(type, message))
  }

  success(message: string) {
    this.emit('success', message)
  }

  error(message: string) {
    this.emit('error', message)
  }

  info(message: string) {
    this.emit('info', message)
  }

  warning(message: string) {
    this.emit('warning', message)
  }
}

export const notification$ = new NotificationEmitter()

// Connect the emitter to the store
notification$.subscribe((type, message) => {
  useNotificationStore.getState().addNotification(type, message)
})
