import { loadStripe } from '@stripe/stripe-js'
import { useAppDispatch, useAppSelector } from '@/store'
import { Square, StaightMovieScreen } from '@/components/organisms/ScreenUtils'
import { LoaderPanel } from '@/components/molecules/Loader'
import { addSeat, resetSeats, resetShows } from '@/store/shows/store'
import { SeatNumber } from '@/components/molecules/SeatNumber'
import { Success } from '../SearchAuditorium'
import { Button } from '@/components/atoms/button'
import { notification$ } from '@/lib/subjects'
import { RootState } from '@/store'
import { StripeItemType } from '@/types'
import Link from 'next/link'

interface Seat {
  row: number
  column: number
  price: number
  booked?: boolean
}

interface SelectedSeat {
  row: number
  column: number
}

export const SelectSeats = () => {
  const dispatch = useAppDispatch()
  const selectedSeats = useAppSelector(
    (state: RootState) => state.shows.selectedSeats,
  )
  const showtimeId = useAppSelector(
    (state: RootState) => state.shows.selectedShowtimeId,
  )
  const isAuthenticated = useAppSelector(
    (state: RootState) => state.user.isAuthenticated,
  )
  const selectedScreenId = useAppSelector(
    (state: RootState) => state.shows.selectedScreenId,
  )

  if (!showtimeId) return null

  const handleSeatClick = (row: number, column: number) => {
    dispatch(addSeat({ row, column }))
  }

  // Group seats by row for display
  const rows = selectedSeats.reduce(
    (acc: Record<string, Seat[]>, seat: SelectedSeat) => {
      const rowKey = seat.row.toString()
      if (!acc[rowKey]) {
        acc[rowKey] = []
      }
      acc[rowKey].push({
        row: seat.row,
        column: seat.column,
        price: 0, // This should come from your showtime data
      })
      return acc
    },
    {},
  )

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-center overflow-x-auto">
        <div>
          {(Object.entries(rows) as [string, Seat[]][]).map(
            ([rowNumber, seatsInRow]) => (
              <div key={rowNumber} className="flex gap-1 mt-1">
                {seatsInRow.map((seat: Seat) => (
                  <button
                    key={`${seat.row}-${seat.column}`}
                    className={`w-8 h-8 rounded ${
                      selectedSeats.some(
                        (s: SelectedSeat) =>
                          s.row === seat.row && s.column === seat.column,
                      )
                        ? 'bg-primary'
                        : 'bg-gray-200'
                    }`}
                    disabled={Boolean(seat?.booked)}
                    onClick={() => handleSeatClick(seat.row, seat.column)}
                  >
                    <SeatNumber number={seat.column} />
                  </button>
                ))}
              </div>
            ),
          )}
        </div>
      </div>

      <div className="py-4">
        <div className="text-lg font-light">
          Selected seats: {selectedSeats.length}
        </div>

        {selectedSeats.length ? (
          <Button
            onClick={() => {
              if (!selectedScreenId) {
                notification$.next({
                  message: 'Something went wrong.',
                  type: 'error',
                })
                return
              }
              if (!isAuthenticated) {
                notification$.next({
                  message: 'You are not logged in.',
                  type: 'error',
                })
                return
              }
              // Handle booking creation
              dispatch(resetSeats())
            }}
            disabled={!isAuthenticated}
          >
            Create booking
          </Button>
        ) : null}

        {!isAuthenticated ? <Link href="/login">Login to continue</Link> : null}
      </div>
    </div>
  )
}

export const createPaymentSession = async (
  uid: string,
  bookingInfo: StripeItemType,
) => {
  const checkoutSession = await axios.post(
    process.env.NEXT_PUBLIC_API_URL + '/stripe',
    {
      bookingInfo,
      uid,
    },
  )

  console.log('checkoutSession', checkoutSession)

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  const stripePromise = loadStripe(publishableKey || '')
  const stripe = await stripePromise
  const result = await stripe?.redirectToCheckout({
    sessionId: checkoutSession.data.sessionId,
  })

  return result
}
