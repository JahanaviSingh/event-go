'use client'
import React from 'react'
import { Map as MapGl } from 'react-map-gl/maplibre'
import { useMap } from 'react-map-gl/maplibre'

export type ViewState = {
  latitude: number
  longitude: number
  zoom: number
  bearing?: number
  pitch?: number
  padding?: { top: number; bottom: number; left: number; right: number }
}

type MapProps = React.ComponentProps<typeof MapGl> & { height?: string }

export const Map = ({ height = 'calc(100vh - 4rem)', ...props }: MapProps) => {
  return (
    <MapGl
      {...props}
      mapStyle="https://demotiles.maplibre.org/style.json"
      style={{ height }}
      pitch={22.5}
      scrollZoom={false}
      doubleClickZoom={false}
      keyboard={false}
      dragRotate={false}
      touchZoomRotate={false}
      initialViewState={{
        latitude: 20,
        longitude: 78,
        zoom: 4.5,
        bearing: 0,
        pitch: 22.5
      }}
    >
      {props.children}
    </MapGl>
  )
}