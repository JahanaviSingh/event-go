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
        include: { Address: true },
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
          number: index,
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
    .input(findManyAuditoriumArgsSchema.omit({ addressWhere: true }))
    .query(({ ctx, input }) => {
      return ctx.db.auditorium.findMany({
        ...input,
        where: {
          ...input.where,
          id: typeof input.where?.id === 'number' ? input.where.id : undefined,
          Managers: { some: { id: ctx.session.userId } },
        },
        include: {
          Screens: { include: { Showtimes: { include: { Show: true } } } },
        },
      })
    }),

  myScreens: protectedProcedure().query(({ ctx }) => {
    return ctx.db.screen.findMany({
      where: {
        Auditorium: {
          Managers: { some: { id: ctx.session.userId } },
        },
      },
      include: {
        Auditorium: true,
      },
    })
  }),
})
