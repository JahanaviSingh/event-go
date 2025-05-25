import { createTRPCRouter, protectedProcedure, publicProcedure } from '..'
import { adminsRouter } from './admins'
import { showsRouter } from './shows'
import { screensRouter } from './screens'
import { auditoriumsRouter } from './auditoriums'
import { managersRouter } from './managers'
import { showtimesRoutes } from './showtimes'
import { geocodingRouter } from './geocoding'

export const appRouter = createTRPCRouter({
  shows: showsRouter,
  screens: screensRouter,
  admins: adminsRouter,
  auditoriums: auditoriumsRouter,
  managers: managersRouter,
  showtimes: showtimesRoutes,
  geocoding: geocodingRouter,
})
export type AppRouter = typeof appRouter
