import { StatCard } from '@/components/organisms/StatCard'
import { trpcServer } from '@/trpc/clients/server'

export default async function Page() {
  const dashboard = await trpcServer.admins.dashboard.query()
  return (
    <main className="flex flex-col gap-3">
      <StatCard title={'Admins'} href={'/admin/admins'}>
        {dashboard.Admin}
      </StatCard>
      <StatCard title={'Managers'} href={'/admin/managers'}>
        {dashboard.Manager}
      </StatCard>
      <StatCard title={'Shows'} href={'/admin/shows'}>
        {dashboard.Show}
      </StatCard>
      <StatCard title={'Auditoriums'} href={'/admin/auditoriums'}>
        {dashboard.Auditorium}
      </StatCard>
      <StatCard title={'Users'}>{dashboard.User}</StatCard>
    </main>
  )
}
