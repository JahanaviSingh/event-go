import { z } from 'zod'
import { SortOrder, intFilter, stringFilter } from './common'

const auditoriumOrderByWithRelationInputSchema = z.object({
  id: SortOrder,
})

const auditoriumWhereInputSchemaPrimitive = z.object({
  id: intFilter,
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
