import { Marker as MarkerGl, MarkerProps } from 'react-map-gl/maplibre'

export const Marker = (props: MarkerProps) => {
  return <MarkerGl {...props} />
}
