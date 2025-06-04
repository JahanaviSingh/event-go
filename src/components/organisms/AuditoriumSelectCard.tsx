import { AuditoriumQuery } from '@showtime-org/network/src/generated'
import Image from 'next/image'

export interface IAuditoriumSelectCardProps {
  show: AuditoriumQuery['auditorium'][0]
  selected?: boolean
}

export const AuditoriumSelectCard = ({
  show,
  selected = false,
}: IAuditoriumSelectCardProps) => {
  return (
    <div className="flex flex-col items-start justify-start w-full gap-2 ">
      <Image
        width={200}
        height={300}
        alt={show.title}
        src={show.posterUrl || ''}
        className={`object-cover w-full h-48 border-2  rounded  ${
          selected ? 'shadow-xl border-primary' : 'shadow-sm border-white'
        }`}
      />
      <div className="text-sm text-left">{show.title}</div>
    </div>
  )
}
