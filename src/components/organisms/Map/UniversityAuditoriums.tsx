import { useState } from 'react'
import { trpcClient } from '@/trpc/clients/client'
import { Marker } from '@vis.gl/react-maplibre'
import { IconSchool, IconBuildingEstate } from '@tabler/icons-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../atoms/Dialog'
import { Input } from '../../atoms/input'
import { Loader } from '../../molecules/Loader'

export const UniversityAuditoriums = () => {
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [name, setName] = useState('')
  const [selectedUniversity, setSelectedUniversity] = useState<any>(null)

  const { data: universities, isLoading } = trpcClient.geocoding.searchUniversities.useQuery(
    { city, state, name },
    {
      enabled: true,
      onError: (error) => {
        console.error('Error fetching universities:', error)
      },
    }
  )

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Input
          placeholder="Search university name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full"
        />
        <div className="flex gap-2">
          <Input
            placeholder="Filter by city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-40"
          />
          <Input
            placeholder="Filter by state..."
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {/* University Markers */}
      {universities?.map((university) => (
        <Marker
          key={university.id}
          longitude={university.lng}
          latitude={university.lat}
          onClick={() => setSelectedUniversity(university)}
        >
          <div className="relative">
            <IconSchool className="w-8 h-8 text-blue-500" />
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full" />
          </div>
        </Marker>
      ))}

      {/* Auditorium Markers */}
      {selectedUniversity?.auditoriums.map((auditorium) => (
        <Marker
          key={auditorium.id}
          longitude={auditorium.lng}
          latitude={auditorium.lat}
          onClick={() => setSelectedAuditorium(auditorium)}
        >
          <div className="relative">
            <IconBuildingEstate className="w-6 h-6 text-pink-500" />
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-pink-500 rounded-full" />
          </div>
        </Marker>
      ))}

      {/* University Details Dialog */}
      <Dialog open={!!selectedUniversity} onOpenChange={() => setSelectedUniversity(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUniversity?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Address</h3>
              <p className="text-sm text-gray-600">{selectedUniversity?.address}</p>
            </div>
            <div>
              <h3 className="font-semibold">Location</h3>
              <p className="text-sm text-gray-600">
                {selectedUniversity?.city}, {selectedUniversity?.state}
              </p>
            </div>
            {selectedUniversity?.website && (
              <div>
                <h3 className="font-semibold">Website</h3>
                <a
                  href={selectedUniversity.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  {selectedUniversity.website}
                </a>
              </div>
            )}
            <div>
              <h3 className="font-semibold">Nearby Auditoriums</h3>
              {selectedUniversity?.auditoriums.length === 0 ? (
                <p className="text-sm text-gray-600">No auditoriums found nearby</p>
              ) : (
                <ul className="space-y-2">
                  {selectedUniversity?.auditoriums.map((auditorium: any) => (
                    <li key={auditorium.id} className="text-sm">
                      <div className="font-medium">{auditorium.name}</div>
                      <div className="text-gray-600">{auditorium.address}</div>
                      <div className="text-gray-500 text-xs">Type: {auditorium.type}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 