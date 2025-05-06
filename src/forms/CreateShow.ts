'use client'
import { Genre } from '@prisma/client'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { schemaCreateShows } from '@/schema/showSchema'

export type FormTypeCreateShows = z.infer<typeof schemaCreateShows>
export const useFormCreateShow = () =>
  useForm<FormTypeCreateShows>({ 
    resolver: zodResolver(schemaCreateShows) 
  })
