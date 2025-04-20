import Link from 'next/link'
import { TellThem } from '@/components/molecules/TellThem'
import { trpcServer } from '@/trpc/clients/server'
import { auth } from '@clerk/nextjs/server'
import { Divide } from 'lucide-react'
import { SimpleSidebar } from '@/components/molecules/SimpleSidebar'
import { AdminMenu } from '@/components/organisms/AdminMenu'
export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const authResult = await auth()
  const { userId } = authResult
  if (!userId) {
    return <Link href="/api/auth/signin">Login</Link>
  }
  const adminMe = await trpcServer.admins.adminMe.query()
  if (!adminMe?.id) {
    return <TellThem uid={userId} role={'admin'} />
  }
  return (
    <div className="flex mt-2">
      <div className="hidden w-full max-w-xs min-w-min sm:block">
        <AdminMenu />
      </div>
      <div className="flex-grow">
        <div className="sm:hidden">
          <SimpleSidebar>
            <AdminMenu />
          </SimpleSidebar>
        </div>
        <div className="p-4 bg-gray-100 text-black">{children}</div>
      </div>
    </div>
  )
}
