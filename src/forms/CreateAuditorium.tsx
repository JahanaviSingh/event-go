'use client'
import { z } from 'zod'
import { useForm, FormProvider } from 'react-hook-form'
import { ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { schemaCreateScreen } from './CreateScreen'

export const schemaCreateAddress = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
})
export const schemaCreateAuditorium = z.object({
  auditoriumName: z.string().min(1, { message: 'Auditorium name is required' }),
  managerId: z
    .string()
    .nonempty({ message: 'Manager ID must have atleast one character!' }),
  address: schemaCreateAddress,
  screens: z.array(schemaCreateScreen),
})
export type FormTypeCreateAuditorium = z.infer<typeof schemaCreateAuditorium>

export const useFormCreateAuditorium = () =>
  useForm<FormTypeCreateAuditorium>({
    resolver: zodResolver(schemaCreateAuditorium),
    defaultValues: {
      address: { address: '', lat: 0, lng: 0 },
      auditoriumName: '',
      screens: [],
    },
  })

export const FormProviderCreateAuditorium = ({
  children,
}: {
  children: ReactNode
}) => {
  const methods = useFormCreateAuditorium()

  return <FormProvider {...methods}>{children}</FormProvider>
}
