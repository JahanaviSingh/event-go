import { z } from 'zod'
import { SortOrder, dateTimeFilter, intFilter, stringFilter } from './common'
import { ProjectionType, SoundSystemType } from '@prisma/client'

const auditoriumOrderByWithRelationInputSchema = z.object({
  id: SortOrder,
  name: SortOrder,
  createdAt: SortOrder,
  updatedAt: SortOrder,
})

const auditoriumWhereInputSchemaPrimitive = z.object({
  id: intFilter,
  name: stringFilter,
  createdAt: dateTimeFilter,
  updatedAt: dateTimeFilter,
})

const addressWhere = z.object({
  ne_lng: z.number(),
  ne_lat: z.number(),
  sw_lng: z.number(),
  sw_lat: z.number(),
})

export const auditoriumWhereInputSchema = z.union([
  auditoriumWhereInputSchemaPrimitive,

  z.object({
    AND: z.array(auditoriumWhereInputSchemaPrimitive).optional(),
    OR: z.array(auditoriumWhereInputSchemaPrimitive).optional(),
    NOT: z.array(auditoriumWhereInputSchemaPrimitive).optional(),
  }),
])

const auditoriumWhereUniqueInputSchema = z.object({
  id: z.number(),
})

export const findManyAuditoriumArgsSchema = z.object({
  where: auditoriumWhereInputSchema.optional(),
  orderBy: z.array(auditoriumOrderByWithRelationInputSchema).optional(),
  cursor: auditoriumWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.array(z.enum(['id'])).optional(),
  addressWhere,
})

export const auditoriumScalarFieldEnumSchema = z.enum(['id'])

export const createAuditoriumSchema = z.object({
  auditoriumName: z.string().min(1, { message: 'Auditorium name is required' }),
  managerId: z.string().nonempty({ message: 'Manager ID must have atleast one character!' }),
  address: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
  }),
  screens: z.array(z.object({
    projectionType: z.nativeEnum(ProjectionType),
    soundSystemType: z.nativeEnum(SoundSystemType),
    rows: z.number(),
    columns: z.number(),
  })),
})
