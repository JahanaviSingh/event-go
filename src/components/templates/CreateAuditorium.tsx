'use client'
import { FormTypeCreateAuditorium } from '@/forms/CreateAuditorium'
import { Label } from '../atoms/label'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { Input } from '../atoms/input'
import { TextArea } from '../atoms/textArea'
import { Button } from '../atoms/button'
import { trpcClient } from '@/trpc/clients/client'
import { useRouter } from 'next/navigation'
import { useToast } from '../molecules/Toaster/use-toast'
import { revalidatePath } from '@/util/actions/revalidatePath'
import { Map } from '../organisms/Map/Map'
import { CenterOfMap, DefaultZoomControls } from '../organisms/Map/ZoomControls'
import { Panel } from '../organisms/Map/Panel'
import { Marker } from '../organisms/Map/MapMarker'
import { RectangleHorizontal, Plus as IconPlus, MapPin } from 'lucide-react'
import { SimpleAccordion } from '../atoms/accordion'
import { useMap } from 'react-map-gl/maplibre'
import { SearchPlace } from '../organisms/Map/SearchPlace'
import type { ViewState } from '@vis.gl/react-maplibre'
import { useState } from 'react'
import { Prisma } from '@prisma/client'
import { AuditoriumMarker } from '../organisms/Map/AuditoriumMarker'
import { AuditoriumLayout } from '../organisms/AuditoriumLayout'

const PROJECTION_TYPES = [
  'STANDARD',
  'DLP',
  'LCD',
  'LCOS',
  'LASER_PROJECTOR',
  'LED_PROJECTOR',
  'SHORT_THROW_PROJECTOR',
  'PANORAMIC_360_DEGREE_PROJECTION',
] as const

const SOUND_SYSTEM_TYPES = [
  'STANDARD',
  'PA_SYSTEM',
  'LINE_ARRAY_SYSTEM',
  'POINT_SOURCE_SYSTEM',
  'SURROUND_SOUND_SYSTEM',
  'CEILING_OR_IN_WALL_SPEAKERS',
  'SUBWOOFER_SYSTEM',
  'WIRELESS_MICROPHONE_SYSTEM',
  'DIGITAL_SIGNAL_PROCESSING_SYSTEM',
  'BI_AMP_SYSTEM',
  'TRI_AMP_SYSTEM',
] as const

const SCREEN_TYPES = ['STRAIGHT', 'CURVED'] as const

type ProjectionType = (typeof PROJECTION_TYPES)[number]
type SoundSystemType = (typeof SOUND_SYSTEM_TYPES)[number]
type ScreenType = (typeof SCREEN_TYPES)[number]

// Extend the ViewState type to include formattedAddress
interface ExtendedViewState extends ViewState {
  formattedAddress?: string
}

interface CreateAuditoriumProps {
  mode?: 'create' | 'edit'
  auditoriumId?: number
}

export const CreateAuditorium = ({
  mode = 'create',
  auditoriumId,
}: CreateAuditoriumProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useFormContext<FormTypeCreateAuditorium>()
  const { mutateAsync: createAuditorium, isLoading: isCreating } =
    trpcClient.auditoriums.createAuditorium.useMutation()
  const { mutateAsync: updateAuditorium, isLoading: isUpdating } =
    trpcClient.auditoriums.updateAuditorium.useMutation()
  const { toast } = useToast()
  const router = useRouter()
  const [viewState, setViewState] = useState<ExtendedViewState>({
    longitude: 80.2,
    latitude: 12.9,
    zoom: 8,
    bearing: 0,
    pitch: 22.5,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  })
  const [nearbyAuditoriums, setNearbyAuditoriums] = useState<any[]>([])

  const handleLocationChange = (location: ExtendedViewState) => {
    try {
      // Validate coordinates
      if (
        !location.latitude ||
        !location.longitude ||
        isNaN(location.latitude) ||
        isNaN(location.longitude)
      ) {
        console.error('Invalid coordinates received:', location)
        return
      }

      // Ensure coordinates are within valid ranges
      if (
        location.latitude < -90 ||
        location.latitude > 90 ||
        location.longitude < -180 ||
        location.longitude > 180
      ) {
        console.error('Coordinates out of valid range:', location)
        return
      }

      setValue('address.lat', location.latitude, { shouldValidate: true })
      setValue('address.lng', location.longitude, { shouldValidate: true })
      const formattedAddress = location.formattedAddress || ''
      setValue('address.address', formattedAddress, { shouldValidate: true })

      setViewState({
        ...location,
        zoom: 15,
        padding: { top: 0, bottom: 0, left: 0, right: 0 },
      })
    } catch (error) {
      console.error('Error handling location change:', error)
    }
  }

  const searchAuditoriums = trpcClient.auditoriums.searchAuditoriums.useQuery(
    {
      where: {},
      addressWhere: {
        ne_lat: viewState.latitude + 0.1,
        ne_lng: viewState.longitude + 0.1,
        sw_lat: viewState.latitude - 0.1,
        sw_lng: viewState.longitude - 0.1,
      },
    },
    {
      enabled: true,
      onSuccess: (data) => {
        setNearbyAuditoriums(data)
      },
    },
  )

  const handleMapClick = (e: any) => {
    try {
      const { lng, lat } = e.lngLat

      // Validate coordinates
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        console.error('Invalid coordinates received from map click:', {
          lat,
          lng,
        })
        return
      }

      // Ensure coordinates are within valid ranges
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.error('Coordinates out of valid range from map click:', {
          lat,
          lng,
        })
        return
      }

      setValue('address.lat', lat, { shouldValidate: true })
      setValue('address.lng', lng, { shouldValidate: true })
      setViewState({
        ...viewState,
        latitude: lat,
        longitude: lng,
        zoom: 15,
      })
    } catch (error) {
      console.error('Error handling map click:', error)
    }
  }

  const onSubmit = async (data: FormTypeCreateAuditorium) => {
    try {
      if (mode === 'edit' && auditoriumId) {
        await updateAuditorium({
          id: auditoriumId,
          ...data,
        })
        toast({
          title: 'Auditorium updated successfully',
          variant: 'default',
        })
      } else {
        await createAuditorium(data)
        toast({
          title: 'Auditorium created successfully',
          variant: 'default',
        })
      }
      revalidatePath('/admin/auditoriums')
      router.push('/admin/auditoriums')
    } catch (error) {
      toast({
        title:
          mode === 'edit'
            ? 'Failed to update auditorium'
            : 'Failed to create auditorium',
        description:
          error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-4">
        <div>
          <Label htmlFor="auditoriumName">Auditorium Name</Label>
          <Input
            id="auditoriumName"
            {...register('auditoriumName')}
            error={errors.auditoriumName?.message}
          />
        </div>

        <div>
          <Label htmlFor="managerId">Manager ID</Label>
          <Input
            id="managerId"
            {...register('managerId')}
            error={errors.managerId?.message}
          />
        </div>

        <div>
          <Label>Address</Label>
          <div className="h-[400px] rounded-lg overflow-hidden">
            <Map initialViewState={viewState} onClick={handleMapClick}>
              <Panel position="right-center">
                <DefaultZoomControls />
              </Panel>
              <Panel position="left-top">
                <SearchPlace onLocationChange={handleLocationChange} />
              </Panel>
              <CenterOfMap />
              {nearbyAuditoriums.map((auditorium) => (
                <AuditoriumMarker key={auditorium.id} marker={auditorium} />
              ))}
              {viewState.latitude &&
                viewState.longitude &&
                !isNaN(viewState.latitude) &&
                !isNaN(viewState.longitude) && (
                  <Marker
                    longitude={viewState.longitude}
                    latitude={viewState.latitude}
                    anchor="bottom"
                  >
                    <div className="relative">
                      <MapPin className="w-6 h-6 text-primary" />
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
                    </div>
                  </Marker>
                )}
            </Map>
          </div>
          <div className="mt-2 space-y-2">
            <Input
              {...register('address.lat')}
              type="number"
              step="any"
              placeholder="Latitude"
              aria-invalid={!!errors.address?.lat}
            />
            <Input
              {...register('address.lng')}
              type="number"
              step="any"
              placeholder="Longitude"
              aria-invalid={!!errors.address?.lng}
            />
            <TextArea
              {...register('address.address')}
              placeholder="Address"
              aria-invalid={!!errors.address?.address}
            />
          </div>
        </div>

        <div>
          <Label>Screens</Label>
          <AddScreens />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/auditoriums')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={mode === 'edit' ? isUpdating : isCreating}
        >
          {mode === 'edit' ? 'Update Auditorium' : 'Create Auditorium'}
        </Button>
      </div>
    </form>
  )
}

const AddScreens = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<FormTypeCreateAuditorium>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'screens',
  })

  // Watch all screen fields at once
  const screens = useWatch({
    control,
    name: 'screens',
    defaultValue: fields.map(() => ({
      projectionType: 'STANDARD' as const,
      soundSystemType: 'STANDARD' as const,
      screenType: 'STRAIGHT' as const,
      rows: 0,
      columns: 0,
    })),
  })

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="p-4 border rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Screen {index + 1}</h3>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => remove(index)}
            >
              Remove Screen
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Projection Type</Label>
              <select
                {...register(`screens.${index}.projectionType`)}
                className="w-full p-2 border rounded"
                defaultValue="STANDARD"
              >
                {PROJECTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Sound System Type</Label>
              <select
                {...register(`screens.${index}.soundSystemType`)}
                className="w-full p-2 border rounded"
                defaultValue="STANDARD"
              >
                {SOUND_SYSTEM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Screen Type</Label>
              <select
                {...register(`screens.${index}.screenType`)}
                className="w-full p-2 border rounded"
                defaultValue="STRAIGHT"
              >
                {SCREEN_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Rows</Label>
              <Input
                type="number"
                {...register(`screens.${index}.rows`, { valueAsNumber: true })}
                error={errors.screens?.[index]?.rows?.message}
              />
            </div>

            <div>
              <Label>Columns</Label>
              <Input
                type="number"
                {...register(`screens.${index}.columns`, {
                  valueAsNumber: true,
                })}
                error={errors.screens?.[index]?.columns?.message}
              />
            </div>
          </div>

          <div className="mt-4">
            <Label>Seating Layout Preview</Label>
            <div className="mt-2 p-4 border rounded-lg">
              <AuditoriumLayout
                rows={screens[index]?.rows || 0}
                columns={screens[index]?.columns || 0}
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            projectionType: 'STANDARD',
            soundSystemType: 'STANDARD',
            screenType: 'STRAIGHT',
            rows: 10,
            columns: 10,
          })
        }
      >
        <IconPlus className="w-4 h-4 mr-2" />
        Add Screen
      </Button>
    </div>
  )
}

export const StaightMovieScreen = () => {
  return (
    <div className="mb-4">
      <div className="h-0.5 bg-gray rounded"></div>
      <div className="flex ">
        <div className="flex-1 h-4 bg-gradient-to-tr from-transparent via-transparent to-gray" />
        <div className="flex-1 h-4 bg-gradient-to-tl from-transparent via-transparent to-gray" />
      </div>
      <div className="text-xs text-center text-gray-500">Eyes this way</div>
    </div>
  )
}

export const CurvedScreen = ({ width = 300, height = 10 }) => {
  const curveOffset = height * 0.9 // Controls the curvature of the screen

  return (
    <svg
      width={width}
      className="mt-6"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <path
        d={`M 0,${height} L 0,0 Q ${
          width / 2
        },${curveOffset} ${width},0 L ${width},${height} Z`}
        fill="black"
      />
    </svg>
  )
}

const MapMarker = () => {
  const { address } = useWatch<FormTypeCreateAuditorium>()
  const { setValue } = useFormContext<FormTypeCreateAuditorium>()

  return (
    <Marker
      longitude={address?.lng || 0}
      latitude={address?.lat || 0}
      draggable
      onDragEnd={(e) => {
        const lngLat = e.lngLat
        setValue('address.lat', lngLat.lat || 0)
        setValue('address.lng', lngLat.lng || 0)
      }}
    >
      <BrandIcon />
    </Marker>
  )
}

export const BrandIcon = () => (
  <div style={{ perspective: '20px' }}>
    <RectangleHorizontal style={{ transform: 'rotateX(22deg)' }} />
  </div>
)
