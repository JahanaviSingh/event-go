import { createTRPCRouter, protectedProcedure } from '..'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

export const ticketsRouter = createTRPCRouter({
  getTicket: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const ticket = await ctx.db.ticket.findFirst({
        where: {
          uid: ctx.userId,
          Booking: {
            Showtime: {
              Session: {
                id: input.sessionId,
              },
            },
          },
        },
        include: {
          Booking: {
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
          },
        },
      })

      if (!ticket) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Ticket not found',
        })
      }

      return {
        bookingId: ticket.Booking.id,
        qrCode: ticket.qrCode,
        show: ticket.Booking.Showtime.Show,
        showtime: ticket.Booking.Showtime,
        seats: [
          {
            row: ticket.Booking.row,
            column: ticket.Booking.column,
          },
        ],
      }
    }),
})
