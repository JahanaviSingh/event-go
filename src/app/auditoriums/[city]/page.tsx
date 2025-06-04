'use client'

import { useEffect, useState, use } from 'react'
import { trpcClient } from '@/trpc/clients/client'
import { Loader } from '@/components/molecules/Loader'
import {
  IconBuildingEstate,
  IconMapPin,
  IconClock,
  IconCalendar,
  IconTicket,
} from '@tabler/icons-react'
import { format } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Genre } from '@prisma/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/atoms/Dialog'
import { Button } from '@/components/atoms/button'
import { BookingStepper } from '@/components/templates/SearchAuditorium'
import { toast } from 'sonner'

interface AuditoriumsPageProps {
  params: Promise<{
    city: string
  }>
}

const categories = [
  { id: Genre.CULTURAL, name: 'Cultural', icon: '🎭' },
  { id: Genre.CONFERENCE, name: 'Conference', icon: '🎤' },
  {
    id: Genre.STUDENT_PERFORMANCE_AND_PRODUCTION,
    name: 'Student Performance',
    icon: '🎪',
  },
  { id: Genre.SPORTS_EVENT, name: 'Sports', icon: '⚽' },
  { id: Genre.WORKSHOP, name: 'Workshop', icon: '🔧' },
  { id: Genre.FEST, name: 'Fest', icon: '🎉' },
]

export default function AuditoriumsPage({ params }: AuditoriumsPageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [cityName, setCityName] = useState(
    decodeURIComponent(resolvedParams.city),
  )
  const [selectedCategory, setSelectedCategory] = useState<Genre>(
    Genre.CULTURAL,
  )
  const [selectedShow, setSelectedShow] = useState<{
    id: number
    title: string
    genre: string
    organizer: string
    duration: number
    releaseDate: string
    posterUrl: string | null
  } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  console.log('=== Auditoriums Page Debug ===')
  console.log('City from URL:', cityName)

  // Get coordinates for the city
  const {
    data: coordinates,
    error: geocodingError,
    isLoading: isGeocodingLoading,
  } = trpcClient.geocoding.getCoordinates.useQuery(
    { city: cityName },
    {
      onSuccess: (data) => {
        console.log('Geocoding result:', data)
        if (data) {
          console.log('Setting coordinates:', data)
          setLat(data.lat)
          setLng(data.lng)
        } else {
          console.log('No coordinates found for city:', cityName)
        }
      },
      onError: (error) => {
        console.error('Geocoding error:', error)
        toast.error('Could not find location coordinates')
      },
    },
  )

  console.log('Geocoding state:', {
    isLoading: isGeocodingLoading,
    error: geocodingError,
    coordinates,
    lat,
    lng,
  })

  // Get shows for the city
  const {
    data: showsData,
    isLoading: isShowsLoading,
    error: showsError,
  } = trpcClient.shows.shows.useQuery(
    {
      lat: lat ?? undefined,
      lng: lng ?? undefined,
      city: cityName,
    },
    {
      enabled: !!cityName,
      onSuccess: (data) => {
        console.log('Shows query result:', {
          totalMatchingShows: data.matchingShows.length,
          totalAllShows: data.allShows.length,
          hasNearbyShows: data.hasNearbyShows,
          matchingShows: data.matchingShows.map((show) => ({
            id: show.id,
            title: show.title,
            showtimes: show.Showtimes.map((st) => ({
              id: st.id,
              screen: st.Screen?.number,
              auditorium: st.Screen?.Auditorium?.name,
              address: st.Screen?.Auditorium?.Address?.address,
            })),
          })),
        })
      },
      onError: (error) => {
        console.error('Shows query error:', error)
      },
    },
  )

  console.log('Shows query state:', {
    isLoading: isShowsLoading,
    error: showsError,
    hasData: !!showsData,
    totalMatchingShows: showsData?.matchingShows.length,
    totalAllShows: showsData?.allShows.length,
  })

  const matchingShows = showsData?.matchingShows ?? []
  const allShows = showsData?.allShows ?? []
  const hasNearbyShows = showsData?.hasNearbyShows ?? true

  const { data: showtimes } = trpcClient.showtimes.showtimes.useQuery(
    {
      where: {
        Show: {
          id: selectedShow?.id,
        },
      },
    },
    {
      enabled: !!selectedShow?.id,
    },
  )

  const handleBookNow = (show: typeof selectedShow) => {
    setSelectedShow(show)
    if (!showtimes || showtimes.length === 0) {
      toast.error('No showtimes available for this show')
      return
    }
    setIsDialogOpen(true)
  }

  if (isGeocodingLoading || isShowsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8" />
      </div>
    )
  }

  if (geocodingError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error Finding Location</h1>
            <p className="text-gray-600 mb-8">
              We couldn't find the coordinates for {cityName}. Please try
              another location.
            </p>
            <Button onClick={() => router.push('/')} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (showsError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Shows</h1>
            <p className="text-gray-600 mb-8">
              There was an error loading shows for {cityName}. Please try again
              later.
            </p>
            <Button onClick={() => router.push('/')} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!matchingShows.length && !allShows.length) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Shows Available</h1>
            <p className="text-gray-600 mb-8">
              We couldn't find any shows in {cityName}. Please try another
              location.
            </p>
            <Button onClick={() => router.push('/')} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Shows in {cityName}</h1>
          <p className="text-lg opacity-90">
            Discover the best shows happening in your city
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Shows in City */}
      <div className="container mx-auto px-4 py-4">
        <h2 className="text-2xl font-bold mb-6">Shows in {cityName}</h2>
        {!hasNearbyShows ? (
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6"
            role="alert"
          >
            <p>
              No shows found in {cityName}. Showing all available shows instead.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {matchingShows.map((show) => (
              <Link
                key={show.id}
                href={`/shows/${show.id}`}
                className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={show.posterUrl || '/film.png'}
                    alt={show.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/film.png'
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                    {show.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <IconClock className="w-4 h-4" />
                    <span>{show.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <IconCalendar className="w-4 h-4" />
                    <span>
                      {format(new Date(show.releaseDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* All Shows */}
      <div className="container mx-auto px-4 py-4">
        <h2 className="text-2xl font-bold mb-6">All Shows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allShows.map((show) => (
            <div
              key={show.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-4 p-4">
                <div className="relative w-24 h-36 flex-shrink-0">
                  <Image
                    src={show.posterUrl || '/film.png'}
                    alt={show.title}
                    fill
                    sizes="96px"
                    className="object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/film.png'
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg mb-2">{show.title}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <IconClock className="w-4 h-4" />
                      <span>{show.duration} mins</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <IconCalendar className="w-4 h-4" />
                      <span>
                        {format(new Date(show.releaseDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <IconTicket className="w-4 h-4" />
                      <span>From ₹199</span>
                    </div>
                    <div className="mt-4">
                      <Button
                        className="w-full"
                        onClick={() => handleBookNow(show)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white py-8 mt-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href={`/shows?category=${Genre.CULTURAL}`}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <h3 className="font-medium">Cultural</h3>
              <p className="text-sm text-gray-600">
                Cultural events & performances
              </p>
            </Link>
            <Link
              href={`/shows?category=${Genre.CONFERENCE}`}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <h3 className="font-medium">Conference</h3>
              <p className="text-sm text-gray-600">Conferences & seminars</p>
            </Link>
            <Link
              href={`/shows?category=${Genre.STUDENT_PERFORMANCE_AND_PRODUCTION}`}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <h3 className="font-medium">Student Performance</h3>
              <p className="text-sm text-gray-600">
                Student shows & productions
              </p>
            </Link>
            <Link
              href={`/shows?category=${Genre.SPORTS_EVENT}`}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <h3 className="font-medium">Sports</h3>
              <p className="text-sm text-gray-600">Sports events & matches</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="max-w-3xl"
          aria-describedby="booking-dialog-description"
        >
          <DialogHeader>
            <DialogTitle>Book Tickets for {selectedShow?.title}</DialogTitle>
            <p id="booking-dialog-description" className="sr-only">
              Book tickets for {selectedShow?.title}. Select your preferred
              date, time, and seats.
            </p>
          </DialogHeader>
          {selectedShow && (
            <BookingStepper
              show={selectedShow}
              onClose={() => {
                setIsDialogOpen(false)
                setSelectedShow(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
