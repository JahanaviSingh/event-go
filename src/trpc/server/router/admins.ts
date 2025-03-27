import { createTRPCRouter, publicProcedure, protectedProcedure } from '..'

export const adminsRouter = createTRPCRouter({
  admins: protectedProcedure('admin').query(({ ctx }) => {
    return ctx.db.admin.findMany()
  }),
  adminMe: protectedProcedure().query(({ ctx }) => {
    if (!ctx.userId) {
        return null; // Return null if userId is null or undefined
      }
    return ctx.db.admin.findUnique({ where: { id:ctx.userId } })
  }),
})
