'use client'

import { useAppDispatch, useAppSelector } from '@/store'
import { trpcClient } from '@/trpc/clients/client'
import { LoaderPanel } from '@/components/molecules/Loader'
import { Button } from '@/components/atoms/button'
import { useToast } from '@/components/molecules/Toaster/use-toast'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { IconArmchair } from '@tabler/icons-react'
import { useState } from 'react'

export const BookingPage = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { toast } = useToast()
  const [isBooking, setIsBooking] = useState(false)

  const selectedShowtimeId = useAppSelector(
    (state) => state.shows.selectedShowtimeId,
  )
  const selectedSeats = useAppSelector((state) => state.shows.selectedSeats)

  const { data: showtimeData, isLoading } = trpcClient.showtimes.seats.useQuery(
    { showtimeId: selectedShowtimeId! },
    { enabled: !!selectedShowtimeId },
  )

  if (!selectedShowtimeId) {
    router.push('/')
    return null
  }

  if (isLoading) return <LoaderPanel />

  const { seats, price } = showtimeData || { seats: [], price: 0 }
  const totalPrice = selectedSeats.length * price

  const handleSeatClick = (row: number, column: number) => {
    const seat = seats.find((s) => s.row === row && s.column === column)
    if (seat?.booked) return

    const isSelected = selectedSeats.some(
      (s) => s.row === row && s.column === column,
    )
    if (isSelected) {
      dispatch({ type: 'shows/removeSeat', payload: { row, column } })
    } else {
      dispatch({ type: 'shows/addSeat', payload: { row, column } })
    }
  }

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      toast({
        title: 'No seats selected',
        description: 'Please select at least one seat to proceed',
        variant: 'destructive',
      })
      return
    }

    setIsBooking(true)
    try {
      // Create booking
      const booking = await trpcClient.bookings.create.mutate({
        showtimeId: selectedShowtimeId,
        seats: selectedSeats,
      })

      toast({
        title: 'Booking successful!',
        description: 'Your tickets have been booked',
      })

      // Redirect to tickets page
      router.push('/tickets')
    } catch (error) {
      toast({
        title: 'Booking failed',
        description:
          error instanceof Error ? error.message : 'Failed to create booking',
        variant: 'destructive',
      })
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Select Your Seats</h1>
        <div className="text-gray-600">
          <p>
            Showtime:{' '}
            {format(new Date(showtimeData?.showtime.startTime || ''), 'PPp')}
          </p>
          <p>Price per seat: ₹{price}</p>
        </div>
      </div>

      {/* Screen */}
      <div className="mb-8">
        <div className="w-full h-4 bg-gray-200 rounded-t-lg mb-4" />
        <div className="text-center text-sm text-gray-600">Screen</div>
      </div>

      {/* Seat Layout */}
      <div className="grid grid-cols-10 gap-2 mb-8">
        {seats.map((seat) => (
          <button
            key={`${seat.row}-${seat.column}`}
            onClick={() => handleSeatClick(seat.row, seat.column)}
            disabled={seat.booked}
            className={`
              w-8 h-8 rounded flex items-center justify-center text-sm
              ${
                seat.booked
                  ? 'bg-gray-300 cursor-not-allowed'
                  : selectedSeats.some(
                        (s) => s.row === seat.row && s.column === seat.column,
                      )
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
              }
            `}
          >
            {seat.column}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded" />
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary rounded" />
          <span className="text-sm">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 rounded" />
          <span className="text-sm">Booked</span>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8">
        <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Selected Seats:</span>
            <span>
              {selectedSeats.length} <IconArmchair className="inline w-4 h-4" />
            </span>
          </div>
          <div className="flex justify-between">
            <span>Price per seat:</span>
            <span>₹{price}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>₹{totalPrice}</span>
          </div>
        </div>
      </div>

      {/* Book Button */}
      <Button
        onClick={handleBooking}
        disabled={selectedSeats.length === 0 || isBooking}
        className="w-full"
      >
        {isBooking ? 'Processing...' : 'Book Now'}
      </Button>
    </div>
  )
}
