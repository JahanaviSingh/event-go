import { trpcClient } from "@/trpc/clients/client"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

export function ShowSchedule({ auditoriumId }: { auditoriumId?: number }) {
  const { data: showtimes } = trpcClient.manager.getShowSchedule.useQuery(
    { auditoriumId: auditoriumId! },
    { enabled: !!auditoriumId }
  )

  return (
    <div className="space-y-4">
      {showtimes?.map((showtime) => (
        <div key={showtime.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <p className="font-medium">{showtime.Show.title}</p>
            <p className="text-sm text-muted-foreground">
              Screen {showtime.Screen.number} - {format(new Date(showtime.startTime), "PPp")}
            </p>
            <div className="flex gap-2">
              <Badge variant="secondary">{showtime.Show.genre}</Badge>
              <Badge variant="outline">{showtime.Screen.projectionType}</Badge>
              <Badge variant="outline">{showtime.Screen.soundSystemType}</Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">₹{showtime.Screen.price}</p>
            <p className="text-sm text-muted-foreground">
              {showtime.status || 'Active'}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
} 