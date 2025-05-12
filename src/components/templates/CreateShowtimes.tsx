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

  return (
    <div>
      <form
        onSubmit={handleSubmit(async (formData) => {
          console.log('Form data:', formData)
          console.log('Form errors:', errors)
          try {
            if (formData.showId <= 0 || formData.screenId <= 0) {
              toast({ title: 'Please select both a show and a screen' })
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
            toast({ title: `Failed: ${error instanceof Error ? error.message : 'Unknown error'}` })
          }
        })}
      >
        <div className="space-y-4">
          <SelectShow
            setValue={(v) => {
              setValue('showId', v)
            }}
            error={errors.showId?.message}
          />
          <SelectScreen
            setValue={(v) => {
              setValue('screenId', v)
            }}
            error={errors.screenId?.message}
          />
          <AddShows error={errors.showtimes?.message} />
          <Button loading={isLoading} type="submit">
            Submit
          </Button>
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
      <Label title="Shows" error={error}>
        <div className="grid grid-cols-3 gap-2">
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
        <Plus className="w-4 h-4" /> Add show
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
  const { data, isLoading } = trpcClient.shows.shows.useQuery()

  return (
    <Label title="Show" error={error}>
      <select
        onChange={(event) => setValue(Number(event.target.value))}
        className="w-full px-3 py-2 border rounded border-input"
        required
      >
        <option value="">Select a show...</option>
        {data?.map((show) => (
          <option key={show.id} value={show.id}>
            {show.title}
          </option>
        ))}
      </select>
    </Label>
  )
}

export const SelectScreen = ({
  setValue,
  error,
}: {
  setValue: (id: number) => void
  error?: string
}) => {
  const { data, isLoading } = trpcClient.auditoriums.myScreens.useQuery()

  return (
    <Label title="Screen number" error={error}>
      <select
        onChange={(event) => setValue(Number(event.target.value))}
        className="w-full px-3 py-2 border rounded border-input"
        required
      >
        <option value="">Select a screen...</option>
        {data?.map((screen) => (
          <option key={screen.id} value={screen.id}>
            {screen.Auditorium.name} - {screen.number}
          </option>
        ))}
      </select>
    </Label>
  )
}