import { useNotificationStore } from '@/store/notification'
import { IconCheck, IconX, IconInfoCircle, IconAlertTriangle } from '@tabler/icons-react'

const icons = {
  success: IconCheck,
  error: IconX,
  info: IconInfoCircle,
  warning: IconAlertTriangle,
}

const colors = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500',
}

export const Notification = () => {
  const { notifications, removeNotification } = useNotificationStore()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const Icon = icons[notification.type]
        return (
          <div
            key={notification.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-white ${colors[notification.type]}`}
          >
            <Icon className="w-5 h-5" />
            <span>{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 hover:opacity-80"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
} 