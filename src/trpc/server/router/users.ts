import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '..'
import { TRPCError } from '@trpc/server'

export const usersRouter = createTRPCRouter({
  getProfile: protectedProcedure().query(async ({ ctx }) => {
    try {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User ID not found in context',
        })
      }

      const user = await ctx.db.user.findUnique({
        where: { id: ctx.userId },
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
    } catch (error) {
      console.error('Error in getProfile:', error)
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user profile',
      })
    }
  }),

  getBookings: protectedProcedure().query(async ({ ctx }) => {
    try {
      if (!ctx.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User ID not found in context',
        })
      }

      const bookings = await ctx.db.booking.findMany({
        where: { userId: ctx.userId },
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
    } catch (error) {
      console.error('Error in getBookings:', error)
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch bookings',
      })
    }
  }),

  updatePreferences: protectedProcedure()
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
      try {
        if (!ctx.userId) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User ID not found in context',
          })
        }

        const user = await ctx.db.user.update({
          where: { id: ctx.userId },
          data: {
            preferences: input,
          },
        })

        return user
      } catch (error) {
        console.error('Error in updatePreferences:', error)
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update preferences',
        })
      }
    }),
}) 