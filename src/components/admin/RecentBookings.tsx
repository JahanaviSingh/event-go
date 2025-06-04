import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { trpcClient } from '@/trpc/clients/client'
import { format } from 'date-fns'

export function RecentBookings() {
  const { data: bookings } = trpcClient.admin.getRecentBookings.useQuery()

  return (
    <div className="space-y-8">
      {bookings?.map((booking) => (
        <div key={booking.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={booking.User.image || undefined}
              alt={booking.User.name}
            />
            <AvatarFallback>
              {booking.User.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {booking.User.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {booking.Show.Show.title} -{' '}
              {format(new Date(booking.Showtime.startTime), 'PPp')}
            </p>
          </div>
          <div className="ml-auto font-medium">
            ₹{booking.Show.Screen.price}
          </div>
        </div>
      ))}
    </div>
  )
}
