import  Image  from 'next/image'
import { RouterOutputs } from '@/trpc/clients/types'
export const ShowInfo = ({
    show,
  }: {
    show: RouterOutputs['shows']['shows'][0]
  }) => {
    return (
      <div>
        <Image
          src={show.posterUrl || '/film.png'}
          alt=""
          className="aspect-square object-cover rounded shadow-lg"
          width={300}
          height={300}
        />
        <div className="text-lg font-semibold">{show.title}</div>
        <div>{show.director}</div>
        <div className="text-xs text-gray-500 mt-2">{show.genre}</div>
      </div>
    )
  }