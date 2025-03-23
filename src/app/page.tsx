'use client'
import { useEffect, useState } from 'react'
import { trpcClient } from '../../trpc/clients/client'
import { trpcServer } from '../../trpc/clients/server'
import { UserButton } from '@clerk/nextjs'

export default async function Home() {
  const shows = await trpcServer.shows.shows.query();
  return (
    <main>
      Welcome to Event-go!<UserButton />
       <div>
        {shows?.map((show)=>(
          <div key={show.id}>
            <div>{show.id}</div>
            <div>{show.director}</div>
            <div>{show.genre}</div>
          </div>
        ))}</div>
    </main>
  )
}
