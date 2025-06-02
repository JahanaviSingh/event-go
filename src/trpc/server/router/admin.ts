import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const adminRouter = createTRPCRouter({
  getRevenueTrend: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { startDate, endDate } = input
      
      const bookings = await ctx.db.booking.findMany({
        where: {
          createdAt: {
            gte: startDate ? new Date(startDate) : undefined,
            lte: endDate ? new Date(endDate) : undefined,
          },
        },
        include: {
          Showtime: {
            include: {
              Screen: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      })

      // Group bookings by date and calculate revenue
      const revenueByDate = bookings.reduce((acc, booking) => {
        const date = booking.createdAt.toISOString().split('T')[0]
        const revenue = booking.Showtime.Screen.price
        
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date] += revenue
        
        return acc
      }, {} as Record<string, number>)

      return Object.entries(revenueByDate).map(([date, revenue]) => ({
        date,
        revenue,
      }))
    }),

  getRecentBookings: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const bookings = await ctx.db.booking.findMany({
        take: input.limit,
        include: {
          User: {
            select: {
              name: true,
              image: true,
            },
          },
          Showtime: {
            include: {
              Show: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return bookings
    }),

  getAuditoriumStats: protectedProcedure.query(async ({ ctx }) => {
    const auditoriums = await ctx.db.auditorium.findMany({
      include: {
        Screens: {
          include: {
            Showtimes: {
              include: {
                Bookings: true,
              },
            },
          },
        },
      },
    })

    return auditoriums.map(auditorium => ({
      id: auditorium.id,
      name: auditorium.name,
      totalScreens: auditorium.Screens.length,
      totalShowtimes: auditorium.Screens.reduce(
        (acc, screen) => acc + screen.Showtimes.length,
        0
      ),
      totalBookings: auditorium.Screens.reduce(
        (acc, screen) =>
          acc +
          screen.Showtimes.reduce(
            (showtimeAcc, showtime) => showtimeAcc + showtime.Bookings.length,
            0
          ),
        0
      ),
    }))
  }),
}) 