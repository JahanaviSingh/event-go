import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const userRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        Admin: true,
        Manager: true,
      },
    })

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    return user
  }),

  isAdmin: protectedProcedure.query(async ({ ctx }) => {
    const admin = await ctx.prisma.admin.findUnique({
      where: { id: ctx.session.user.id },
    })
    return !!admin
  }),

  isManager: protectedProcedure.query(async ({ ctx }) => {
    const manager = await ctx.prisma.manager.findUnique({
      where: { id: ctx.session.user.id },
    })
    return !!manager
  }),
}) 