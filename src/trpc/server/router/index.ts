import { createTRPCRouter, protectedProcedure, publicProcedure } from '..'
import { adminsRouter } from './admins'
import { showsRouter } from './shows'
import { screensRouter } from './screens'

export const appRouter = createTRPCRouter({
  shows: showsRouter,
  screens: screensRouter,
  admins: adminsRouter,
})
export type AppRouter = typeof appRouter
