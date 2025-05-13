'use client'
import React from 'react'
import { Map as MapGl } from 'react-map-gl/maplibre'
import type { ViewState } from '@vis.gl/react-maplibre'
import { Panel } from './Panel'

type MapProps = React.ComponentProps<typeof MapGl> & { height?: string }

export const Map = ({ height = 'calc(100vh - 4rem)', ...props }: MapProps) => {
  return (
    <MapGl
      {...props}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      style={{ height }}
      pitch={22.5}
      scrollZoom={false}
      doubleClickZoom={false}
      keyboard={false}
      dragRotate={false}
    >
      {props.children}
    </MapGl>
  )
}
