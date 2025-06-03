import { trpcServer } from '@/trpc/clients/server'
import { ShowInfo } from '@/components/organisms/ShowInfo'
import { Loader } from '@/components/molecules/Loader'

export interface IListShowsProps {}

export const ListShows = async ({}: IListShowsProps) => {
  const showsData = await trpcServer.shows.shows.query()
  const shows = showsData?.shows ?? []

  if (!shows || shows.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No shows available at the moment.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {shows.map((show) => (
        <ShowInfo show={show} key={show.id} />
      ))}
    </div>
  )
}
