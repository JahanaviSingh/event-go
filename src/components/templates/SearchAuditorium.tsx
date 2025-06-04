'use client'
import {
  ReactNode,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react'
import { Map } from '../organisms/Map/Map'
import { Panel } from '../organisms/Map/Panel'
import { DefaultZoomControls } from '../organisms/Map/ZoomControls'
import { Marker } from '@vis.gl/react-maplibre'
import { useMap } from '@vis.gl/react-maplibre'
import type { LngLatBounds } from 'mapbox-gl'
import { BrandIcon } from '../atoms/BrandIcon/BrandIcon'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../atoms/Dialog'
import { useAppDispatch, useAppSelector } from '@/store'
import type { RootState } from '@/store'
import Link from 'next/link'
import {
  addShowId,
  addScreenId,
  addShowtimeId,
  resetShows,
} from '@/store/shows/store'
import { addCityId } from '@/store/cities/store'
import { AuditoriumSelectCard } from '../organisms/AuditoriumSelectCard'
import { ShowtimeSelectCard } from '../organisms/ShowtimeSelectCard'
import { format, isSameDay, isToday, isTomorrow } from 'date-fns'
import {
  IconArmchair,
  IconBox,
  IconMapPinFilled,
  IconBuildingEstate,
  IconMapPin,
  IconSchool,
} from '@tabler/icons-react'
import { useKeypress } from '@/util/hooks/useKeypress'
import { Loader, LoaderPanel } from '@/components/molecules/Loader'
import { SelectSeats } from './SelectSeats'
import { random } from './SelectSeats/util'
import { trpcClient } from '@/trpc/clients/client'
import type { RouterOutputs } from '@/trpc/clients/types'
import { LocationPicker } from '../organisms/Map/LocationPicker'
import { UniversityAuditoriums } from '../organisms/Map/UniversityAuditoriums'
import { notification$ } from '@/store/notification'
import { Notification } from '../molecules/Notification'
import { Input } from '../atoms/input'
import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../atoms/button'

type Auditorium = RouterOutputs['auditoriums']['searchAuditoriums'][number]
type Show = RouterOutputs['shows']['shows'][number]
type Showtime = RouterOutputs['showtimes']['showtimesPerCinema'][number]

export interface ISearchAuditoriumProps {}

interface NearbyAuditorium {
  id: number
  name: string
  lat: number
  lng: number
  type: string
  address: string
  website: string | null
  phone: string | null
  openingHours: string | null
}

export const SearchAuditorium = ({}: ISearchAuditoriumProps) => {
  const initialViewState = {
    longitude: 80.2,
    latitude: 12.9,
    zoom: 8,
    bearing: 0,
    pitch: 22.5,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  }

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [selectedAuditorium, setSelectedAuditorium] =
    useState<NearbyAuditorium | null>(null)
  const router = useRouter()

  const { data: nearbyAuditoriums, isLoading: isLoadingNearby } =
    trpcClient.geocoding.searchNearbyAuditoriums.useQuery(
      selectedLocation
        ? { lat: selectedLocation.lat, lng: selectedLocation.lng, radius: 1000 }
        : undefined,
      {
        enabled: !!selectedLocation,
        onError: (error) => {
          console.error('Error fetching nearby auditoriums:', error)
          notification$.error('Failed to fetch nearby auditoriums')
        },
      },
    )

  const handleLocationSelect = useCallback(
    async (location: {
      lat: number
      lng: number
      formattedAddress: string
    }) => {
      console.log('Selected location:', location)
      setSelectedLocation({ lat: location.lat, lng: location.lng })

      try {
        // Get city name from the formatted address
        const addressParts = location.formattedAddress.split(',')
        const cityName =
          addressParts[addressParts.length - 2]?.trim() ||
          addressParts[0]?.trim()

        if (cityName) {
          // Navigate to the city's auditoriums page
          router.push(`/auditoriums/${encodeURIComponent(cityName)}`)
        } else {
          notification$.error('Could not determine city from selected location')
        }
      } catch (error) {
        console.error('Error processing location:', error)
        notification$.error('Error processing selected location')
      }
    },
    [router],
  )

  return (
    <div className="relative w-full h-full">
      <Notification />
      <Map initialViewState={initialViewState}>
        <Panel position="right-center">
          <DefaultZoomControls />
        </Panel>

        <Panel position="left-top">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 bg-white/80 p-2 rounded-lg shadow-lg">
              <button className="p-2 rounded-lg flex items-center gap-2 bg-primary text-white">
                <IconMapPin className="w-5 h-5" />
                <span className="text-sm">Pick Location</span>
              </button>
            </div>
            <SetCity />
          </div>
        </Panel>

        <LocationPicker onLocationSelect={handleLocationSelect} />

        {/* Nearby Auditorium Markers */}
        {nearbyAuditoriums?.map((auditorium: NearbyAuditorium) => (
          <Marker
            key={auditorium.id}
            longitude={auditorium.lng}
            latitude={auditorium.lat}
            onClick={() => setSelectedAuditorium(auditorium)}
          >
            <div className="relative">
              <IconBuildingEstate className="w-6 h-6 text-pink-500" />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-pink-500 rounded-full" />
            </div>
          </Marker>
        ))}

        {/* Nearby Auditoriums Dialog */}
        <Dialog
          open={!!selectedAuditorium}
          onOpenChange={() => setSelectedAuditorium(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedAuditorium?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Address</h3>
                <p className="text-sm text-gray-600">
                  {selectedAuditorium?.address}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Type</h3>
                <p className="text-sm text-gray-600">
                  {selectedAuditorium?.type}
                </p>
              </div>
              {selectedAuditorium?.website && (
                <div>
                  <h3 className="font-semibold">Website</h3>
                  <a
                    href={selectedAuditorium.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    {selectedAuditorium.website}
                  </a>
                </div>
              )}
              {selectedAuditorium?.phone && (
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-sm text-gray-600">
                    {selectedAuditorium.phone}
                  </p>
                </div>
              )}
              {selectedAuditorium?.openingHours && (
                <div>
                  <h3 className="font-semibold">Opening Hours</h3>
                  <p className="text-sm text-gray-600">
                    {selectedAuditorium.openingHours}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </Map>
      <div className="absolute bottom-4 left-4 bg-white/80 px-3 py-1 rounded text-sm">
        Press <kbd className="px-1 py-0.5 bg-gray-100 rounded border">P</kbd> to
        pick location
      </div>
      {isLoadingNearby && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/80 px-4 py-2 rounded shadow-lg">
          <Loader />
          <span className="ml-2">Searching for nearby auditoriums...</span>
        </div>
      )}
    </div>
  )
}

export const CityButton = ({ children }: { children: ReactNode }) => {
  return <button className="p-3 rounded hover:shadow-2xl">{children}</button>
}

export const cities = [
  {
    id: 1,
    name: 'नयी दिल्ली',
    englishName: 'New Delhi',
    lat: 28.6139,
    lng: 77.209,
  },
  { id: 9, name: 'சென்னை', englishName: 'Chennai', lat: 13.0827, lng: 80.2707 },
  {
    id: 2,
    name: 'ಬೆಂಗಳೂರು',
    englishName: 'Bengaluru',
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    id: 3,
    name: 'लखनऊ',
    englishName: 'Lucknow',
    lat: 26.8467,
    lng: 80.9462,
  },
  {
    id: 4,
    name: 'హైదరాబాద్',
    englishName: 'Hyderabad',
    lat: 17.385,
    lng: 78.4867,
  },
  { id: 5, name: 'मुंबई', englishName: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { id: 6, name: 'पुणे', englishName: 'Pune', lat: 18.5204, lng: 73.8567 },
  { id: 7, name: 'কলকাতা', englishName: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  {
    id: 8,
    name: 'श्रीनगर गढ़वाल',
    englishName: 'Srinagar Garhwal',
    lat: 30.2227,
    lng: 78.7837,
  },
]

export const SetCity = () => {
  const selectedCityId = useAppSelector((state) => state.cities.selectedCityId)
  const [open, setOpen] = useState(() => !selectedCityId)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<
    Array<{
      placeName: string
      latLng: [number, number]
      id: string
      country: string
    }>
  >([])
  const dispatch = useAppDispatch()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useKeypress(['l'], () => {
    // Only toggle if search input is not focused
    if (document.activeElement !== searchInputRef.current) {
      setOpen((state) => !state)
    }
  })

  const handleCitySelect = (cityName: string, cityId?: number) => {
    if (cityId) {
      dispatch(addCityId(cityId))
    }
    setOpen(false)
    setSearchQuery('')
    // Navigate to the city's auditoriums page
    router.push(`/auditoriums/${encodeURIComponent(cityName)}`)
  }

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!searchQuery) {
        setSearchResults([])
        return
      }

      setLoading(true)
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in&limit=5`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'EventGo/1.0',
          },
        },
      )
        .then((response) => response.json())
        .then((data) => {
          const filtered = data
            .filter(
              (x: any) => x.type === 'city' || x.type === 'administrative',
            )
            .map((x: any) => ({
              placeName: x.display_name,
              latLng: [parseFloat(x.lat), parseFloat(x.lon)],
              id: `${x.place_id}-${x.osm_id}`,
              country: x.address?.country || 'India',
            }))

          setSearchResults(filtered || [])
        })
        .catch((error) => {
          console.error('Error fetching locations:', error)
          setSearchResults([])
        })
        .finally(() => setLoading(false))
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  return (
    <div>
      <button
        className="flex flex-col items-center gap-1"
        onClick={() => setOpen(true)}
      >
        <IconMapPinFilled />
        <div className="flex items-center justify-center w-4 h-4 border rounded shadow">
          L
        </div>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select city</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <div className="flex gap-2">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search cities in India..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <button
                onClick={() => {
                  setOpen(false)
                  // Trigger the location picker
                  const locationButton = document.querySelector(
                    'button[aria-label="Pick Location"]',
                  ) as HTMLButtonElement
                  locationButton?.click()
                }}
                className="p-2 rounded-lg bg-primary text-white hover:bg-primary/90"
                title="Open map to pick location"
              >
                <IconMapPin className="w-5 h-5" />
              </button>
            </div>
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader className="w-4 h-4 animate-spin" />
              </div>
            )}
            {searchResults.length > 0 && (
              <div className="absolute z-10 top-full w-full bg-white shadow-lg rounded-b-md max-h-60 overflow-y-auto">
                {searchResults.map((place) => (
                  <button
                    className="block w-full p-2 text-left hover:bg-gray-100"
                    key={place.id}
                    onClick={() =>
                      handleCitySelect(place.placeName.split(',')[0])
                    }
                  >
                    <div className="font-medium">
                      {place.placeName.split(',')[0]}
                    </div>
                    <div className="text-xs text-gray-600">
                      {place.placeName}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Popular Indian Cities</h3>
            <div className="grid grid-cols-3 gap-4">
              {cities.map((city) => (
                <button
                  onClick={() => handleCitySelect(city.englishName, city.id)}
                  className="p-3 rounded hover:shadow-2xl"
                  key={city.id}
                >
                  <div className="text-lg">{city.name}</div>
                  <div className="text-xs text-gray-600">
                    {city.englishName}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const DisplayAllAuditoriums = () => {
  const { current: map } = useMap()

  const [bounds, setBounds] = useState<LngLatBounds>()
  useEffect(() => {
    if (map) {
      const newBounds = map.getBounds()
      setBounds(newBounds as unknown as LngLatBounds)
    }
  }, [map])

  const locationFilter = useMemo(
    () => ({
      ne_lat: bounds?.getNorthEast().lat || 0,
      ne_lng: bounds?.getNorthEast().lng || 0,
      sw_lat: bounds?.getSouthWest().lat || 0,
      sw_lng: bounds?.getSouthWest().lng || 0,
    }),
    [bounds],
  )

  const { data, isLoading } = trpcClient.auditoriums.searchAuditoriums.useQuery(
    {
      addressWhere: locationFilter,
    },
  )

  if (isLoading) return <LoaderPanel />

  return (
    <div>
      {data?.map((auditorium) => (
        <MarkerWithPopup key={auditorium.id} marker={auditorium} />
      ))}
    </div>
  )
}

export const MarkerWithPopup = ({ marker }: { marker: Auditorium }) => {
  if (!marker.address?.lat || !marker.address?.lng || !marker.id) {
    return null
  }

  const [openDialog, setOpenDialog] = useState(false)
  const dispatch = useAppDispatch()

  return (
    <div key={marker?.id}>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="w-96">
          <DialogHeader>
            <DialogTitle>{marker.name}</DialogTitle>
          </DialogHeader>
          <BookingStepper auditoriumId={marker.id} />
        </DialogContent>
      </Dialog>
      <Marker
        anchor="bottom"
        latitude={marker.address.lat}
        longitude={marker.address.lng}
        onClick={() => {
          dispatch(resetShows())
          setOpenDialog(true)
        }}
      >
        <BrandIcon className="cursor-pointer" />
        <MarkerText>{marker.name.split(' ').slice(0, 2).join(' ')}</MarkerText>
      </Marker>
    </div>
  )
}

export const MarkerText = ({ children }: { children: ReactNode }) => (
  <div className="absolute max-w-xs -translate-x-1/2 left-1/2">
    <div className="mt-1 leading-4 text-center min-w-max px-0.5 rounded backdrop-blur-sm bg-white/50">
      {children}
    </div>
  </div>
)

export const BookingStepper = ({
  show,
  onClose,
}: {
  show: {
    id: number
    title: string
    genre: string
    organizer: string
    duration: number
    releaseDate: string
    posterUrl: string | null
  }
  onClose: () => void
}) => {
  const [step, setStep] = useState(1)
  const [selectedAuditorium, setSelectedAuditorium] = useState<{
    id: number
    name: string
    Address: {
      lat: number
      lng: number
    } | null
  } | null>(null)

  const { data: auditoriums, isLoading: isLoadingAuditoriums } =
    trpcClient.auditoriums.searchAuditoriums.useQuery({
      where: {},
      addressWhere: {
        ne_lat: 0,
        ne_lng: 0,
        sw_lat: 0,
        sw_lng: 0,
      },
    })

  const { data: showtimes, isLoading: isLoadingShowtimes } =
    trpcClient.showtimes.showtimes.useQuery(
      {
        where: {
          Show: {
            id: show.id,
          },
        },
      },
      {
        enabled: !!show.id,
      },
    )

  if (isLoadingAuditoriums || isLoadingShowtimes) return <LoaderPanel />

  if (!auditoriums || auditoriums.length === 0) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Auditoriums Available</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            {
              noShowsMessages[
                Math.floor(Math.random() * noShowsMessages.length)
              ]
            }
          </p>
        </DialogContent>
      </Dialog>
    )
  }

  if (!showtimes || showtimes.length === 0) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Showtimes Available</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            {
              noShowsMessages[
                Math.floor(Math.random() * noShowsMessages.length)
              ]
            }
          </p>
        </DialogContent>
      </Dialog>
    )
  }

  // Filter auditoriums that have showtimes for this show
  const availableAuditoriums = auditoriums.filter((auditorium) =>
    showtimes.some(
      (showtime) => showtime.Screen.AuditoriumId === auditorium.id,
    ),
  )

  if (availableAuditoriums.length === 0) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Available Auditoriums</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            {
              noShowsMessages[
                Math.floor(Math.random() * noShowsMessages.length)
              ]
            }
          </p>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book {show.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-medium">Select Auditorium</h3>
              <div className="grid grid-cols-1 gap-2">
                {availableAuditoriums.map((auditorium) => (
                  <div
                    key={auditorium.id}
                    className={`flex border p-4 rounded cursor-pointer ${
                      selectedAuditorium?.id === auditorium.id
                        ? 'border-primary'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedAuditorium(auditorium)}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{auditorium.name}</div>
                      {auditorium.Address && (
                        <div className="text-sm text-gray-600">
                          {auditorium.Address.lat}, {auditorium.Address.lng}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedAuditorium}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          )}
          {step === 2 && selectedAuditorium && (
            <SelectShowtimes
              show={show}
              onClose={onClose}
              auditoriumId={selectedAuditorium.id}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const SelectShow = ({
  auditorium,
  onClose,
}: {
  auditorium: Auditorium
  onClose: () => void
}) => {
  const dispatch = useAppDispatch()
  const { data: shows, isLoading } = trpcClient.shows.shows.useQuery()

  if (isLoading) return <LoaderPanel />

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Show</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {shows?.map((show: Show) => (
            <ShowtimeSelectCard
              key={show.id}
              show={show}
              onClick={() => {
                dispatch(addShowId(show.id))
                onClose()
              }}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const ShowRemainingSeats = ({ showtimeId }: { showtimeId: number }) => {
  const { data: seatsInfo } = trpcClient.showtimes.seatsInfo.useQuery({
    showtimeId,
  })

  if (!seatsInfo) return null

  const { total, booked } = seatsInfo
  const remaining = total - booked

  return (
    <div className="text-xs text-gray-600">{remaining} seats remaining</div>
  )
}

const formatDate = (dateString: string) => {
  const date = new Date(+dateString)
  if (isToday(date)) {
    return 'Today'
  } else if (isTomorrow(date)) {
    return 'Tomorrow'
  } else {
    return format(date, 'PPPP')
  }
}

export const noShowsMessages = [
  'This movie is taking a short vacation! Check back soon for showtimes.',
  'Our screen is having a siesta from this film. Stay tuned for more shows.',
  "This movie is playing hide-and-seek, and it's winning! Check back later for showtimes.",
  "It's the film's day out, but don't worry, it'll be back soon!",
  "The projector has chosen a different lineup today. Stay tuned for this movie's return.",
  'This movie is nowhere to be scene today, but keep an eye out for future showtimes.',
  'A bit of movie mischief today means this film is taking a break. Check back soon!',
  'The popcorn party is paused for this movie. Stay tuned for future showtimes.',
  'Taking a break from this flick for a fiesta of other films! Check back later.',
  "It's time for some reel relaxation. This movie will return soon!",
]

export const SelectShowtimes = ({
  show,
  onClose,
  auditoriumId,
}: {
  show: {
    id: number
    title: string
    genre: string
    organizer: string
    duration: number
    releaseDate: string
    posterUrl: string | null
  }
  onClose: () => void
  auditoriumId: number
}) => {
  const dispatch = useAppDispatch()
  const { data: showtimesByDate, isLoading } =
    trpcClient.showtimes.showtimesPerCinema.useQuery({
      showId: show.id,
      auditoriumId: auditoriumId,
    })

  if (isLoading) return <LoaderPanel />

  if (!showtimesByDate || showtimesByDate.length === 0) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Showtimes Available</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            {
              noShowsMessages[
                Math.floor(Math.random() * noShowsMessages.length)
              ]
            }
          </p>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Showtime</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {showtimesByDate.map(({ date, showtimes }) => (
            <div key={date}>
              <h3 className="font-medium mb-2">
                {format(new Date(date), 'MMMM d, yyyy')}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {showtimes.map((showtime) => (
                  <div
                    key={showtime.id}
                    className="flex border p-1 rounded flex-col items-start"
                  >
                    <div className="text-sm font-bold">
                      {format(new Date(showtime.startTime), 'p')}
                    </div>
                    <div className="text-sm">Rs.{showtime.Screen.price}</div>
                    <div className="text-xs">
                      {showtime.Screen.projectionType}
                    </div>
                    <div className="text-xs">
                      {showtime.Screen.soundSystemType}
                    </div>
                    <ShowRemainingSeats showtimeId={showtime.id} />
                    <Button
                      onClick={() => {
                        dispatch(addShowtimeId(showtime.id))
                        onClose()
                      }}
                      className="w-full mt-2"
                      variant="outline"
                    >
                      Book Now
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const Success = () => {
  return (
    <div className="flex flex-col items-start justify-center py-2 ">
      <h2 className="mb-4 text-2xl font-bold ">
        🎉🎉🎉 Congratulations! Your ticket is booked. 🎉🎉🎉
      </h2>
      <p className="text-lg text-gray-700">
        Check your{' '}
        <Link
          href="/tickets"
          className="font-semibold underline underline-offset-4"
        >
          Tickets
        </Link>{' '}
        for more information.
      </p>
    </div>
  )
}
