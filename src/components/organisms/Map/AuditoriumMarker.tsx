import { Marker } from './MapMarker'
import { Building2 } from 'lucide-react'

interface AuditoriumMarkerProps {
  longitude: number
  latitude: number
  name: string
  onClick?: () => void
}

export const AuditoriumMarker = ({ longitude, latitude, name, onClick }: AuditoriumMarkerProps) => {
  return (
    <Marker longitude={longitude} latitude={latitude} onClick={onClick}>
      <div className="relative group">
        <Building2 className="w-6 h-6 text-primary-600" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white rounded shadow-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {name}
        </div>
      </div>
    </Marker>
  )
} 