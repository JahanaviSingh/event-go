'use client'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { trpcClient } from '@/trpc/clients/client'
import { LoaderPanel } from '@/components/molecules/Loader'
import { Button } from '@/components/atoms/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { IconArmchair, IconX, IconCreditCard, IconReceipt } from '@tabler/icons-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAuth } from '@clerk/nextjs'
import { useDispatch } from 'react-redux'
import { setBookingInfo } from '@/store/booking/store'

// Seat comments for different sections
const seatComments = {
  lastRow: [
    'Last row? You must be a fan of the nosebleed section!',
    'In the last row, you can always spot the latecomers!',
    'Last row seats: where you can watch the movie and the audience at the same time!',
  ],
  firstRow: [
    "First row seats: for those who don't mind looking up!",
    "Sitting in the front row? Don't forget your neck pillow!",
    'First row: where you can count the pixels on the screen!',
  ],
  middle: [
    'Middle seats: the Goldilocks zone of the cinema!',
    'Sitting in the middle? You must be a fan of balance!',
    'Middle seats: where you can be at the center of the action!',
  ],
  corner: [
    'Corner seats: perfect for those who like their personal space!',
    'The corner: where you can enjoy the show from a unique angle!',
    'Corner seats: great for people watching and movie watching!',
  ],
}

// Get random comment for a section
const getRandomComment = (section: keyof typeof seatComments) => {
  const comments = seatComments[section]
  return comments[Math.floor(Math.random() * comments.length)]
}

// Get seat section based on position
const getSeatSection = (row: number, column: number, totalRows: number, totalColumns: number) => {
  if (row === 1) return 'firstRow'
  if (row === totalRows) return 'lastRow'
  if (row === Math.floor(totalRows / 2)) return 'middle'
  if (column === 1 || column === totalColumns || column === 2 || column === totalColumns - 1) return 'corner'
  return 'default'
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function SeatLayoutPage({ params }: { params: { id: string } }) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [isBooking, setIsBooking] = useState(false)
  const [selectedSection, setSelectedSection] = useState<keyof typeof seatComments | null>(null)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const { isSignedIn } = useAuth()
  const { isLoading } = useAppSelector((state) => state.shows)

  const selectedShowtimeId = useAppSelector((state) => state.shows.selectedShowtimeId)
  const selectedSeats = useAppSelector((state) => state.shows.selectedSeats)

  useEffect(() => {
    if (!selectedShowtimeId) {
      router.push('/')
    }
  }, [selectedShowtimeId, router])

  const { data: showtimeData, isLoading: showtimeDataLoading } = trpcClient.showtimes.seats.useQuery(
    { showtimeId: selectedShowtimeId ?? 0 },
    {
      enabled: !!selectedShowtimeId,
    }
  )

  const { data: showtimeInfo } = trpcClient.showtimes.showtimes.useQuery(
    {
      where: {
        id: selectedShowtimeId ?? 0
      }
    },
    {
      enabled: !!selectedShowtimeId,
      select: (data) => data[0]
    }
  )

  if (showtimeDataLoading || !showtimeData || !showtimeInfo) {
    return <LoaderPanel />
  }

  const handleSeatClick = (row: number, column: number) => {
    const seat = showtimeData.seats.find(
      (s) => s.row === row && s.column === column
    )
    if (!seat) return

    if (seat.booked) {
      toast.error('This seat is already booked')
      return
    }

    const isSelected = selectedSeats.some(
      (s) => s.row === row && s.column === column
    )

    if (isSelected) {
      dispatch({ type: 'shows/removeSeat', payload: { row, column } })
    } else {
      dispatch({ type: 'shows/addSeat', payload: { row, column } })
    }

    // Update selected section and show comment
    const section = getSeatSection(row, column, Math.max(...showtimeData.seats.map(s => s.row)), Math.max(...showtimeData.seats.map(s => s.column)))
    setSelectedSection(section)
    if (section !== 'default') {
      toast.info(getRandomComment(section))
    }
  }

  const handleProceedToBooking = async () => {
    if (!isSignedIn) {
      toast.error('Please sign in to proceed with booking')
      router.push('/sign-in')
      return
    }

    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat')
      return
    }

    setShowBookingDialog(true)
  }

  const handleBooking = async () => {
    if (!selectedShowtimeId || !showtimeData) {
      console.error('Missing required data:', { selectedShowtimeId, showtimeData })
      return
    }

    setIsBooking(true)
    try {
      // First, verify seats are still available
      const verifyResponse = await fetch('/api/shows/verify-seats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          showtimeId: selectedShowtimeId,
          seats: selectedSeats.map(seat => ({
            row: seat.row,
            column: seat.column,
          })),
        }),
      })

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json()
        throw new Error(errorData.error || 'Failed to verify seats')
      }

      const verifyData = await verifyResponse.json()
      if (!verifyData.available) {
        // Refresh the seat data and show which seats are no longer available
        const unavailableSeats = verifyData.unavailableSeats || []
        const seatLabels = unavailableSeats.map(seat => 
          `${String.fromCharCode(65 + seat.row - 1)}${seat.column}`
        ).join(', ')
        
        toast.error(`Seats ${seatLabels} are no longer available. Please select different seats.`)
        // Refresh the page to show updated seat availability
        window.location.reload()
        return
      }

      // Save booking data to localStorage
      const bookingData = {
        showTitle: showtimeInfo?.Show.title,
        showtime: showtimeInfo?.startTime,
        screenNumber: showtimeInfo?.Screen.number,
        seats: selectedSeats.map(seat => 
          `${String.fromCharCode(65 + seat.row - 1)}${seat.column}`
        ),
        totalAmount: totalAmount + Math.round(totalAmount * 0.05) + Math.round(totalAmount * 0.18),
        showtimeId: selectedShowtimeId,
        screenId: showtimeData.seats[0].screenId,
        auditorium: {
          name: showtimeInfo?.Screen.Auditorium.name,
          address: showtimeInfo?.Screen.Auditorium.Address?.address,
          screenNumber: showtimeInfo?.Screen.number
        }
      }
      
      console.log('Saving booking data:', bookingData)
      
      // Ensure booking data is saved before proceeding
      localStorage.setItem('currentBooking', JSON.stringify(bookingData))
      
      // Verify the data was saved
      const savedData = localStorage.getItem('currentBooking')
      if (!savedData) {
        throw new Error('Failed to save booking data')
      }

      console.log('Preparing to mark seats as booked:', {
        showtimeId: selectedShowtimeId,
        seats: selectedSeats
      })

      // Mark seats as booked in the database
      const markSeatsResponse = await fetch('/api/shows/mark-seats-booked', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          showtimeId: selectedShowtimeId,
          seats: selectedSeats.map(seat => ({
            row: seat.row,
            column: seat.column,
          })),
        }),
      })

      console.log('Mark seats response status:', markSeatsResponse.status)
      const responseData = await markSeatsResponse.json()
      console.log('Mark seats response data:', responseData)

      if (!markSeatsResponse.ok) {
        throw new Error(responseData.error || 'Failed to mark seats as booked')
      }

      if (!responseData.success) {
        throw new Error('Booking was not successful')
      }

      toast.success('Booking successful!')
      // Add a small delay to ensure localStorage is updated
      setTimeout(() => {
        router.push('/tickets')
      }, 100)
    } catch (error) {
      console.error('Booking failed:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to complete booking')
      // Clear any partial booking data
      localStorage.removeItem('currentBooking')
    } finally {
      setIsBooking(false)
      setShowBookingDialog(false)
    }
  }

  // Group seats by row
  const seatsByRow = showtimeData.seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = []
    }
    acc[seat.row].push(seat)
    return acc
  }, {} as Record<number, typeof showtimeData.seats>)

  const totalAmount = selectedSeats.length * (showtimeData.price ?? 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{showtimeInfo.Show.title}</h1>
              <p className="text-sm text-gray-600">
                {format(new Date(showtimeInfo.startTime), 'PPp')}
              </p>
            </div>
            <Button variant="ghost" onClick={() => router.back()}>
              <IconX className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Screen */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="w-full h-4 bg-gray-200 rounded-t-lg mb-8"></div>
            <div className="text-center text-gray-600 mb-8">Screen</div>

            {/* Seats */}
            <div className="space-y-4">
              {Object.entries(seatsByRow).map(([row, seats]) => (
                <div key={row} className="flex justify-center gap-2">
                  <div className="w-8 text-center text-gray-600">
                    {String.fromCharCode(65 + parseInt(row) - 1)}
                  </div>
                  <div className="flex gap-2">
                    {seats.map((seat) => {
                      const isSelected = selectedSeats.some(
                        (s) => s.row === seat.row && s.column === seat.column
                      )
                      const section = getSeatSection(
                        seat.row,
                        seat.column,
                        Math.max(...showtimeData.seats.map(s => s.row)),
                        Math.max(...showtimeData.seats.map(s => s.column))
                      )
                      return (
                        <button
                          key={`${seat.row}-${seat.column}`}
                          onClick={() => handleSeatClick(seat.row, seat.column)}
                          disabled={seat.booked}
                          className={cn(
                            'w-8 h-8 rounded flex items-center justify-center text-sm transition-colors relative group',
                            seat.booked
                              ? 'bg-gray-300 cursor-not-allowed'
                              : isSelected
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 hover:bg-gray-200',
                            section !== 'default' && 'ring-2 ring-offset-2',
                            section === 'firstRow' && 'ring-yellow-400',
                            section === 'lastRow' && 'ring-blue-400',
                            section === 'middle' && 'ring-green-400',
                            section === 'corner' && 'ring-purple-400'
                          )}
                        >
                          {seat.column}
                          {section !== 'default' && (
                            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {section.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-8 mt-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span className="text-sm text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded"></div>
                <span className="text-sm text-gray-600">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span className="text-sm text-gray-600">Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded ring-2 ring-yellow-400"></div>
                <span className="text-sm text-gray-600">First Row</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded ring-2 ring-blue-400"></div>
                <span className="text-sm text-gray-600">Last Row</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded ring-2 ring-green-400"></div>
                <span className="text-sm text-gray-600">Middle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded ring-2 ring-purple-400"></div>
                <span className="text-sm text-gray-600">Corner</span>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Selected Seats</span>
                <span>
                  {selectedSeats.map(seat => 
                    `${String.fromCharCode(65 + seat.row - 1)}${seat.column}`
                  ).join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price per Seat</span>
                <span>₹{showtimeData.price}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total Amount</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
            <Button
              className="w-full mt-6"
              onClick={handleProceedToBooking}
              disabled={selectedSeats.length === 0 || isBooking}
            >
              {isBooking ? 'Processing...' : 'Proceed to Booking'}
            </Button>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Summary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Movie Details */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{showtimeInfo?.Show.title}</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{format(new Date(showtimeInfo?.startTime ?? ''), 'PPp')}</p>
                <p>Screen {showtimeInfo?.Screen.number}</p>
              </div>
            </div>
            <Separator />
            
            {/* Seat Details */}
            <div className="space-y-2">
              <h4 className="font-medium">Selected Seats</h4>
              <div className="bg-gray-50 p-3 rounded-md">
                {selectedSeats.map(seat => (
                  <div key={`${seat.row}-${seat.column}`} className="flex justify-between text-sm">
                    <span>Seat {String.fromCharCode(65 + seat.row - 1)}{seat.column}</span>
                    <span>₹{showtimeData.price}</span>
                  </div>
                ))}
              </div>
            </div>
            <Separator />

            {/* Bill Breakdown */}
            <div className="space-y-2">
              <h4 className="font-medium">Bill Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Convenience Fee</span>
                  <span>₹{Math.round(totalAmount * 0.05)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%)</span>
                  <span>₹{Math.round(totalAmount * 0.18)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total Amount</span>
                  <span>₹{totalAmount + Math.round(totalAmount * 0.05) + Math.round(totalAmount * 0.18)}</span>
                </div>
              </div>
            </div>

            {/* Booking Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowBookingDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleBooking}
                disabled={isBooking}
              >
                {isBooking ? 'Processing...' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 