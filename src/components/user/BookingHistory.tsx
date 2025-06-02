import { trpcClient } from "@/trpc/clients/client"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function BookingHistory({ bookings }: { bookings: any[] }) {
  const downloadTicket = (ticketId: number) => {
    // Implement ticket download logic
    console.log('Downloading ticket:', ticketId)
  }

  return (
    <div className="space-y-4">
      {bookings?.map((booking) => (
        <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <p className="font-medium">{booking.Show.Show.title}</p>
            <p className="text-sm text-muted-foreground">
              {booking.Show.Auditorium.name} - Screen {booking.Show.Screen.number}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(booking.Showtime.startTime), "PPp")}
            </p>
            <div className="flex gap-2">
              <Badge variant="secondary">{booking.Show.Show.genre}</Badge>
              <Badge variant="outline">Seat {booking.row}-{booking.column}</Badge>
            </div>
          </div>
          <div className="text-right space-y-2">
            <p className="font-medium">₹{booking.Show.Screen.price}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadTicket(booking.Ticket.id)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Ticket
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
} 