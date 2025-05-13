'use client'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Map } from '../organisms/Map/Map'
import { Panel } from '../organisms/Map/Panel'
import { DefaultZoomControls } from '../organisms/Map/ZoomControls'
import { Marker } from 'react-map-gl/maplibre'
import { useMap } from 'react-map-gl/maplibre'
import type { LngLatBounds } from 'mapbox-gl'
import { BrandIcon } from '../atoms/BrandIcon/BrandIcon'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../atoms/Dialog'
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
import { IconArmchair, IconBox, IconMapPinFilled } from '@tabler/icons-react'
import { useKeypress } from '@/util/hooks/useKeypress'
import { Loader, LoaderPanel } from '@/components/molecules/Loader'
import { SelectSeats } from './SelectSeats'
import { random } from './SelectSeats/util'
import { trpcClient } from '@/trpc/clients/client'
import type { RouterOutputs } from '@/trpc/clients/types'

type Auditorium = RouterOutputs['auditoriums']['searchAuditoriums'][number]
type Show = RouterOutputs['shows']['shows'][number]
type Showtime = RouterOutputs['showtimes']['showtimesPerCinema'][number]

export interface ISearchAuditoriumProps {}

export const SearchAuditorium = ({}: ISearchAuditoriumProps) => {
  const initialViewState = {
    longitude: 80.2,
    latitude: 12.9,
    zoom: 8,
    bearing: 0,
    pitch: 22.5,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  }

  return (
    <Map initialViewState={initialViewState}>
      <Panel position="right-center">
        <DefaultZoomControls />
      </Panel>

      <DisplayAllAuditoriums />

      <Panel position="left-top">
        <SetCity />
      </Panel>
    </Map>
  )
}

export const CityButton = ({ children }: { children: ReactNode }) => {
  return <button className="p-3 rounded hover:shadow-2xl">{children}</button>
}

export const cities = [
  { id: 1, name: 'சென்னை', englishName: 'Chennai', lat: 13.0827, lng: 80.2707 },
  {
    id: 2,
    name: 'ಬೆಂಗಳೂರು',
    englishName: 'Bengaluru',
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    id: 3,
    name: 'തിരുവനന്തപുരം',
    englishName: 'Trivandrum',
    lat: 8.5241,
    lng: 76.9366,
  },

  {
    id: 4,
    name: 'అమరావతి',
    englishName: 'Amaravati',
    lat: 16.5062,
    lng: 80.648,
  },
  {
    id: 5,
    name: 'హైదరాబాద్',
    englishName: 'Hyderabad',
    lat: 17.385,
    lng: 78.4867,
  },
  { id: 7, name: 'मुंबई', englishName: 'Mumbai', lat: 19.076, lng: 72.8777 },
  { id: 8, name: 'पुणे', englishName: 'Pune', lat: 18.5204, lng: 73.8567 },
  { id: 9, name: 'কলকাতা', englishName: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  {
    id: 6,
    name: 'नयी दिल्ली',
    englishName: 'New Delhi',
    lat: 28.6139,
    lng: 77.209,
  },
]

export const SetCity = () => {
  const selectedCityId = useAppSelector((state) => state.cities.selectedCityId)
  const [open, setOpen] = useState(() => !selectedCityId)
  const dispatch = useAppDispatch()

  useKeypress(['l'], () => setOpen((state) => !state))

  const { current: map } = useMap()
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
          <div className="grid grid-cols-3 gap-4">
            {cities.map((city) => (
              <button
                onClick={() => {
                  dispatch(addCityId(city.id))
                  map?.flyTo({
                    center: { lat: city.lat, lng: city.lng },
                    zoom: 10,
                    essential: true,
                  })
                  setOpen(false)
                }}
                className="p-3 rounded hover:shadow-2xl"
                key={city.id}
              >
                <div className="text-lg">{city.name}</div>
                <div className="text-xs text-gray-600">{city.englishName}</div>
              </button>
            ))}
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

  const { data, isLoading } = trpcClient.auditoriums.searchAuditoriums.useQuery({
    addressWhere: locationFilter,
  })

  if (isLoading) return <LoaderPanel />

  return (
    <div>
      {data?.map((auditorium) => (
        <MarkerWithPopup key={auditorium.id} marker={auditorium} />
      ))}
    </div>
  )
}

export const MarkerWithPopup = ({
  marker,
}: {
  marker: Auditorium
}) => {
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

export const BookingStepper = ({ auditoriumId }: { auditoriumId: number }) => {
  const { data, loading } = trpcClient.shows.shows.useQuery({
    auditoriumId: auditoriumId,
  })
  return (
    <div className="space-y-8">
      <SelectShow auditoriumId={auditoriumId} />
      <SelectShowtimes auditoriumId={auditoriumId} />
      <SelectSeats />
    </div>
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
  const { data: shows, isLoading } = trpcClient.shows.shows.useQuery({
    auditoriumId: auditorium.id,
  })

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
  const { data, loading } = trpcClient.showtimes.showtimesPerCinema.useQuery({
    showtimeId: showtimeId,
  })
  if (loading) return <Loader />
  const totalSeats = data?.bookedSeatsInShowtime.total || 0
  const bookedSeats = data?.bookedSeatsInShowtime.booked || 0
  const remainingSeats = totalSeats - bookedSeats
  return (
    <div className="text-xs">
      {remainingSeats} <IconArmchair className="inline w-4 h-4" />
    </div>
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
  "This movie is taking a short vacation! Check back soon for showtimes.",
"Our screen is having a siesta from this film. Stay tuned for more shows.",
"This movie is playing hide-and-seek, and it's winning! Check back later for showtimes.",
"It's the film's day out, but don't worry, it'll be back soon!",
"The projector has chosen a different lineup today. Stay tuned for this movie's return.",
"This movie is nowhere to be scene today, but keep an eye out for future showtimes.",
"A bit of movie mischief today means this film is taking a break. Check back soon!",
"The popcorn party is paused for this movie. Stay tuned for future showtimes.",
"Taking a break from this flick for a fiesta of other films! Check back later.",
"It's time for some reel relaxation. This movie will return soon!"
]

export const SelectShowtimes = ({
  show,
  onClose,
}: {
  show: Show
  onClose: () => void
}) => {
  const dispatch = useAppDispatch()
  const { data: showtimes, isLoading } = trpcClient.showtimes.showtimesPerCinema.useQuery({
    showId: show.id,
  })

  if (isLoading) return <LoaderPanel />

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Showtime</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {showtimes?.map((showtime: Showtime) => (
            <ShowtimeSelectCard
              key={showtime.id}
              showtime={showtime}
              onClick={() => {
                dispatch(addShowtimeId(showtime.id))
                onClose()
              }}
            />
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