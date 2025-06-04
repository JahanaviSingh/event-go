import React, { ReactNode } from 'react'

import {
  IconFocusCentered,
  IconMinus,
  IconPlus,
  IconSoup,
  IconTarget,
} from '@tabler/icons-react'
import { useMap } from 'react-map-gl/maplibre'
import type { LngLat } from 'mapbox-gl'

export interface IZoomControlsProps {}

const MapControls = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col overflow-hidden border divide-y rounded shadow-lg divide-primary-800 border-primary-800 backdrop-blur backdrop-filter">
    {children}
  </div>
)

const ZoomIn = () => {
  const { current: map } = useMap()

  return (
    <button
      className=" hover:bg-white"
      type="button"
      onClick={() => map?.zoomIn()}
    >
      <IconPlus className="w-8 h-8 p-1.5 text-black" />
    </button>
  )
}

const ZoomOut = () => {
  const { current: map } = useMap()
  return (
    <button
      className=" hover:bg-white"
      type="button"
      onClick={() => map?.zoomOut()}
    >
      <IconMinus className="w-8 h-8 p-1.5 text-black" />
    </button>
  )
}

interface CenterOfMapProps {
  onClick?: (latLng: {
    lat: number
    lng: number
    formattedAddress?: string
  }) => void
}

export const CenterOfMap = ({ onClick }: CenterOfMapProps) => {
  const { current: map } = useMap()

  if (!map) return null

  return (
    <button
      onClick={() => {
        const center = map.getCenter()
        onClick?.({
          lat: center.lat,
          lng: center.lng,
          formattedAddress: `${center.lat}, ${center.lng}`,
        })
      }}
      className="p-2 rounded-lg bg-white shadow-lg hover:bg-gray-50"
    >
      <IconTarget className="w-5 h-5" />
    </button>
  )
}

MapControls.ZoomIn = ZoomIn
MapControls.ZoomOut = ZoomOut
MapControls.CenterOfMap = CenterOfMap

export default MapControls

export const DefaultZoomControls = ({ children }: { children?: ReactNode }) => (
  <MapControls>
    <ZoomIn />
    <ZoomOut />
    {children}
  </MapControls>
)
