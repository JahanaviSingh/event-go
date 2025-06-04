'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/atoms/button'
import { IconDownload, IconShare, IconTicket } from '@tabler/icons-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Ticket {
  ticketId: number
  qrCode: string
  showTitle: string
  showtime: string
  screenNumber: number
  seats: string[]
  totalAmount: number
  auditorium: {
    name: string
    address?: string
    screenNumber: number
  }
  createdAt: string
}

export default function BookingsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        console.log('=== Starting to fetch tickets ===')

        // First check ticket status
        const checkResponse = await fetch('/api/tickets/check')
        const checkData = await checkResponse.json()
        console.log('=== Ticket Check Response ===')
        console.log('User ID:', checkData.data.userId)
        console.log('Total tickets in system:', checkData.data.totalTickets)
        console.log('User tickets:', checkData.data.userTickets)
        console.log('Ticket details:', checkData.data.tickets)

        // Then fetch the actual tickets
        const response = await fetch('/api/tickets/user')
        console.log('Response status:', response.status)

        if (!response.ok) {
          console.error(
            'Failed to fetch tickets:',
            response.status,
            response.statusText,
          )
          throw new Error('Failed to fetch tickets')
        }

        const data = await response.json()
        console.log('Raw API response:', data)

        if (!data.tickets || !Array.isArray(data.tickets)) {
          console.error('Invalid tickets data received:', data)
          throw new Error('Invalid tickets data')
        }

        console.log('Number of tickets received:', data.tickets.length)
        console.log('Tickets data:', data.tickets)

        setTickets(data.tickets)
      } catch (error) {
        console.error('Error in fetchTickets:', error)
        toast.error('Failed to load tickets')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTickets()
  }, [])

  // Debug logging for tickets state
  useEffect(() => {
    console.log('=== Tickets state updated ===')
    console.log('Number of tickets:', tickets.length)
    console.log('Tickets data:', tickets)
  }, [tickets])

  const handleDownload = (ticket: Ticket) => {
    if (!ticket.qrCode) {
      console.log('No QR code available for ticket:', ticket.ticketId)
      return
    }

    const link = document.createElement('a')
    link.href = ticket.qrCode
    link.download = `ticket-${ticket.ticketId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async (ticket: Ticket) => {
    try {
      if (navigator.share) {
        await navigator
          .share({
            title: `Ticket for ${ticket.showTitle}`,
            text: `I'm going to see ${ticket.showTitle} on ${format(new Date(ticket.showtime), 'PPp')}!`,
            url: window.location.href,
          })
          .catch((error) => {
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

  if (tickets.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <IconTicket className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-semibold mb-4">No Bookings Found</h1>
        <p className="text-gray-600 mb-8">
          You haven't booked any tickets yet.
        </p>
        <Button onClick={() => router.push('/')}>Browse Shows</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">My Bookings</h1>
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.ticketId}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              {/* Ticket Header */}
              <div className="bg-primary text-white p-6">
                <h2 className="text-xl font-bold mb-2">{ticket.showTitle}</h2>
                <p className="text-sm opacity-90">
                  {format(new Date(ticket.showtime), 'PPp')}
                </p>
              </div>

              {/* Ticket Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Venue</span>
                      <span className="font-medium">
                        {ticket.auditorium.name}
                      </span>
                    </div>
                    {ticket.auditorium.address && (
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
                        {ticket.auditorium.screenNumber}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Seats</span>
                      <span className="font-medium">
                        {ticket.seats.join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-medium">₹{ticket.totalAmount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ticket ID</span>
                      <span className="font-medium text-sm">
                        {ticket.ticketId}
                      </span>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center justify-center">
                    {ticket.qrCode ? (
                      <img
                        src={ticket.qrCode}
                        alt="Ticket QR Code"
                        className="w-48 h-48 mb-4"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded mb-4">
                        <p className="text-gray-500 text-sm">
                          QR Code not available
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 w-full">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleDownload(ticket)}
                        disabled={!ticket.qrCode}
                      >
                        <IconDownload className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleShare(ticket)}
                      >
                        <IconShare className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
