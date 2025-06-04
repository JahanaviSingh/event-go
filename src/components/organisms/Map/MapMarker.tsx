import { Marker as MarkerGl } from '@vis.gl/react-maplibre'
import type { MarkerProps } from '@vis.gl/react-maplibre'

export const Marker = (props: MarkerProps) => {
  // Validate coordinates before rendering
  if (
    !props.longitude ||
    !props.latitude ||
    isNaN(props.longitude) ||
    isNaN(props.latitude) ||
    props.longitude < -180 ||
    props.longitude > 180 ||
    props.latitude < -90 ||
    props.latitude > 90
  ) {
    return null
  }

  return <MarkerGl {...props} />
}
