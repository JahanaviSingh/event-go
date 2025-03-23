import { createTRPCRouter,protectedProcedure, publicProcedure } from '..'
import { showsRouter } from './shows'
export const appRouter = createTRPCRouter({
  shows: showsRouter
})
export type AppRouter = typeof appRouter
