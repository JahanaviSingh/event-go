'use client'

import { trpcClient } from '@/trpc/clients/client'
import { LoaderPanel } from '@/components/molecules/Loader'
import { format, parseISO } from 'date-fns'
import Image from 'next/image'
import { IconClock, IconCalendar, IconTicket } from '@tabler/icons-react'
import { Button } from '@/components/atoms/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/atoms/Dialog'
import { BookingStepper } from '@/components/templates/SearchAuditorium'
import { use } from 'react'
import { useToast } from '@/components/molecules/Toaster/use-toast'

export default function ShowPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { toast } = useToast()
  const { data: show, isLoading } = trpcClient.shows.shows.useQuery({
    id: parseInt(resolvedParams.id)
  })

  if (isLoading) return <LoaderPanel />

  if (!show) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold text-red-600">Show not found</h1>
      </div>
    )
  }

  const releaseDate = show.releaseDate ? parseISO(show.releaseDate) : null

  const handleBookingClick = () => {
    if (!show.Screen?.Auditorium?.id) {
      toast({
        title: "Cannot book tickets",
        description: "This show is not associated with any auditorium",
        variant: "destructive"
      })
      return
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">{show.title}</h1>
          <p className="text-lg opacity-90">{show.organizer}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Show Poster */}
          <div className="md:col-span-1">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
              <Image
                src={show.posterUrl || '/film.png'}
                alt={`Poster for ${show.title} - ${show.genre} show by ${show.organizer}`}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/film.png';
                }}
              />
            </div>
          </div>

          {/* Show Details */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <IconClock className="w-5 h-5" />
                  <span>{show.duration} mins</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <IconCalendar className="w-5 h-5" />
                  <span>{releaseDate ? format(releaseDate, 'MMMM d, yyyy') : 'Date not available'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <IconTicket className="w-5 h-5" />
                  <span>Genre: {show.genre}</span>
                </div>

                <div className="mt-8">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" onClick={handleBookingClick}>Book Tickets</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Book Tickets for {show.title}</DialogTitle>
                      </DialogHeader>
                      {show.Screen?.Auditorium?.id && (
                        <BookingStepper auditoriumId={show.Screen.Auditorium.id} />
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 