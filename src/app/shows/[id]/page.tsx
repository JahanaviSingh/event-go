'use client'

import { useEffect, useState, use } from 'react'
import { trpcClient } from '@/trpc/clients/client'
import { Loader } from '@/components/molecules/Loader'
import {
  IconClock,
  IconCalendar,
  IconMapPin,
  IconTicket,
} from '@tabler/icons-react'
import { format } from 'date-fns'
import Image from 'next/image'
import { Button } from '@/components/atoms/button'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/Dialog'
import { BookingStepper } from '@/components/templates/SearchAuditorium'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/store'

interface ShowPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ShowPage({ params }: ShowPageProps) {
  const resolvedParams = use(params)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const router = useRouter()
  const dispatch = useAppDispatch()

  const { data: showData, isLoading } = trpcClient.shows.shows.useQuery({
    id: parseInt(resolvedParams.id),
  })

  const show = showData?.shows?.[0]

  const { data: showtimes } = trpcClient.showtimes.showtimes.useQuery(
    {
      where: {
        Show: {
          id: parseInt(resolvedParams.id),
        },
      },
    },
    {
      enabled: !!resolvedParams.id,
    },
  )

  if (isLoading || !show) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8" />
      </div>
    )
  }

  // Format release date safely
  const formatReleaseDate = (dateString: string | Date | null) => {
    if (!dateString) return 'Date not available'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString)
        return 'Invalid date'
      }
      return format(date, 'MMM d, yyyy')
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Date not available'
    }
  }

  // Format genre for display
  const formatGenre = (genre: string | null | undefined) => {
    if (!genre) return 'Not specified'
    return genre
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  // Get unique dates from showtimes
  const availableDates = Array.from(
    new Set(
      showtimes?.map((st) => format(new Date(st.startTime), 'yyyy-MM-dd')) ??
        [],
    ),
  ).sort()

  // Get showtimes for selected date
  const dateShowtimes =
    showtimes?.filter(
      (st) =>
        selectedDate &&
        format(new Date(st.startTime), 'yyyy-MM-dd') === selectedDate,
    ) ?? []

  const handleShowtimeSelect = (showtimeId: number) => {
    dispatch({ type: 'shows/addShowtimeId', payload: showtimeId })
    router.push(`/shows/${resolvedParams.id}/seatlayout`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show Details Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            <div className="relative w-48 h-72 flex-shrink-0">
              <Image
                src={show.posterUrl || '/film.png'}
                alt={`Poster for ${show.title || 'Untitled Show'}`}
                fill
                sizes="192px"
                className="object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/film.png'
                }}
              />
            </div>
            <div className="flex-grow">
              <h1 className="text-3xl font-bold mb-4">{show.title}</h1>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <IconClock className="w-5 h-5" />
                  <span>{show.duration} mins</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <IconCalendar className="w-5 h-5" />
                  <span>{formatReleaseDate(show.releaseDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <IconTicket className="w-5 h-5" />
                  <span>From ₹199</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    {formatGenre(show.genre)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">Organizer:</span>
                  <span>{show.organizer}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Select Date & Time</h2>

          {/* Date Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Select Date</h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {availableDates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center p-4 rounded-lg min-w-[100px] ${
                    selectedDate === date
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-sm">
                    {format(new Date(date), 'EEE')}
                  </span>
                  <span className="text-lg font-medium">
                    {format(new Date(date), 'd')}
                  </span>
                  <span className="text-sm">
                    {format(new Date(date), 'MMM')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Showtime Selection */}
          {selectedDate && (
            <div>
              <h3 className="text-lg font-medium mb-4">Select Time</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {dateShowtimes.map((showtime) => (
                  <button
                    key={showtime.id}
                    onClick={() => handleShowtimeSelect(showtime.id)}
                    className="p-4 rounded-lg text-center bg-gray-100 hover:bg-gray-200"
                  >
                    <div className="text-lg font-medium">
                      {format(new Date(showtime.startTime), 'h:mm a')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {showtime.Screen.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      ₹{showtime.Screen.price}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
