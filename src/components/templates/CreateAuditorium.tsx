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
import { RectangleHorizontal, Plus as IconPlus } from 'lucide-react'
import { SimpleAccordion } from '../atoms/accordion'
import { useMap } from 'react-map-gl/maplibre'
import { SearchPlace } from '../organisms/Map/SearchPlace'
import type { ViewState } from '@vis.gl/react-maplibre'
import { useState } from 'react'
import { Prisma } from '@prisma/client'
import { AuditoriumMarker } from '../organisms/Map/AuditoriumMarker'

const PROJECTION_TYPES = [
  'STANDARD',
  'DLP',
  'LCD',
  'LCOS',
  'LASER_PROJECTOR',
  'LED_PROJECTOR',
  'SHORT_THROW_PROJECTOR',
  'PANORAMIC_360_DEGREE_PROJECTION'
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
  'TRI_AMP_SYSTEM'
] as const

type ProjectionType = typeof PROJECTION_TYPES[number]
type SoundSystemType = typeof SOUND_SYSTEM_TYPES[number]

export const CreateAuditorium = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useFormContext<FormTypeCreateAuditorium>()
  const { mutateAsync: createAuditorium, isLoading } =
    trpcClient.auditoriums.createAuditorium.useMutation()
  const { toast } = useToast()
  const router = useRouter()
  const [viewState, setViewState] = useState<ViewState>({
    longitude: 80.2,
    latitude: 12.9,
    zoom: 8,
    bearing: 0,
    pitch: 22.5,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  })
  const [nearbyAuditoriums, setNearbyAuditoriums] = useState<any[]>([])

  const handleLocationChange = (location: ViewState) => {
    setValue('address.lat', location.latitude, { shouldValidate: true })
    setValue('address.lng', location.longitude, { shouldValidate: true })
    setViewState({
      ...location,
      zoom: 15,
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
    })
  }

  const searchAuditoriums = trpcClient.auditoriums.searchAuditoriums.useQuery(
    {
      where: {},
      addressWhere: {
        ne_lat: viewState.latitude + 0.1,
        ne_lng: viewState.longitude + 0.1,
        sw_lat: viewState.latitude - 0.1,
        sw_lng: viewState.longitude - 0.1,
      }
    },
    {
      enabled: true,
      onSuccess: (data) => {
        setNearbyAuditoriums(data)
      }
    }
  )

  return (
    <div className="grid grid-cols-2 gap-4">
      <form
        onSubmit={handleSubmit(async (data) => {
          console.log('data', data)
          const auditorium = await createAuditorium(data)
          if (auditorium) {
            reset()
            toast({
              title: `Auditorium ${data.auditoriumName} created successfully`,
            })
            revalidatePath('/admin/auditoriums')
            router.replace('/admin/auditoriums')
          }
        })}
      >
        <Label title="Auditorium" error={errors.auditoriumName?.message}>
          <Input
            placeholder="Auditorium name"
            {...register('auditoriumName')}
          />
        </Label>
        <Label title="Manager ID" error={errors.managerId?.message}>
          <Input placeholder="Manager ID" {...register('managerId')} />
        </Label>
        <Label title="Address" error={errors.address?.address?.message}>
          <TextArea placeholder="Address" {...register('address.address')} />
        </Label>
        <AddScreens />
        <Button type="submit" loading={isLoading}>
          Create Auditorium
        </Button>
      </form>
      <Map
        initialViewState={viewState}
        onMove={(evt) => setViewState(evt.viewState)}
      >
        <MapMarker />
        {nearbyAuditoriums?.map((auditorium) => (
          <AuditoriumMarker
            key={auditorium.id}
            longitude={auditorium.Address.lng}
            latitude={auditorium.Address.lat}
            name={auditorium.name}
          />
        ))}

        <Panel position="left-top">
          <SearchPlace onLocationChange={handleLocationChange} />

          <DefaultZoomControls>
            <CenterOfMap
              onClick={(latLng) => {
                const lat = parseFloat(latLng.lat.toFixed(6))
                const lng = parseFloat(latLng.lng.toFixed(6))

                setValue('address.lat', lat, { shouldValidate: true })
                setValue('address.lng', lng, { shouldValidate: true })
                setViewState({
                  ...viewState,
                  latitude: lat,
                  longitude: lng,
                  zoom: 15,
                })
              }}
            />
          </DefaultZoomControls>
        </Panel>
      </Map>
    </div>
  )
}

const AddScreens = () => {
  const {
    control,
    register,
    formState: { errors },
    watch,
  } = useFormContext<FormTypeCreateAuditorium>()
  const { screens } = useWatch<FormTypeCreateAuditorium>()
  const { append, remove, fields } = useFieldArray({
    control,
    name: 'screens',
  })
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div>
      {fields.map((item, screenIndex) => (
        <SimpleAccordion 
          key={item.id} 
          title={`Screen ${screenIndex + 1}`}
        >
          <div className={`flex flex-col gap-2 ${hovered === item.id ? 'bg-strip' : ''}`}>
            <div className="grid grid-cols-2 gap-2">
              <Label
                title="Projection type"
                error={errors.screens?.[screenIndex]?.projectionType?.message}
              >
                <select
                  className="w-full p-2 border rounded"
                  {...register(`screens.${screenIndex}.projectionType`)}
                >
                  {PROJECTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </Label>
              <Label
                title="Sound system type"
                error={errors.screens?.[screenIndex]?.soundSystemType?.message}
              >
                <select
                  className="w-full p-2 border rounded"
                  {...register(`screens.${screenIndex}.soundSystemType`)}
                >
                  {SOUND_SYSTEM_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Label
                title="Rows"
                error={errors.screens?.[screenIndex]?.rows?.message}
              >
                <Input
                  type="number"
                  placeholder="Enter rows"
                  {...register(`screens.${screenIndex}.rows`, {
                    valueAsNumber: true,
                  })}
                />
              </Label>
              <Label
                title="Columns"
                error={errors.screens?.[screenIndex]?.columns?.message}
              >
                <Input
                  type="number"
                  placeholder="Enter columns"
                  {...register(`screens.${screenIndex}.columns`, {
                    valueAsNumber: true,
                  })}
                />
              </Label>
              <Label
                title="Price"
                error={errors.screens?.[screenIndex]?.price?.message}
              >
                <Input
                  type="number"
                  placeholder="Enter price"
                  {...register(`screens.${screenIndex}.price`, {
                    valueAsNumber: true,
                  })}
                />
              </Label>
            </div>
            <div className="flex justify-end my-2">
              <Button
                variant="link"
                size="sm"
                className="text-xs text-gray-600 underline underline-offset-2"
                onClick={() => remove(screenIndex)}
              >
                Remove screen
              </Button>
            </div>
          </div>
        </SimpleAccordion>
      ))}
      <div className="flex justify-end my-2">
        <Button
          variant="link"
          size="sm"
          className="text-xs text-gray-600 underline underline-offset-2"
          onClick={() => {
            append({
              columns: 0,
              price: 0,
              projectionType: 'STANDARD' as ProjectionType,
              rows: 0,
              soundSystemType: 'STANDARD' as SoundSystemType,
            })
          }}
        >
          Add screen
        </Button>
      </div>
    </div>
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
