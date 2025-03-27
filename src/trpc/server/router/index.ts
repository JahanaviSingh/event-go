import { createTRPCRouter,protectedProcedure, publicProcedure } from '..'
import { adminsRouter } from './admins'
import { showsRouter } from './shows'
export const appRouter = createTRPCRouter({
  shows: showsRouter,
  admins: adminsRouter
})
export type AppRouter = typeof appRouter
