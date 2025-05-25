'use client'
import { CreateAuditorium } from '@/components/templates/CreateAuditorium'
import { FormProviderCreateAuditorium } from '@/forms/CreateAuditorium'
import { trpcClient } from '@/trpc/clients/client'
import { Loader } from '@/components/molecules/Loader'
import { useParams } from 'next/navigation'

export default function EditAuditoriumPage() {
  const params = useParams()
  const auditoriumId = Number(params.id)

  const { data: auditorium, isLoading } = trpcClient.auditoriums.getAuditoriumById.useQuery({
    auditoriumId
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="w-8 h-8" />
      </div>
    )
  }

  if (!auditorium) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg text-gray-600">Auditorium not found</p>
      </div>
    )
  }

  // Calculate rows and columns for each screen
  const screens = auditorium.Screens?.map(screen => {
    const rows = Math.ceil(screen.Seats.length / screen.columns)
    return {
      projectionType: screen.projectionType,
      soundSystemType: screen.soundSystemType,
      screenType: screen.screenType,
      rows,
      columns: screen.columns
    }
  }) || []

  return (
    <FormProviderCreateAuditorium defaultValues={{
      auditoriumName: auditorium.name,
      managerId: auditorium.Managers?.[0]?.id || '',
      address: auditorium.Address ? {
        lat: auditorium.Address.lat,
        lng: auditorium.Address.lng,
        address: auditorium.Address.address
      } : undefined,
      screens
    }}>
      <CreateAuditorium mode="edit" auditoriumId={auditoriumId} />
    </FormProviderCreateAuditorium>
  )
} 