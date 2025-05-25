'use client'
import Image from 'next/image'
import { Title2 } from '../atoms/typography'
import { format } from 'date-fns'
import { AlertBox } from '../molecules/AlertBox'
import { RouterOutputs } from '@/trpc/clients/types'
import { trpcClient } from '@/trpc/clients/client'
import { formatDate } from '@/util/function'
import { AuditoriumInfo } from '@/components/organisms/AuditoriumInfo'
import { Auditorium } from '@prisma/client'
import { Loader } from '@/components/molecules/Loader'

export interface IListShowsProps {
  auditoriums: RouterOutputs['auditoriums']['auditoriums']
}

export const ListAuditoriums = ({ auditoriums }: IListShowsProps) => {
  const { data: showtimes, isLoading } = trpcClient.showtimes.showtimes.useQuery({
    where: {},
    include: {
      Show: true,
      Screen: {
        include: {
          Auditorium: true
        }
      }
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader className="w-6 h-6" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {auditoriums.map((auditorium) => (
        <div
          key={auditorium.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <AuditoriumInfo
            auditorium={auditorium}
            showtimes={showtimes?.filter(
              (showtime) =>
                showtime.Screen.Auditorium.id === auditorium.id
            )}
          />
        </div>
      ))}
    </div>
  )
}

export const ShowScreenShowtimes = ({ screenId }: { screenId: number }) => {
  const { data, isLoading } = trpcClient.showtimes.showtimesPerScreen.useQuery({
    screenId,
  })

  return data?.map((date) => (
    <div key={date.date}>
      <div className="my-8">
        <div className="mb-2 text-lg font-semibold">
          {formatDate(date.date)}
        </div>
        <div className="grid grid-cols-3 gap-2 ">
          {[...date.showtimes]
            .sort(
              (a, b) =>
                new Date(a.startTime).getTime() -
                new Date(b.startTime).getTime(),
            )
            .map((showtime) => (
              <div className="p-3 border rounded" key={showtime.id}>
                <div className="font-semibold text-2xl">
                  {format(showtime.startTime.toString(), 'p')}
                </div>
                <div className="text-gray-600 text-xs mb-2">
                  {format(showtime.startTime.toString(), 'PP')}
                </div>
                <Image
                  src={showtime.Show.posterUrl || '/film.png'}
                  alt=""
                  className="rounded-lg"
                  width={300}
                  height={300}
                />
                <Title2 className="mt-2">{showtime.Show.title}</Title2>
              </div>
            ))}
        </div>
      </div>
    </div>
  ))
}
