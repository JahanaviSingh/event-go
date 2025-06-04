'use client'
import { ListAuditoriums } from '@/components/templates/ListAuditoriums'
import { trpcClient } from '@/trpc/clients/client'
import { Button } from '@/components/atoms/button'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Loader } from '@/components/molecules/Loader'

export default function Page() {
  const router = useRouter()
  const { data: auditoriums, isLoading } =
    trpcClient.auditoriums.auditoriums.useQuery({
      where: {},
      include: {
        Screens: {
          include: {
            Showtimes: {
              include: {
                Show: true,
              },
            },
          },
        },
        Address: true,
      },
    })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="w-8 h-8" />
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Auditoriums</h1>
          <p className="mt-2 text-gray-600">
            Manage your auditoriums and their screens
          </p>
        </div>
        <Button onClick={() => router.push('/admin/auditoriums/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Auditorium
        </Button>
      </div>

      {auditoriums?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">
            No auditoriums yet
          </h3>
          <p className="mt-2 text-gray-600">
            Get started by creating your first auditorium
          </p>
          <div className="mt-6">
            <Button onClick={() => router.push('/admin/auditoriums/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Auditorium
            </Button>
          </div>
        </div>
      ) : (
        <ListAuditoriums auditoriums={auditoriums || []} />
      )}
    </main>
  )
}
