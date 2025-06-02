import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const usersRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        preferences: true,
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

  getBookings: protectedProcedure.query(async ({ ctx }) => {
    const bookings = await ctx.db.booking.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        Showtime: {
          include: {
            Show: true,
            Screen: {
              include: {
                Auditorium: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return bookings
  }),

  updatePreferences: protectedProcedure
    .input(
      z.object({
        favoriteGenre: z.string().optional(),
        preferredLocation: z.string().optional(),
        notificationSettings: z
          .object({
            email: z.boolean(),
            push: z.boolean(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          preferences: input,
        },
      })

      return user
    }),
}) 