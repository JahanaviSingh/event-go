import { StatCard } from '@/components/organisms/StatCard'
import { trpcServer } from '@/trpc/clients/server'

export default async function Page() {
  const dashboard = await trpcServer.managers.dashboard.query()
  return (
    <main className="flex flex-col gap-3">
      <StatCard title={'Auditoriums'} href={'/manager/auditoriums'}>
        {dashboard.Auditorium}
      </StatCard>
      <StatCard title={'Showtimes'} href={'/manager/showtimes'}>
        {dashboard.Showtime}
      </StatCard>
    </main>
  )
}
