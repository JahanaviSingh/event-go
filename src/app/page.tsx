'use client'
import { UserInfo } from '@/components/userinfo'
import { trpcClient } from '../../trpc/clients/client'
import { trpcServer } from '../../trpc/clients/server'
import { UserButton } from '@clerk/nextjs'
export default async function Home() {
  const data = await trpcClient.hello.query()
  return (
    <main>
      Welcome to Event-go!
      <UserButton />
      <UserInfo hello={data} />
    </main>
  )
}
