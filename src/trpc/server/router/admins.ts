import { createTRPCRouter, publicProcedure, protectedProcedure } from '..'

export const adminsRouter = createTRPCRouter({
  dashboard: protectedProcedure('admin').query(async ({ ctx }) => {
    const [Auditorium, Show, Admin, Manager, User] = await Promise.all([
      ctx.db.auditorium.count(),
      ctx.db.show.count(),
      ctx.db.admin.count(),
      ctx.db.manager.count(),
      ctx.db.user.count(),
    ])
    return {
      Auditorium,
      Show,
      Admin,
      Manager,
      User,
    }
  }),
  adminMe: protectedProcedure().query(({ ctx }) => {
    if (!ctx.userId) {
      return null // Return null if userId is null or undefined
    }
    return ctx.db.admin.findUnique({ where: { id: ctx.userId } })
  }),
  listAdmins: protectedProcedure('admin').query(async ({ ctx }) => {
    return ctx.db.admin.findMany({
      include: {
        User: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }),
})
