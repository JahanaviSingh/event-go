'use client'
import {
  FormProviderCreateShowtime,
  FormTypeCreateShowtime,
} from '@/forms/CreateShowtime'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { trpcClient } from '@/trpc/clients/client'
import { useToast } from '../molecules/Toaster/use-toast'
import { Button } from '../atoms/button'
import { Label } from '../atoms/label'
import { Input } from '../atoms/input'
import { Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { revalidatePath } from '@/util/actions/revalidatePath'
import { Loader } from '../molecules/Loader'
import Image from 'next/image'
import { useState, useEffect } from 'react'

export interface ICreateShowtimeProps {}

export const CreateShowtime = () => (
  <FormProviderCreateShowtime>
    <CreateShowtimeContent />
  </FormProviderCreateShowtime>
)

export const CreateShowtimeContent = ({}: ICreateShowtimeProps) => {
  const {
    setValue,
    reset,
    handleSubmit,
    watch,
    formState: { errors },
  } = useFormContext<FormTypeCreateShowtime>()
  const {
    isLoading,
    data,
    error,
    mutateAsync: createShowtime,
  } = trpcClient.showtimes.create.useMutation()

  const { toast } = useToast()
  const { replace } = useRouter()
  const selectedAuditoriumId = watch('auditoriumId')
  const selectedShowId = watch('showId')

  return (
    <div>
      <form
        onSubmit={handleSubmit(async (formData) => {
          console.log('Form data:', formData)
          console.log('Form errors:', errors)
          try {
            if (
              formData.showId <= 0 ||
              formData.auditoriumId <= 0 ||
              formData.screenId <= 0
            ) {
              toast({ title: 'Please select a show, auditorium, and screen' })
              return
            }
            if (formData.showtimes.length === 0) {
              toast({ title: 'Please add at least one showtime' })
              return
            }

            // Validate and format dates
            const showtimes = formData.showtimes.map(({ time }) => {
              if (!time) {
                throw new Error('Showtime is required')
              }
              // Ensure the date is in ISO format
              const date = new Date(time)
              if (isNaN(date.getTime())) {
                throw new Error('Invalid date format')
              }
              return { time: date.toISOString() }
            })

            const result = await createShowtime({
              showId: formData.showId,
              screenId: formData.screenId,
              showtimes,
            })
            console.log('Mutation result:', result)
            toast({ title: 'Showtimes created.' })
            reset()
            revalidatePath('/manager/auditoriums')
            replace('/manager/auditoriums')
          } catch (error) {
            console.error('Submission error:', error)
            toast({
              title: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            })
          }
        })}
      >
        <div className="space-y-4">
          <SelectAuditorium
            setValue={(v) => {
              setValue('auditoriumId', v)
              setValue('screenId', -99) // Reset screen selection when auditorium changes
              setValue('showId', -99) // Reset show selection when auditorium changes
            }}
            error={errors.auditoriumId?.message}
          />
          <SelectShow
            setValue={(v) => {
              setValue('showId', v)
            }}
            error={errors.showId?.message}
          />
          {selectedAuditoriumId > 0 && selectedShowId > 0 && (
            <>
              <SelectScreen
                setValue={(v) => {
                  setValue('screenId', v)
                }}
                error={errors.screenId?.message}
                auditoriumId={selectedAuditoriumId}
              />
              <AddShows error={errors.showtimes?.message} />
              <Button loading={isLoading} type="submit">
                Submit
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}

export const AddShows = ({ error }: { error?: string }) => {
  const { control, register } = useFormContext<FormTypeCreateShowtime>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'showtimes',
  })

  return (
    <div>
      <Label title="Showtimes" error={error}>
        <div className="grid grid-cols-1 gap-2">
          {fields.map((item, index) => (
            <div key={item.id} className="flex gap-2">
              <Label className="flex-1">
                <Input
                  {...register(`showtimes.${index}.time`)}
                  type="datetime-local"
                  required
                  step="300" // 5-minute intervals
                />
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="h-10 w-10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Label>

      <Button
        className="flex items-center justify-center w-full py-2 mt-2 text-xs border border-dashed"
        size="sm"
        variant="link"
        onClick={() =>
          append({
            time: '',
          })
        }
      >
        <Plus className="w-4 h-4" /> Add showtime
      </Button>
    </div>
  )
}

export const SelectShow = ({
  setValue,
  error,
}: {
  setValue: (id: number) => void
  error?: string
}) => {
  const [lat, setLat] = useState<number | undefined>()
  const [lng, setLng] = useState<number | undefined>()
  const [city, setCity] = useState<string | undefined>()

  useEffect(() => {
    // Get location from URL search params
    const searchParams = new URLSearchParams(window.location.search)
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')

    if (latParam && lngParam) {
      setLat(parseFloat(latParam))
      setLng(parseFloat(lngParam))
    }

    // Get city from URL path
    const pathParts = window.location.pathname.split('/')
    const cityFromPath = pathParts[pathParts.length - 1]
    if (cityFromPath && cityFromPath !== 'new-showtime') {
      setCity(decodeURIComponent(cityFromPath))
    }
  }, [])

  const {
    data: showsData,
    isLoading,
    error: queryError,
  } = trpcClient.shows.shows.useQuery({ lat, lng, city }, { enabled: true })

  const shows = showsData?.shows ?? []

  if (isLoading) {
    return (
      <Label title="Show" error={error}>
        <div className="flex items-center justify-center p-4">
          <Loader className="w-6 h-6" />
        </div>
      </Label>
    )
  }

  if (queryError) {
    return (
      <Label title="Show" error={error}>
        <div className="p-4 text-red-500">
          Error loading shows: {queryError.message}
        </div>
      </Label>
    )
  }

  if (!shows || shows.length === 0) {
    return (
      <Label title="Show" error={error}>
        <div className="p-4 text-gray-500">
          No shows available in {city || 'this location'}
        </div>
      </Label>
    )
  }

  return (
    <Label title="Show" error={error}>
      <select
        className="w-full p-2 border rounded"
        onChange={(e) => setValue(Number(e.target.value))}
      >
        <option value="" disabled>
          Select a show
        </option>
        {shows.map((show) => (
          <option key={show.id} value={show.id}>
            {show.title} ({show.duration} mins)
          </option>
        ))}
      </select>
    </Label>
  )
}

export const SelectAuditorium = ({
  setValue,
  error,
}: {
  setValue: (id: number) => void
  error?: string
}) => {
  const {
    data: auditoriums,
    isLoading,
    error: queryError,
  } = trpcClient.auditoriums.searchAuditoriums.useQuery({
    addressWhere: {
      ne_lat: 90,
      ne_lng: 180,
      sw_lat: -90,
      sw_lng: -180,
    },
  })

  if (isLoading) {
    return (
      <Label title="Auditorium" error={error}>
        <div className="flex items-center justify-center p-4">
          <Loader className="w-6 h-6" />
        </div>
      </Label>
    )
  }

  if (queryError) {
    return (
      <Label title="Auditorium" error={error}>
        <div className="p-4 text-red-500">
          Error loading auditoriums: {queryError.message}
        </div>
      </Label>
    )
  }

  if (!auditoriums || auditoriums.length === 0) {
    return (
      <Label title="Auditorium" error={error}>
        <div className="p-4 text-gray-500">No auditoriums available</div>
      </Label>
    )
  }

  return (
    <Label title="Auditorium" error={error}>
      <select
        className="w-full p-2 border rounded-lg"
        onChange={(e) => setValue(Number(e.target.value))}
        defaultValue=""
      >
        <option value="" disabled>
          Select an auditorium
        </option>
        {auditoriums.map((auditorium) => (
          <option key={auditorium.id} value={auditorium.id}>
            {auditorium.name} ({auditorium.Screens.length} screens)
          </option>
        ))}
      </select>
    </Label>
  )
}

export const SelectScreen = ({
  setValue,
  error,
  auditoriumId,
}: {
  setValue: (id: number) => void
  error?: string
  auditoriumId?: number
}) => {
  const {
    data: screens,
    isLoading,
    error: queryError,
  } = trpcClient.auditoriums.myScreens.useQuery(
    { auditoriumId: auditoriumId || -1 },
    {
      enabled: !!auditoriumId && auditoriumId > 0,
    },
  )

  if (!auditoriumId || auditoriumId <= 0) {
    return (
      <Label title="Screen" error={error}>
        <div className="p-4 text-gray-500">
          Please select an auditorium first
        </div>
      </Label>
    )
  }

  if (isLoading) {
    return (
      <Label title="Screen" error={error}>
        <div className="flex items-center justify-center p-4">
          <Loader className="w-6 h-6" />
        </div>
      </Label>
    )
  }

  if (queryError) {
    return (
      <Label title="Screen" error={error}>
        <div className="p-4 text-red-500">
          Error loading screens: {queryError.message}
        </div>
      </Label>
    )
  }

  if (!screens || screens.length === 0) {
    return (
      <Label title="Screen" error={error}>
        <div className="p-4 text-gray-500">
          No screens available for this auditorium
        </div>
      </Label>
    )
  }

  return (
    <Label title="Screen" error={error}>
      <select
        className="w-full p-2 border rounded-lg"
        onChange={(e) => setValue(Number(e.target.value))}
        defaultValue=""
      >
        <option value="" disabled>
          Select a screen
        </option>
        {screens.map((screen) => (
          <option key={screen.id} value={screen.id}>
            Screen {screen.number} - {screen.projectionType} (
            {screen.soundSystemType})
          </option>
        ))}
      </select>
    </Label>
  )
}
