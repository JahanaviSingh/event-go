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
import { RectangleHorizontal } from 'lucide-react'
import { SimpleAccordion } from '../atoms/accordion'
import { useMap } from 'react-map-gl/maplibre'
import { SearchPlace } from '../organisms/Map/SearchPlace'
import { ViewState } from '../organisms/Map/Map'

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

  const handleLocationChange = (location: ViewState) => {
    setValue('address.lat', location.latitude, { shouldValidate: true })
    setValue('address.lng', location.longitude, { shouldValidate: true })
  }

  return (
    <div className='grid grid-cols-2 gap-4'>
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
        initialViewState={{
          longitude: 80.2,
          latitude: 12.9,
          zoom: 8,
          bearing: 0,
          pitch: 22.5
        }}
      >
        <MapMarker />

        <Panel position="left-top">
          <SearchPlace onLocationChange={handleLocationChange} />
          
          <DefaultZoomControls>
            <CenterOfMap
              onClick={(latLng) => {
                const lat = parseFloat(latLng.lat.toFixed(6))
                const lng = parseFloat(latLng.lng.toFixed(6))

                setValue('address.lat', lat, { shouldValidate: true })
                setValue('address.lng', lng, { shouldValidate: true })
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
    reset,
    formState: { errors },
    watch,
  } = useFormContext<FormTypeCreateAuditorium>()
  const { screens } = useWatch<FormTypeCreateAuditorium>()
  const { append, remove, fields } = useFieldArray({
    control,
    name: 'screens',
  })
  return (
    <div>
      {fields.map((item, screenIndex) => {
        return (
          <SimpleAccordion title={screenIndex + 1} key={item.id}>
            <div className={`flex justify-end my-2`}>
              <Button
                variant="link"
                size="sm"
                className="text-xs text-gray-600 underline underline-offset-2"
                onClick={() => {
                  remove(screenIndex)
                }}
              >
                remove screen
              </Button>
            </div>
            <div>{item.id}</div>
          </SimpleAccordion>
        )
      })}
      
      <div className={`flex justify-end my-2`}>
        <Button
          variant="link"
          size="sm"
          className="text-xs text-gray-600 underline underline-offset-2"
          onClick={() => {
            append({
              columns: 0,
              price: 0,
              projectionType: 'LASER_PROJECTOR',
              rows: 0,
              soundSystemType: 'BI_AMP_SYSTEM',
            })
          }}
        >
          add screen
        </Button>
      </div>
    </div>
  )
}
export const SearchBox = ({
  onChange,
}: {
  onChange: ({ lat, lng }: { lat: number; lng: number }) => void
}) => {
  const { current: map } = useMap()
  return (
    <SearchPlace
      onLocationChange={(location: ViewState) => {
        onChange({ lat: location.latitude, lng: location.longitude })
      }}
    />
  )
}

const MapMarker = () => {
  const { address } = useWatch<FormTypeCreateAuditorium>()
  const { setValue } = useFormContext<FormTypeCreateAuditorium>()

  return (
    <Marker
      pitchAlignment="auto"
      longitude={address?.lng || 0}
      latitude={address?.lat || 0}
      draggable
      onDragEnd={({ lngLat }) => {
        const { lat, lng } = lngLat
        setValue('address.lat', lat || 0)
        setValue('address.lng', lng || 0)
      }}
    >
      <BrandIcon />
    </Marker>
  )
}

export const BrandIcon = () => (
  <div style={{ perspective: '20 px' }}>
    <RectangleHorizontal style={{ transform: 'rotateX(22deg)' }} />
  </div>
)
