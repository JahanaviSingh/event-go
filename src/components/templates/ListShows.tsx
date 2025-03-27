import { trpcServer } from "@/trpc/clients/server"
import { ShowInfo } from "@/components/organisms/ShowInfo"
export interface IListShowsProps {}

export const ListShows =  async({}: IListShowsProps) => {
const shows=await trpcServer.shows.shows.query()
  return <div className="grid grid-cols-3 gap-4">{shows.map((show)=> ( 
  <ShowInfo show={show} key={show.id}/>
))} 
</div>
}