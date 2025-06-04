import { ListAuditoriums } from '@/components/templates/ListAuditoriums'
import { trpcServer } from '@/trpc/clients/server'

export default async function Page() {
  const auditoriums = await trpcServer.auditoriums.myAuditoriums.query({})

  return (
    <main>
      <ListAuditoriums auditoriums={auditoriums} />
    </main>
  )
}
