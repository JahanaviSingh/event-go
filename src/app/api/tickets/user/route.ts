import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      console.log('=== No userId found in request ===')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('=== Fetching tickets for userId:', userId, '===')

    // First, let's check if the specific ticket exists
    const specificTicket = await prisma.ticket.findFirst({
      where: {
        id: 23, // The latest ticket ID from your logs
      },
      include: {
        Bookings: true,
      },
    })

    console.log('=== Specific ticket check ===')
    console.log('Ticket found:', specificTicket ? 'Yes' : 'No')
    if (specificTicket) {
      console.log('Ticket details:', {
        id: specificTicket.id,
        uid: specificTicket.uid,
        bookingsCount: specificTicket.Bookings.length,
        createdAt: specificTicket.createdAt,
      })
    }

    // Now fetch all tickets for the user
    const tickets = await prisma.ticket.findMany({
      where: {
        uid: userId,
      },
      include: {
        Bookings: {
          include: {
            Showtime: {
              include: {
                Show: true,
                Screen: {
                  include: {
                    Auditorium: {
                      include: {
                        Address: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    console.log('=== Found tickets ===')
    console.log('Number of tickets:', tickets.length)
    console.log(
      'Ticket IDs:',
      tickets.map((t) => t.id),
    )

    if (tickets.length === 0) {
      console.log('No tickets found for user')
      return NextResponse.json({ tickets: [] })
    }

    // Transform the data to include all necessary information
    const formattedTickets = tickets
      .map((ticket) => {
        console.log('=== Processing ticket:', ticket.id, '===')
        const booking = ticket.Bookings[0] // Get the first booking (they should all be for the same showtime)
        if (!booking) {
          console.log('No booking found for ticket:', ticket.id)
          return null
        }

        const showtime = booking.Showtime
        const show = showtime.Show
        const screen = showtime.Screen
        const auditorium = screen.Auditorium

        if (!show || !screen || !auditorium) {
          console.log('Missing required data for ticket:', ticket.id)
          return null
        }

        const formattedTicket = {
          ticketId: ticket.id,
          qrCode: ticket.qrCode,
          showTitle: show.title,
          showtime: showtime.startTime,
          screenNumber: screen.number,
          seats: ticket.Bookings.map(
            (b) => `${String.fromCharCode(65 + b.row - 1)}${b.column}`,
          ),
          totalAmount: ticket.Bookings.length * screen.price,
          auditorium: {
            name: auditorium.name,
            address: auditorium.Address?.address,
            screenNumber: screen.number,
          },
          createdAt: ticket.createdAt,
        }

        console.log('Formatted ticket:', formattedTicket)
        return formattedTicket
      })
      .filter(Boolean) // Remove any null entries

    console.log('=== Returning formatted tickets ===')
    console.log('Number of formatted tickets:', formattedTickets.length)

    return NextResponse.json({ tickets: formattedTickets })
  } catch (error) {
    console.error('=== Error fetching user tickets ===')
    console.error('Error details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 },
    )
  }
}
