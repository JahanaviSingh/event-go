// import { useEffect, useState } from 'react'
// import { trpcClient } from '../trpc/clients/client'
import { trpcServer } from '../trpc/clients/server'
import { UserButton } from '@clerk/nextjs'

export default async function Home() {
  const shows = await trpcServer.shows.shows.query()
  return (
    <main>
        <h1>Welcome to Event-go!</h1> <UserButton />
      <div>
        {shows?.map((show) => (
          <div key={show.id}>
            <div >{show.id}</div>
            <div > {show.director}</div>
            <div > {show.genre}</div>
            <div > {show.title}</div>
          </div>
        ))}
      </div>

    </main>
  )
}
