import { ShowtimeQuery } from '@showtime-org/network/src/generated'
import { format } from 'date-fns'
import { ShowRemainingSeats } from '../templates/SearchAuditorium'

export interface IShowtimeSelectCardProps {
  showtime: ShowtimeQuery['showtime']
  selected?: boolean
}

export const ShowtimeSelectCard = ({
  showtime,
  selected = false,
}: IShowtimeSelectCardProps) => {
  console.log('Start time ', showtime.startTime)
  return (
    <div
      className={`flex border p-1 rounded flex-col items-start ${
        selected ? 'shadow-lg border-primary shadow-black/30' : ''
      }`}
    >
      <div className="text-sm font-bold">
        {format(new Date(+showtime.startTime), 'p')}
      </div>
      <div className="text-sm">Rs.{showtime.screen.price}</div>
      <div className="text-xs ">{showtime.screen.projectionType}</div>
      <div className="text-xs ">{showtime.screen.soundSystemType}</div>
      <ShowRemainingSeats showtimeId={showtime.id} />
    </div>
  )
}