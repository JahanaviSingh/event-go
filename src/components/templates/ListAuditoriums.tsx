'use client'
import Image from 'next/image'
import { Title2 } from '../atoms/typography'
import { format } from 'date-fns'
import { AlertBox } from '../molecules/AlertBox'
import { RouterOutputs } from '@/trpc/clients/types'
import { trpcClient } from '@/trpc/clients/client'
import { formatDate } from '@/util/function'
import { AuditoriumInfo } from '../organisms/AuditoriumInfo'

export interface IListShowsProps {
  auditoriums: RouterOutputs['auditoriums']['auditoriums']
}

export const ListAuditoriums = ({ auditoriums }: IListShowsProps) => {
  return (
    <div>
      <div>
        {auditoriums.length === 0 ? (
          <div>You have not created any auditoriums yet.</div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        {auditoriums.map((auditorium) => (
          <AuditoriumInfo auditorium={auditorium} key= {auditorium.id}  />
        ))}
      </div>
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
