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
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { z } from 'zod'
import { IconUpload, IconX } from '@tabler/icons-react'

export const CreateShow = () => {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useFormCreateShow()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'showtimes',
  })
  const { data: screens } = trpcClient.screens.getAll.useQuery()
  const { mutateAsync, isLoading } = trpcClient.shows.createShow.useMutation()
  const { toast } = useToast()
  const router = useRouter()

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreviewUrl(ev.target?.result as string)
      setValue('posterUrl', ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    setValue('posterUrl', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onSubmit = async (data: z.infer<typeof schemaCreateShows>) => {
    try {
      console.log('Form data before submission:', data)
      
      // Submit the form
      const result = await mutateAsync(data)

      console.log('Show created:', result)
      toast({
        title: 'Success',
        description: 'Show created successfully'
      })
      router.push('/admin/shows')
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create show',
        variant: 'destructive'
      })
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <Label title="Title" error={errors.title?.message}>
        <Input placeholder="Enter Show Title" {...register('title')} />
      </Label>

      <Label title="Organizer" error={errors.organizer?.message}>
        <Input placeholder="Enter Organizer" {...register('organizer')} />
      </Label>

      <Label title="Screen" error={errors.screenId?.message}>
        <HtmlSelect {...register('screenId', { valueAsNumber: true })}>
          <option value="">Select Screen</option>
          {screens?.map((screen) => (
            <option key={screen.id} value={screen.id}>
              {screen.Auditorium.name} - Screen {screen.number}
            </option>
          ))}
        </HtmlSelect>
      </Label>

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
              return isNaN(date.getTime())
                ? ''
                : date.toISOString().split('T')[0]
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

      <div className="mb-4">
        <label className="block font-medium mb-1">Poster Image</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Paste image URL or upload"
            {...register('posterUrl', { pattern: { value: /^data:image\/.+;base64,|https?:\/\//, message: 'Enter a valid image URL or upload a file.' } })}
            className="input input-bordered w-full"
            onChange={e => {
              setPreviewUrl(e.target.value)
              setValue('posterUrl', e.target.value)
            }}
            value={previewUrl ?? ''}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <IconUpload className="w-5 h-5" />
            Upload
          </button>
          {previewUrl && (
            <button type="button" className="btn btn-ghost" onClick={handleRemoveImage}>
              <IconX className="w-5 h-5" />
            </button>
          )}
        </div>
        {previewUrl && (
          <div className="mt-2">
            <img src={previewUrl} alt="Poster Preview" className="max-h-48 rounded shadow" />
          </div>
        )}
        {errors.posterUrl && <p className="text-red-500 text-sm mt-1">{errors.posterUrl.message}</p>}
      </div>

      <Button loading={isLoading} type="submit">
        Create Show
      </Button>
    </form>
  )
}
