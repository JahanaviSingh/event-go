'use client'
import { ListAuditoriums } from '@/components/templates/ListAuditoriums'
import { trpcClient } from '@/trpc/clients/client'

export default function Page() {
  const { data: auditoriums, isLoading } = trpcClient.auditoriums.auditoriums.useQuery({
    where: {},
    include: {
      Screens: {
        include: {
          Showtimes: {
            include: {
              Show: true
            }
          }
        }
      }
    }
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <main>
      <ListAuditoriums auditoriums={auditoriums || []} />
    </main>
  )
}
