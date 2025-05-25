import { ShowtimeQuery } from '@showtime-org/network/src/generated'
import { format } from 'date-fns'
import { ShowRemainingSeats } from '../templates/SearchAuditorium'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '../atoms/button'
import { useToast } from '../molecules/Toaster/use-toast'

export interface IShowtimeSelectCardProps {
  showtime: ShowtimeQuery['showtime']
  selected?: boolean
  onClick?: () => void
}

export const ShowtimeSelectCard = ({
  showtime,
  selected = false,
  onClick,
}: IShowtimeSelectCardProps) => {
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleClick = () => {
    if (!isSignedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book tickets",
        variant: "destructive"
      })
      router.push('/sign-in')
      return
    }

    if (onClick) {
      onClick()
    }
  }

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
      <Button 
        onClick={handleClick}
        className="w-full mt-2"
        variant={selected ? "default" : "outline"}
      >
        {selected ? "Selected" : "Book Now"}
      </Button>
    </div>
  )
}