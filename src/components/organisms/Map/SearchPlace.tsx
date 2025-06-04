'use client'

import { Loader } from 'lucide-react'
import * as React from 'react'

import { useMap } from 'react-map-gl/maplibre'
import { Input } from '../../atoms/input'
import type { ViewState } from '@vis.gl/react-maplibre'
import { trpcClient } from '@/trpc/clients/client'
import { AuditoriumMarker } from './AuditoriumMarker'

export type LocationInfo = {
  placeName: string
  latLng: [number, number]
  id: string
}

export const useSearchLocation = () => {
  const [searchText, setSearchText] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [locationInfo, setLocationInfo] = React.useState<LocationInfo[]>([])
  const [nearbyAuditoriums, setNearbyAuditoriums] = React.useState<any[]>([])
  const [selectedLocation, setSelectedLocation] = React.useState<{
    lat: number
    lng: number
  } | null>(null)

  const searchAuditoriums = trpcClient.auditoriums.searchAuditoriums.useQuery(
    {
      where: {},
      addressWhere: {
        ne_lat: selectedLocation ? selectedLocation.lat + 0.1 : 0,
        ne_lng: selectedLocation ? selectedLocation.lng + 0.1 : 0,
        sw_lat: selectedLocation ? selectedLocation.lat - 0.1 : 0,
        sw_lng: selectedLocation ? selectedLocation.lng - 0.1 : 0,
      },
    },
    {
      enabled: !!selectedLocation,
      onSuccess: (data) => {
        console.log('Found auditoriums:', data)
      },
      onError: (error) => {
        console.error('Error fetching auditoriums:', error)
      },
    },
  )

  React.useEffect(() => {
    if (searchAuditoriums.data) {
      console.log('Setting nearby auditoriums:', searchAuditoriums.data)
      setNearbyAuditoriums(searchAuditoriums.data)
    }
  }, [searchAuditoriums.data])

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!searchText) {
        setLocationInfo([])
        return
      }

      setLoading(true)
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=5`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'EventGo/1.0',
          },
        },
      )
        .then((response) => response.json())
        .then((data) => {
          const filtered = data.map((x: any) => ({
            placeName: x.display_name,
            latLng: [parseFloat(x.lat), parseFloat(x.lon)],
            id: `${x.place_id}-${x.osm_id}`,
          }))

          setLocationInfo(filtered || [])
        })
        .catch((error) => {
          console.error('Error fetching locations:', error)
          setLocationInfo([])
        })
        .finally(() => setLoading(false))
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchText])

  return {
    loading,
    searchText,
    setSearchText,
    locationInfo,
    nearbyAuditoriums,
    setSelectedLocation,
    selectedLocation,
  }
}

export function SearchPlace({
  onLocationChange,
}: {
  onLocationChange?: (location: ViewState) => void
}) {
  const [open, setOpen] = React.useState(false)
  const {
    loading,
    searchText,
    setSearchText,
    locationInfo,
    nearbyAuditoriums,
    setSelectedLocation,
    selectedLocation,
  } = useSearchLocation()
  const { current: map } = useMap()

  const flyToLocation = React.useCallback(
    (latitude: number, longitude: number) => {
      if (!map) return

      map.flyTo({
        center: { lat: latitude, lng: longitude },
        zoom: 13,
        essential: true,
        duration: 2000,
        curve: 1.5,
      })
    },
    [map],
  )

  return (
    <div className="relative">
      <Input
        placeholder="Search place..."
        value={searchText}
        onChange={(e) => {
          setOpen(e.target.value.length > 0)
          setSearchText(e.target.value)
        }}
      />
      {open && (
        <div className="bg-background">
          {loading && <Loader className="animate-spin" />}
          <div className="absolute z-10 top-full w-full bg-white shadow-lg rounded-b-md max-h-60 overflow-y-auto">
            {locationInfo.map((place) => (
              <button
                className="block w-full p-2 text-left hover:bg-gray-100"
                key={place.id}
                onClick={() => {
                  const {
                    latLng: [latitude, longitude],
                  } = place
                  if (onLocationChange) {
                    onLocationChange({
                      latitude,
                      longitude,
                      zoom: 14,
                      bearing: 0,
                      pitch: 22.5,
                      padding: { top: 0, bottom: 0, left: 0, right: 0 },
                      formattedAddress: place.placeName,
                    })
                  }
                  setSelectedLocation({ lat: latitude, lng: longitude })
                  setOpen(false)
                  setSearchText('')
                  flyToLocation(latitude, longitude)
                }}
              >
                {place.placeName}
              </button>
            ))}
          </div>
        </div>
      )}
      {nearbyAuditoriums.map((auditorium) => (
        <AuditoriumMarker
          key={auditorium.id}
          longitude={auditorium.Address.lng}
          latitude={auditorium.Address.lat}
          name={auditorium.auditoriumName}
        />
      ))}
    </div>
  )
}
