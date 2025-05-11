import { RouterOutputs } from '@/trpc/clients/types'
import { AlertBox } from '../molecules/AlertBox'
import { ShowScreenShowtimes } from '../templates/ListAuditoriums'

export const AuditoriumInfo = ({
  auditorium,
}: {
  auditorium: RouterOutputs['auditoriums']['auditoriums'][0]
}) => {
  return (
    <div>
      <div className="text-2xl font-semibold">{auditorium.name}</div>
      <div className="text-sm text-gray-600 mt-2">
        Screens: {auditorium.Screens.length}
      </div>
      <div className="flex flex-col gap-4 mt-8">
        {auditorium.Screens.map((screen) => (
          <div key={screen.id}>
            <div className="font-light text-xl ">Screen {screen.number}</div>

            {screen.Showtimes.length === 0 ? (
              <AlertBox className="bg-gray-200">
                <div className="text-gray-600 text-small">No shows found.</div>
              </AlertBox>
            ) : null}
            <ShowScreenShowtimes screenId={screen.id} />
          </div>
        ))}
      </div>
    </div>
  )
}
