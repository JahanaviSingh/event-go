import { protectedProcedure } from '@/trpc/server'
import { createTRPCRouter, publicProcedure } from '@/trpc/server'
import { schemaCreateShows } from '@/schema/showSchema'

export const showsRouter = createTRPCRouter({
  shows: publicProcedure.query(({ ctx }) => {
    return ctx.db.show.findMany()
  }),
  createShow: protectedProcedure('admin')
    .input(schemaCreateShows)
    .mutation(async ({ ctx, input }) => {
      console.log(input);
      
      const { showtimes, releaseDate, ...rest } = input
      const screenId = 1
      return ctx.db.show.create({
        data: {
          ...rest,
          releaseDate: new Date(releaseDate),
          Showtimes: {
            create: showtimes.map(({ startTime }) => ({
              startTime: new Date(`${releaseDate}T${startTime}Z`),
              screenId,
            })),
          },
        },
      })
    }),
})
