import { createTRPCRouter } from './trpc'
import { geocodingRouter } from './routers/geocoding'

export const appRouter = createTRPCRouter({
  geocoding: geocodingRouter,
})

export type AppRouter = typeof appRouter
