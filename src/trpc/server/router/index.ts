import { createTRPCRouter, protectedProcedure, publicProcedure } from '..'
import { adminsRouter } from './admins'
import { showsRouter } from './shows'
import { screensRouter } from './screens'
import { auditoriumsRouter } from './auditoriums'

export const appRouter = createTRPCRouter({
  shows: showsRouter,
  screens: screensRouter,
  admins: adminsRouter,
  auditoriums: auditoriumsRouter,
})
export type AppRouter = typeof appRouter
