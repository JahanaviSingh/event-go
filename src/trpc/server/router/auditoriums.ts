import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '..'
import { findManyAuditoriumArgsSchema, createAuditoriumSchema } from './dtos/auditoriums.input'
import { locationFilter } from './dtos/common'

export const auditoriumsRouter = createTRPCRouter({
  searchAuditoriums: publicProcedure
    .input(findManyAuditoriumArgsSchema)
    .input(z.object({ addressWhere: locationFilter }))
    .query(async ({ input, ctx }) => {
      const { cursor, distinct, orderBy, skip, take, where, addressWhere } =
        input

      const { ne_lat, ne_lng, sw_lat, sw_lng } = addressWhere
      return ctx.db.auditorium.findMany({
        cursor,
        distinct,
        orderBy,
        skip,
        take,
        where: {
          ...where,
          Address: {
            lat: { lte: ne_lat, gte: sw_lat },
            lng: { lte: ne_lng, gte: sw_lng },
          },
        },
        include: {
          Address: true,
          Screens: {
            include: {
              Showtimes: true,
            },
          },
        },
      })
    }),
  getAuditoriumById: publicProcedure
    .input(z.object({ auditoriumId: z.number().nullable() }))
    .query(({ ctx, input: { auditoriumId } }) => {
      if (!auditoriumId) {
        return null
      }
      return ctx.db.auditorium.findUnique({
        where: { id: auditoriumId },
        include: { 
          Address: true,
          Screens: {
            include: {
              Seats: true
            }
          }
        },
      })
    }),
  auditoriums: protectedProcedure()
    .input(findManyAuditoriumArgsSchema.omit({ addressWhere: true }))
    .query(({ ctx, input }) => {
      return ctx.db.auditorium.findMany({
        ...input,
        include: {
          Screens: { include: { Showtimes: { include: { Show: true } } } },
        },
      })
    }),

  createAuditorium: protectedProcedure('admin')
    .input(createAuditoriumSchema)
    .mutation(({ ctx, input }) => {
      const { address, auditoriumName, screens, managerId } = input

      const screensWithSeats = screens.map((screen, index) => {
        const { rows, columns, ...screenData } = screen
        const seats = []

        for (let row = 1; row <= rows; row++) {
          for (let column = 1; column <= columns; column++) {
            seats.push({ row, column })
          }
        }

        return {
          ...screenData,
          Seats: { create: seats },
          number: index + 1,
        }
      })

      return ctx.db.auditorium.create({
        data: {
          name: auditoriumName,
          Address: { create: address },
          Managers: {
            connectOrCreate: {
              create: { id: managerId },
              where: { id: managerId },
            },
          },
          Screens: { create: screensWithSeats },
        },
      })
    }),
  myAuditoriums: protectedProcedure()
    .input(findManyAuditoriumArgsSchema.omit({ addressWhere: true }).optional())
    .query(async ({ ctx, input }) => {
      const session = await ctx.session
      if (!session?.userId) {
        throw new Error('Not authenticated')
      }

      return ctx.db.auditorium.findMany({
        ...input,
        where: {
          ...input?.where,
          Managers: {
            some: {
              id: session.userId
            }
          }
        },
        include: {
          Address: true,
          Screens: {
            include: {
              Showtimes: {
                include: {
                  Show: true
                }
              }
            }
          }
        }
      })
    }),

  myScreens: publicProcedure
    .input(z.object({ auditoriumId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (input.auditoriumId <= 0) {
        return []
      }
      return ctx.db.screen.findMany({
        where: {
          AuditoriumId: input.auditoriumId
        },
        include: {
          Auditorium: true,
          Seats: true,
          Showtimes: {
            include: {
              Show: true
            }
          }
        }
      })
    }),

  deleteAuditorium: protectedProcedure('admin')
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input

      // First delete all related records
      await ctx.db.$transaction([
        // Delete all bookings for showtimes in this auditorium
        ctx.db.booking.deleteMany({
          where: {
            Showtime: {
              Screen: {
                AuditoriumId: id
              }
            }
          }
        }),
        // Delete all showtimes in this auditorium
        ctx.db.showtime.deleteMany({
          where: {
            Screen: {
              AuditoriumId: id
            }
          }
        }),
        // Delete all seats in this auditorium
        ctx.db.seat.deleteMany({
          where: {
            Screen: {
              AuditoriumId: id
            }
          }
        }),
        // Delete all screens in this auditorium
        ctx.db.screen.deleteMany({
          where: {
            AuditoriumId: id
          }
        }),
        // Delete the address
        ctx.db.address.deleteMany({
          where: {
            AuditoriumId: id
          }
        }),
        // Finally delete the auditorium
        ctx.db.auditorium.delete({
          where: { id }
        })
      ])

      return { success: true }
    }),

  updateAuditorium: protectedProcedure('admin')
    .input(createAuditoriumSchema.extend({
      id: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const session = await ctx.session

      // First delete all related records
      await ctx.db.$transaction([
        // Delete all bookings for showtimes in this auditorium
        ctx.db.booking.deleteMany({
          where: {
            Showtime: {
              Screen: {
                AuditoriumId: id
              }
            }
          }
        }),
        // Delete all showtimes in this auditorium
        ctx.db.showtime.deleteMany({
          where: {
            Screen: {
              AuditoriumId: id
            }
          }
        }),
        // Delete all seats in this auditorium
        ctx.db.seat.deleteMany({
          where: {
            Screen: {
              AuditoriumId: id
            }
          }
        }),
        // Delete all screens in this auditorium
        ctx.db.screen.deleteMany({
          where: {
            AuditoriumId: id
          }
        })
      ])

      // Update auditorium
      const auditorium = await ctx.db.auditorium.update({
        where: { id },
        data: {
          name: data.auditoriumName,
          Managers: {
            connectOrCreate: {
              create: {
                id: session.userId
              },
              where: {
                id: session.userId
              }
            }
          },
          Address: {
            upsert: {
              create: {
                lat: data.address.lat,
                lng: data.address.lng,
                address: data.address.address
              },
              update: {
                lat: data.address.lat,
                lng: data.address.lng,
                address: data.address.address
              }
            }
          },
          Screens: {
            create: data.screens.map((screen, index) => ({
              number: index,
              projectionType: screen.projectionType,
              soundSystemType: screen.soundSystemType
            }))
          }
        },
        include: {
          Address: true,
          Screens: true
        }
      })

      return auditorium
    }),
})
