import { createTRPCRouter, protectedProcedure, publicProcedure } from '..'
import { z } from 'zod'

const createManagerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
})

export const managersRouter = createTRPCRouter({
  dashboard: protectedProcedure('manager', 'admin').query(async ({ ctx }) => {
    const auditoriumCount = await ctx.db.auditorium.count({
      where: { Managers: { some: { id: ctx.session.userId } } },
    })

    return { auditoriumCount }
  }),
  managerMe: protectedProcedure().query(async ({ ctx }) => {
    const session = await ctx.session
    if (!session.userId) return null

    return ctx.db.manager.findUnique({
      where: { id: session.userId },
      include: { User: true },
    })
  }),
  listManagers: protectedProcedure().query(async ({ ctx }) => {
    return ctx.db.manager.findMany({
      include: { User: true },
    })
  }),
  createManager: protectedProcedure('admin')
    .input(createManagerSchema)
    .mutation(async ({ ctx, input }) => {
      // Create user in Clerk first
      const user = await ctx.clerk.users.createUser({
        emailAddress: [input.email],
        password: input.password,
        firstName: input.name,
      })

      // Then create manager in database
      return ctx.db.manager.create({
        data: {
          id: user.id,
          User: {
            create: {
              id: user.id,
              name: input.name,
              email: input.email,
            },
          },
        },
        include: {
          User: true,
        },
      })
    }),
})
