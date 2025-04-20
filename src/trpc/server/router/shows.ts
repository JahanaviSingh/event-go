import { protectedProcedure, } from '@/trpc/server'
import { createTRPCRouter, publicProcedure } from '@/trpc/server'
import { CreateShow } from '@/components/templates/CreateShow'
import { schemaCreateShows } from '@/forms/CreateShow'

export const showsRouter = createTRPCRouter({
  shows: publicProcedure.query(({ ctx }) => {
    return ctx.db.show.findMany()
  }),
  createShow: protectedProcedure('admin')
  .input(schemaCreateShows)
  .mutation(async ({ ctx, input }) => {
    const { showtimes, releaseDate, screenId, ...rest } = input
    return ctx.db.show.create({
      data: {
        ...rest,
        releaseDate: new Date(releaseDate),
        Showtimes: {
          create: showtimes.map(({ startTime }) => ({
            startTime: new Date(`${releaseDate}T${startTime}`),
            screenId,
          })),
        },
      },
    })
  }),
})