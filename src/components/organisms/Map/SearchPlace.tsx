'use client'

import { Loader } from 'lucide-react'
import * as React from 'react'

import { useMap } from 'react-map-gl/maplibre'
import { Input } from '../../atoms/input'
import { ViewState } from '../Map/Map'

export type LocationInfo = { placeName: string; latLng: [number, number] }

export const useSearchLocation = () => {
  const [searchText, setSearchText] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [locationInfo, setLocationInfo] = React.useState<LocationInfo[]>([])

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!searchText) {
        setLocationInfo([])
        return
      }
      
      setLoading(true)
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchText}.json?fuzzyMatch=true&access_token=pk.eyJ1IjoiaWFta2FydGhpY2siLCJhIjoiY2t4b3AwNjZ0MGtkczJub2VqMDZ6OWNrYSJ9.-FMKkHQHvHUeDEvxz2RJWQ`,
      )
        .then((response) => response.json())
        .then((data) => {
          const filtered = data.features?.map((x: any) => ({
            placeName: x.place_name,
            latLng: [x.center[1], x.center[0]],
          }))

          setLocationInfo(filtered || [])
        })
        .catch((error) => {
          console.error('Error fetching locations:', error)
          setLocationInfo([])
        })
        .finally(() => setLoading(false))
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchText])

  return { loading, searchText, setSearchText, locationInfo }
}

export function SearchPlace({
  onLocationChange,
}: {
  onLocationChange?: (location: ViewState) => void
}) {
  const [open, setOpen] = React.useState(false)
  const { loading, searchText, setSearchText, locationInfo } = useSearchLocation()
  const { current: map } = useMap()

  const flyToLocation = React.useCallback((latitude: number, longitude: number) => {
    if (!map) return

    map.flyTo({
      center: { lat: latitude, lng: longitude },
      zoom: 14, // Zoom in closer to the location
      essential: true,
      duration: 2000, // Smooth animation over 2 seconds
      curve: 1.5, // Slightly curved path for better visual effect
    })
  }, [map])

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
                key={place.placeName}
                onClick={() => {
                  const {
                    latLng: [latitude, longitude],
                  } = place
                  if (onLocationChange) {
                    onLocationChange({ latitude, longitude, zoom: 14 })
                  }
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
    </div>
  )
}