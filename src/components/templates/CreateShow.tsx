'use client'

import { useFormCreateShow } from '@/forms/CreateShow'
import { Input } from '../atoms/input'
import { Label } from '../atoms/label'
import { Genre } from '@prisma/client'
import { Button } from '../atoms/button'
import { HtmlSelect } from '../atoms/select'
import { trpcClient } from '@/trpc/clients/client'
import { useToast } from '../molecules/Toaster/use-toast'
import { useRouter } from 'next/navigation'
import { revalidatePath } from '@/util/actions/revalidatePath'
import { useFieldArray } from 'react-hook-form'

export const CreateShow = () => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useFormCreateShow()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'showtimes',
  })
  const { data: screens } = trpcClient.screens.getAll.useQuery()
  const { mutateAsync, isLoading } = trpcClient.shows.createShow.useMutation()
  const { toast } = useToast()
  const router = useRouter()

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        console.log('errors', errors)
        console.log('Form submitted:', data)
        const show = await mutateAsync(data)
        if (show) {
          reset()
          toast({ title: `Show ${data.title} created successfully` })
          revalidatePath('/admin/shows')
          router.replace('/admin/shows')
        }
      })}
    >
      <Label title="Title" error={errors.title?.message}>
        <Input placeholder="Enter Show Title" {...register('title')} />
      </Label>

      <Label title="Organizer" error={errors.organizer?.message}>
        <Input placeholder="Enter Organizer" {...register('organizer')} />
      </Label>

        {/* <Label title="Screen" error={errors.screenId?.message}>
          <HtmlSelect {...register('screenId', { valueAsNumber: true })}>
            <option value="">Select Screen</option>
            {screens?.map((screen) => (
              <option key={screen.id} value={screen.id}>
                {screen.number}
              </option>
            ))}
          </HtmlSelect>
        </Label> */}

      <Label title="Showtimes" error={errors.showtimes?.message}>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-4">
            <Input
              type="time"
              {...register(`showtimes.${index}.startTime` as const)}
            />
            <Button type="button" onClick={() => remove(index)}>
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" onClick={() => append({ startTime: '' })}>
          Add Showtime
        </Button>
      </Label>

      <Label title="Duration" error={errors.duration?.message}>
        <Input
          placeholder="Duration"
          {...register('duration', { valueAsNumber: true })}
        />
      </Label>

      <Label title="Release Date" error={errors.releaseDate?.message}>
        <Input
          placeholder="Release Date"
          type="date"
          {...register('releaseDate', {
            setValueAs: (value) => {
              const date = new Date(value)
              return isNaN(date.getTime()) ? '' : date.toISOString()
            },
          })}
        />
      </Label>

      <Label title="Genre" error={errors.genre?.message}>
        <HtmlSelect placeholder="Genre" {...register('genre')}>
          {Object.values(Genre).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </HtmlSelect>
      </Label>

      <Button loading={isLoading} type="submit">
        Submit
      </Button>
    </form>
  )
}
