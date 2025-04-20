import { createTRPCRouter, publicProcedure } from '@/trpc/server'

export const screensRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.screen.findMany({
      include: {
        Auditorium: true,
      },
    })
  }),
})
