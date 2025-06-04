'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/atoms/button'
import { IconDownload, IconShare } from '@tabler/icons-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Ticket {
  ticketId: string
  showTitle: string
  showtime: string
  screenNumber: number
  seats: string[]
  totalAmount: number
  userId: string
  purchaseDate: string
  auditorium?: {
    name: string
    address?: string
    screenNumber: number
  }
}

interface TicketResponse {
  ticket: Ticket
  qrCode: string
}

export default function TicketsPage() {
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return 'Invalid date'
      }
      return format(date, 'PPp')
    } catch (error) {
      console.error('Date formatting error:', error)
      return 'Invalid date'
    }
  }

  const formatSeats = (seats: string[] | undefined) => {
    if (!seats || !Array.isArray(seats) || seats.length === 0) {
      return 'No seats selected'
    }
    return seats.join(', ')
  }

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        // Get booking data from localStorage
        const bookingData = localStorage.getItem('currentBooking')
        if (!bookingData) {
          toast.error('No booking data found. Please try booking again.')
          router.push('/')
          return
        }

        const booking = JSON.parse(bookingData)
        console.log('Parsed booking data:', booking)

        if (!booking.showTitle || !booking.showtime || !booking.seats) {
          console.error('Invalid booking data:', booking)
          toast.error('Invalid booking data. Please try booking again.')
          router.push('/')
          return
        }

        console.log('Sending ticket generation request with data:', {
          showTitle: booking.showTitle,
          showtime: booking.showtime,
          screenNumber: booking.screenNumber,
          seats: booking.seats,
          totalAmount: booking.totalAmount,
          showtimeId: booking.showtimeId,
          screenId: booking.screenId,
          auditorium: booking.auditorium,
        })

        const response = await fetch('/api/tickets/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            showTitle: booking.showTitle,
            showtime: booking.showtime,
            screenNumber: booking.screenNumber,
            seats: booking.seats,
            totalAmount: booking.totalAmount,
            showtimeId: booking.showtimeId,
            screenId: booking.screenId,
            auditorium: booking.auditorium,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Ticket generation failed:', errorData)
          throw new Error(errorData.details || 'Failed to generate ticket')
        }

        const data: TicketResponse = await response.json()
        console.log('Received ticket data:', data)

        if (!data.ticket || !data.qrCode) {
          console.error('Invalid ticket data received:', data)
          throw new Error('Invalid ticket data')
        }

        setTicket(data.ticket)
        setQrCode(data.qrCode)

        // Clear the booking data from localStorage
        localStorage.removeItem('currentBooking')
      } catch (error) {
        console.error('Error fetching ticket:', error)
        toast.error(
          error instanceof Error ? error.message : 'Failed to load ticket',
        )
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTicket()
  }, [router])

  const handleDownload = () => {
    if (!ticket || !qrCode) return

    const link = document.createElement('a')
    link.href = qrCode
    link.download = `ticket-${ticket.ticketId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    if (!ticket) return

    try {
      if (navigator.share) {
        await navigator
          .share({
            title: `Ticket for ${ticket.showTitle}`,
            text: `I'm going to see ${ticket.showTitle} on ${format(new Date(ticket.showtime), 'PPp')}!`,
            url: window.location.href,
          })
          .catch((error) => {
            // Don't show error for user cancellation
            if (error.name !== 'AbortError') {
              console.error('Error sharing ticket:', error)
              toast.error('Failed to share ticket')
            }
          })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Ticket link copied to clipboard!')
      }
    } catch (error) {
      // Don't show error for user cancellation
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing ticket:', error)
        toast.error('Failed to share ticket')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold mb-4">No Ticket Found</h1>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Ticket Header */}
          <div className="bg-primary text-white p-6">
            <h1 className="text-2xl font-bold mb-2">
              {ticket.showTitle || 'Untitled Show'}
            </h1>
            <p className="text-sm opacity-90">{formatDate(ticket.showtime)}</p>
          </div>

          {/* Ticket Content */}
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Venue</span>
                <span className="font-medium">
                  {ticket.auditorium?.name || 'N/A'}
                </span>
              </div>
              {ticket.auditorium?.address && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Address</span>
                  <span className="font-medium text-right">
                    {ticket.auditorium.address}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Screen</span>
                <span className="font-medium">
                  {ticket.auditorium?.screenNumber ||
                    ticket.screenNumber ||
                    'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Seats</span>
                <span className="font-medium">{formatSeats(ticket.seats)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium">₹{ticket.totalAmount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Ticket ID</span>
                <span className="font-medium text-sm">
                  {ticket.ticketId || 'N/A'}
                </span>
              </div>
            </div>

            {/* QR Code */}
            <div className="mt-8 flex justify-center">
              {qrCode ? (
                <img src={qrCode} alt="Ticket QR Code" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                  <p className="text-gray-500 text-sm">QR Code not available</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownload}
                disabled={!qrCode}
              >
                <IconDownload className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleShare}
                disabled={!ticket}
              >
                <IconShare className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
