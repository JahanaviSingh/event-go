'use client'
import { FormProvider, useForm } from 'react-hook-form'
import { ReactNode } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const SCREEN_TYPES = ['STRAIGHT', 'CURVED'] as const
type ScreenType = typeof SCREEN_TYPES[number]

export const schemaCreateScreen = z.object({
  projectionType: z.enum(['STANDARD', 'DLP', 'LCD', 'LCOS', 'LASER_PROJECTOR', 'LED_PROJECTOR', 'SHORT_THROW_PROJECTOR', 'PANORAMIC_360_DEGREE_PROJECTION']),
  soundSystemType: z.enum(['STANDARD', 'PA_SYSTEM', 'LINE_ARRAY_SYSTEM', 'POINT_SOURCE_SYSTEM', 'SURROUND_SOUND_SYSTEM', 'CEILING_OR_IN_WALL_SPEAKERS', 'SUBWOOFER_SYSTEM', 'WIRELESS_MICROPHONE_SYSTEM', 'DIGITAL_SIGNAL_PROCESSING_SYSTEM', 'BI_AMP_SYSTEM', 'TRI_AMP_SYSTEM']),
  screenType: z.enum(SCREEN_TYPES),
  rows: z.number(),
  columns: z.number(),
})

export type FormTypeCreateScreen = z.infer<typeof schemaCreateScreen>

export const useFormCreateScreen = () =>
  useForm<FormTypeCreateScreen>({
    resolver: zodResolver(schemaCreateScreen),
  })

export const FormProviderCreateScreen = ({
  children,
}: {
  children: ReactNode
}) => {
  const methods = useFormCreateScreen()

  return <FormProvider {...methods}>{children}</FormProvider>
}
