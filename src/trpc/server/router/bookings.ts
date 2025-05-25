import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const bookingsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        showtimeId: z.number(),
        seats: z.array(
          z.object({
            row: z.number(),
            column: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { showtimeId, seats } = input

      // Check if showtime exists
      const showtime = await ctx.db.showtime.findUnique({
        where: { id: showtimeId },
        include: { Screen: true },
      })

      if (!showtime) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Showtime not found',
        })
      }

      // Check if seats are available
      const existingBookings = await ctx.db.booking.findMany({
        where: {
          showtimeId,
          OR: seats.map(seat => ({
            AND: {
              row: seat.row,
              column: seat.column,
            },
          })),
        },
      })

      if (existingBookings.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Some seats are already booked',
        })
      }

      // Create bookings
      const bookings = await Promise.all(
        seats.map(seat =>
          ctx.db.booking.create({
            data: {
              showtimeId,
              screenId: showtime.screenId,
              row: seat.row,
              column: seat.column,
              userId: ctx.session.user.id,
            },
          })
        )
      )

      return bookings
    }),
}) 