'use client'
import { Genre } from '@prisma/client'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
export const schemaCreateShows = z.object({
  genre: z.nativeEnum(Genre),
  title: z.string().min(1, { message: 'Title is required' }),
  organizer: z.string().min(1, { message: 'Organizer is required' }),
  showtimes: z.array(
    z.object({
      startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Each showtime must be in HH:MM format',
      }),
    })
  ),
  screenId: z.number({ invalid_type_error: 'Screen ID is required' }),
  duration: z.number({ invalid_type_error: 'Duration is required and must be a number' }),
  releaseDate: z.string(),
  posterUrl: z.string().optional().nullable(),
})
export type FormTypeCreateShows = z.infer<typeof schemaCreateShows>
export const useFormCreateShow = () =>
  useForm<FormTypeCreateShows>({ resolver: zodResolver(schemaCreateShows) })
