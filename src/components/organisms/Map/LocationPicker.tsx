import { IconMapPinFilled } from '@tabler/icons-react'
import { useMap } from '@vis.gl/react-maplibre'
import { useState, useEffect, useCallback } from 'react'
import { trpcClient } from '@/trpc/clients/client'
import { notification$ } from '@/lib/subjects'
import { Marker } from '@vis.gl/react-maplibre'
import { useKeypress } from '@/util/hooks/useKeypress'

interface LocationPickerProps {
  onLocationSelect?: (address: {
    lat: number
    lng: number
    formattedAddress: string
  }) => void
  initialLocation?: { lat: number; lng: number }
}

export const LocationPicker = ({
  onLocationSelect,
  initialLocation,
}: LocationPickerProps) => {
  const { current: map } = useMap()
  const [isPicking, setIsPicking] = useState(false)
  const [markerLocation, setMarkerLocation] = useState<{
    lat: number
    lng: number
  } | null>(initialLocation || null)

  // Toggle picking mode with 'P' key
  useKeypress(['p'], () => {
    if (!map) return
    setIsPicking((prev) => {
      const newState = !prev
      if (newState) {
        map.getCanvas().style.cursor = 'none'
        notification$.next({
          message: 'Click to place marker (Press P to cancel)',
          type: 'info',
        })
      } else {
        map.getCanvas().style.cursor = ''
      }
      return newState
    })
  })

  // Query for reverse geocoding
  const { refetch: reverseGeocode } =
    trpcClient.geocoding.reverseGeocode.useQuery(
      markerLocation
        ? { lat: markerLocation.lat, lng: markerLocation.lng }
        : null,
      {
        enabled: !!markerLocation, // Only run when we have coordinates
        onSuccess: (data) => {
          if (onLocationSelect && data) {
            onLocationSelect({
              lat: data.lat,
              lng: data.lng,
              formattedAddress: data.formattedAddress,
            })
          }
          notification$.next({
            message: 'Location selected successfully',
            type: 'success',
          })
        },
        onError: () => {
          notification$.next({
            message: 'Failed to get address for selected location',
            type: 'error',
          })
        },
      },
    )

  const handleMapClick = useCallback(
    (e: any) => {
      if (!isPicking || !map) return

      const { lng, lat } = e.lngLat
      console.log('Placing marker at:', { lat, lng })
      setMarkerLocation({ lat, lng })
      // No need to call reverseGeocode() as the query will run automatically
      setIsPicking(false)
      map.getCanvas().style.cursor = ''
    },
    [isPicking, map],
  )

  const handleMarkerDragEnd = useCallback((e: any) => {
    const { lng, lat } = e.lngLat
    console.log('Dragged marker to:', { lat, lng })
    setMarkerLocation({ lat, lng })
    // No need to call reverseGeocode() as the query will run automatically
  }, [])

  // Add click listener when in picking mode
  useEffect(() => {
    if (!map) return

    if (isPicking) {
      map.on('click', handleMapClick)
    }

    return () => {
      map.off('click', handleMapClick)
    }
  }, [map, isPicking, handleMapClick])

  // Custom cursor when in picking mode
  useEffect(() => {
    if (!map) return

    let cursorElement: HTMLDivElement | null = null

    const createCursor = () => {
      cursorElement = document.createElement('div')
      cursorElement.style.position = 'fixed'
      cursorElement.style.pointerEvents = 'none'
      cursorElement.style.zIndex = '9999'
      cursorElement.style.transform = 'translate(-50%, -50%)'
      cursorElement.style.display = 'none'
      cursorElement.innerHTML = `
        <div class="relative">
          <svg class="w-6 h-6 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-pink-500 rounded-full"></div>
        </div>
      `
      document.body.appendChild(cursorElement)
    }

    const updateCursor = (e: MouseEvent) => {
      if (!isPicking || !cursorElement) return
      cursorElement.style.display = 'block'
      cursorElement.style.left = `${e.clientX}px`
      cursorElement.style.top = `${e.clientY}px`
    }

    if (isPicking) {
      createCursor()
      document.addEventListener('mousemove', updateCursor)
    }

    return () => {
      document.removeEventListener('mousemove', updateCursor)
      if (cursorElement && document.body.contains(cursorElement)) {
        document.body.removeChild(cursorElement)
      }
    }
  }, [isPicking, map])

  return (
    <>
      {markerLocation && (
        <Marker
          longitude={markerLocation.lng}
          latitude={markerLocation.lat}
          anchor="bottom"
          draggable
          onDragEnd={handleMarkerDragEnd}
        >
          <div className="relative">
            <IconMapPinFilled className="w-8 h-8 text-pink-500" />
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-pink-500 rounded-full" />
          </div>
        </Marker>
      )}
    </>
  )
}
