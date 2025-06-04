import { RouterOutputs } from '@/trpc/clients/types'
import { AlertBox } from '../molecules/AlertBox'
import { ShowScreenShowtimes } from '../templates/ListAuditoriums'
import { Button } from '../atoms/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../atoms/Dialog'
import { Pencil, Trash2, MapPin, Phone, Globe, Clock } from 'lucide-react'
import { useState } from 'react'
import { trpcClient } from '@/trpc/clients/client'
import { useToast } from '../molecules/Toaster/use-toast'
import { useRouter } from 'next/navigation'
import { revalidatePath } from '@/util/actions/revalidatePath'

export const AuditoriumInfo = ({
  auditorium,
}: {
  auditorium: RouterOutputs['auditoriums']['auditoriums'][0]
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const utils = trpcClient.useUtils()

  const { mutateAsync: deleteAuditorium, isLoading: isDeleting } =
    trpcClient.auditoriums.deleteAuditorium.useMutation({
      onSuccess: () => {
        utils.auditoriums.auditoriums.invalidate()
        revalidatePath('/admin/auditoriums')
        toast({
          title: 'Auditorium deleted successfully',
          variant: 'default',
        })
      },
      onError: (error) => {
        toast({
          title: 'Failed to delete auditorium',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  const handleDelete = async () => {
    try {
      await deleteAuditorium({ id: auditorium.id })
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error deleting auditorium:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {auditorium.name}
          </h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            {auditorium.Address && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{auditorium.Address.address}</span>
              </div>
            )}
            {auditorium.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{auditorium.phone}</span>
              </div>
            )}
            {auditorium.website && (
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <a
                  href={auditorium.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {auditorium.website}
                </a>
              </div>
            )}
            {auditorium.openingHours && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{auditorium.openingHours}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/admin/auditoriums/${auditorium.id}/edit`)
            }
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Auditorium</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-gray-600">
                  Are you sure you want to delete {auditorium.name}? This action
                  cannot be undone.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  loading={isDeleting}
                >
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-lg font-medium text-gray-700">Screens</div>
          <div className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
            {auditorium.Screens.length}
          </div>
        </div>

        <div className="space-y-6">
          {auditorium.Screens.map((screen) => (
            <div key={screen.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="font-medium text-lg text-gray-800">
                  Screen {screen.number}
                </div>
                <div className="flex gap-2 text-sm text-gray-600">
                  <span className="px-2 py-1 bg-blue-100 rounded-full">
                    {screen.projectionType}
                  </span>
                  <span className="px-2 py-1 bg-green-100 rounded-full">
                    {screen.soundSystemType}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 rounded-full">
                    {screen.screenType}
                  </span>
                </div>
              </div>

              {screen.Showtimes.length === 0 ? (
                <AlertBox className="bg-gray-200">
                  <div className="text-gray-600 text-sm">
                    No shows scheduled.
                  </div>
                </AlertBox>
              ) : (
                <ShowScreenShowtimes screenId={screen.id} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
