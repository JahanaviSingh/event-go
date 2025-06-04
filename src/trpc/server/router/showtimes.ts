import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '..'
import { Prisma } from '@prisma/client'

const serverSchemaCreateShowtime = z.object({
  showId: z.number(),
  screenId: z.number(),
  showtimes: z.array(
    z.object({
      time: z.string(),
    }),
  ),
})

const reduceShowtimeByDate = <T extends { startTime: Date }>(
  rawShowtimes: T[],
) => {
  const showtimesByDate: Record<string, T[]> = {}

  rawShowtimes.forEach((showtime) => {
    const date = showtime.startTime.toISOString().split('T')[0]
    if (!showtimesByDate[date]) {
      showtimesByDate[date] = []
    }
    showtimesByDate[date].push(showtime)
  })

  return Object.entries(showtimesByDate).map(([date, showtimes]) => ({
    date,
    showtimes,
  }))
}

export const showtimesRoutes = createTRPCRouter({
  seats: publicProcedure
    .input(z.object({ showtimeId: z.number() }))
    .query(async ({ ctx, input: { showtimeId } }) => {
      const showtime = await ctx.db.showtime.findUnique({
        where: { id: showtimeId },
        include: { Screen: { include: { Seats: true } } },
      })

      // Add booked information to each seat
      const seatsWithBookingInfo = await Promise.all(
        showtime?.Screen.Seats.map(async (seat) => {
          const booking = await ctx.db.booking.findUnique({
            where: {
              uniqueSeatShowtime: {
                column: seat.column,
                row: seat.row,
                screenId: seat.screenId,
                showtimeId,
              },
            },
          })

          return {
            ...seat,
            booked: booking?.id ? true : false,
          }
        }) || [],
      )

      const ticketPrice = await ctx.db.showtime.findUnique({
        where: { id: showtimeId },
        include: { Screen: true },
      })

      return { seats: seatsWithBookingInfo, price: ticketPrice?.Screen.price }
    }),
  seatsInfo: publicProcedure
    .input(z.object({ showtimeId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { showtimeId } = input
      const showtime = await ctx.db.showtime.findUnique({
        where: { id: showtimeId },
      })
      const total = await ctx.db.seat.count({
        where: { screenId: showtime?.screenId },
      })
      const booked = await ctx.db.booking.count({
        where: { showtimeId: showtimeId },
      })

      return { total, booked }
    }),
  showtimesPerCinema: publicProcedure
    .input(z.object({ auditoriumId: z.number(), showId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { showId, auditoriumId } = input

      const rawShowtimes = await ctx.db.showtime.findMany({
        where: {
          showId: showId,
          Screen: {
            AuditoriumId: auditoriumId,
          },
          startTime: {
            gt: new Date(),
          },
        },
        orderBy: {
          startTime: 'asc',
        },
        include: {
          Screen: true,
        },
      })

      // Group showtimes by date
      const showtimesByDate = reduceShowtimeByDate(rawShowtimes)

      // Convert object to the desired array format
      return Object.values(showtimesByDate)
    }),
  showtimesPerScreen: publicProcedure
    .input(z.object({ screenId: z.number() }))
    .query(async ({ input, ctx }) => {
      const { screenId } = input

      const rawShowtimes = await ctx.db.showtime.findMany({
        where: {
          screenId,
          startTime: {
            gt: new Date(),
          },
        },
        orderBy: {
          startTime: 'asc',
        },
        include: {
          Screen: true,
          Show: true,
        },
      })

      // Group showtimes by date
      const showtimesByDate = reduceShowtimeByDate(rawShowtimes)

      // Convert object to the desired array format
      return Object.values(showtimesByDate)
    }),
  create: protectedProcedure('admin', 'manager')
    .input(serverSchemaCreateShowtime)
    .mutation(async ({ ctx, input }) => {
      const { showId, screenId, showtimes } = input
      const screen = await ctx.db.screen.findUnique({
        where: { id: screenId },
        include: { Auditorium: { include: { Managers: true } } },
      })

      const showtimesInput: Prisma.ShowtimeCreateManyInput[] = showtimes.map(
        (showtime) => {
          const date = new Date(showtime.time)
          if (isNaN(date.getTime())) {
            throw new Error(`Invalid date: ${showtime.time}`)
          }
          return {
            screenId,
            showId,
            startTime: date,
          }
        },
      )
      return ctx.db.showtime.createMany({
        data: showtimesInput,
      })
    }),
  myShowtimes: protectedProcedure('manager').query(async ({ ctx }) => {
    const session = await ctx.session
    if (!session?.userId) {
      throw new Error('Not authenticated')
    }

    const showtimes = await ctx.db.showtime.findMany({
      where: {
        Screen: {
          Auditorium: {
            Managers: {
              some: {
                id: session.userId,
              },
            },
          },
        },
        startTime: {
          gt: new Date(), // Only future showtimes
        },
      },
      include: {
        Show: true,
        Screen: {
          include: {
            Auditorium: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    // Group showtimes by date
    return reduceShowtimeByDate(showtimes)
  }),
  showtimes: publicProcedure
    .input(
      z.object({
        where: z
          .object({
            Show: z
              .object({
                id: z.number(),
              })
              .optional(),
            Screen: z
              .object({
                AuditoriumId: z.number(),
              })
              .optional(),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.showtime.findMany({
        where: input.where,
        include: {
          Show: true,
          Screen: {
            include: {
              Auditorium: true,
            },
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      })
    }),
})
