'use client'

import { trpcClient } from '@/trpc/clients/client'
import { format } from 'date-fns'
import Image from 'next/image'
import { Title2 } from '@/components/atoms/typography'

export default function Page() {
  const { data: showtimesByDate, isLoading } =
    trpcClient.showtimes.myShowtimes.useQuery()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!showtimesByDate || Object.keys(showtimesByDate).length === 0) {
    return (
      <div className="p-4 text-center text-gray-600">
        No upcoming showtimes found.
      </div>
    )
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Showtimes</h1>
      <div className="space-y-8">
        {Object.values(showtimesByDate).map(({ date, showtimes }) => (
          <div key={date} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {format(new Date(date), 'MMMM d, yyyy')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {showtimes.map((showtime) => (
                <div
                  key={showtime.id}
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48">
                    <Image
                      src={showtime.Show.posterUrl || '/show.png'}
                      alt={showtime.Show.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <Title2>{showtime.Show.title}</Title2>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Time:</span>{' '}
                        {format(new Date(showtime.startTime), 'h:mm a')}
                      </p>
                      <p>
                        <span className="font-medium">Auditorium:</span>{' '}
                        {showtime.Screen.Auditorium.name}
                      </p>
                      <p>
                        <span className="font-medium">Screen:</span>{' '}
                        {showtime.Screen.number}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
