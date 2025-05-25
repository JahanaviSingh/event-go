'use client'

import { useEffect, useState } from 'react'
import { trpcClient } from '@/trpc/clients/client'
import { Loader } from '@/components/molecules/Loader'
import { IconBuildingEstate, IconMapPin, IconClock, IconCalendar, IconTicket } from '@tabler/icons-react'
import { format } from 'date-fns'
import Link from 'next/link'
import Image from 'next/image'
import { use } from 'react'
import { Genre } from '@prisma/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/atoms/Dialog'
import { Button } from '@/components/atoms/button'
import { BookingStepper } from '@/components/templates/SearchAuditorium'

interface CityAuditoriumsPageProps {
  params: Promise<{
    city: string
  }>
}

const categories = [
  { id: Genre.CULTURAL, name: 'Cultural', icon: '🎭' },
  { id: Genre.CONFERENCE, name: 'Conference', icon: '🎤' },
  { id: Genre.STUDENT_PERFORMANCE_AND_PRODUCTION, name: 'Student Performance', icon: '🎪' },
  { id: Genre.SPORTS_EVENT, name: 'Sports', icon: '⚽' },
  { id: Genre.WORKSHOP, name: 'Workshop', icon: '🔧' },
  { id: Genre.FEST, name: 'Fest', icon: '🎉' },
]

export default function CityAuditoriumsPage({ params }: CityAuditoriumsPageProps) {
  const resolvedParams = use(params)
  const [cityName, setCityName] = useState(decodeURIComponent(resolvedParams.city))
  const [selectedCategory, setSelectedCategory] = useState<Genre>(Genre.CULTURAL)
  const { data: shows, isLoading } = trpcClient.shows.shows.useQuery({
    city: cityName,
    category: selectedCategory,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">
            Shows in {cityName}
          </h1>
          <p className="text-lg opacity-90">Discover the best shows happening in your city</p>
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

      {/* Featured Shows */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Featured Shows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {shows?.slice(0, 4).map((show) => (
            <Link
              key={show.id}
              href={`/shows/${show.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <Image
                  src={show.posterUrl || '/film.png'}
                  alt={show.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/film.png';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{show.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <IconClock className="w-4 h-4" />
                  <span>{show.duration} mins</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <IconCalendar className="w-4 h-4" />
                  <span>{format(new Date(show.releaseDate), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* All Shows */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">All Shows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows?.map((show) => (
            <Link
              key={show.id}
              href={`/shows/${show.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-4 p-4">
                <div className="relative w-24 h-36 flex-shrink-0">
                  <Image
                    src={show.posterUrl || '/film.png'}
                    alt={show.title}
                    fill
                    className="object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/film.png';
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
                      <span>{format(new Date(show.releaseDate), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <IconTicket className="w-4 h-4" />
                      <span>From ₹199</span>
                    </div>
                    <div className="mt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full">Book Now</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Book Tickets for {show.title}</DialogTitle>
                          </DialogHeader>
                          <BookingStepper auditoriumId={show.auditoriumId} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white py-8 mt-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href={`/shows?category=${Genre.CULTURAL}`} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
              <h3 className="font-medium">Cultural</h3>
              <p className="text-sm text-gray-600">Cultural events & performances</p>
            </Link>
            <Link href={`/shows?category=${Genre.CONFERENCE}`} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
              <h3 className="font-medium">Conference</h3>
              <p className="text-sm text-gray-600">Conferences & seminars</p>
            </Link>
            <Link href={`/shows?category=${Genre.STUDENT_PERFORMANCE_AND_PRODUCTION}`} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
              <h3 className="font-medium">Student Performance</h3>
              <p className="text-sm text-gray-600">Student shows & productions</p>
            </Link>
            <Link href={`/shows?category=${Genre.SPORTS_EVENT}`} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
              <h3 className="font-medium">Sports</h3>
              <p className="text-sm text-gray-600">Sports events & matches</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 