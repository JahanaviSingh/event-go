import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'

export async function POST(request: Request) {
  console.log('Received request to mark seats as booked')

  try {
    const { userId } = getAuth(request)
    console.log('Auth check:', { userId })

    if (!userId) {
      console.log('No user ID found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', body)

    const { showtimeId, seats } = body

    if (!showtimeId || !seats || !Array.isArray(seats)) {
      console.log('Invalid request data:', { showtimeId, seats })
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 },
      )
    }

    // Get the showtime to get the screenId and include auditorium info
    const showtime = await prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: {
        Screen: {
          include: {
            Auditorium: true,
          },
        },
        Show: true,
      },
    })

    if (!showtime) {
      return NextResponse.json({ error: 'Showtime not found' }, { status: 404 })
    }

    // Check if seats are already booked
    const existingBookings = await prisma.booking.findMany({
      where: {
        showtimeId,
        OR: seats.map((seat) => ({
          AND: {
            row: seat.row,
            column: seat.column,
            screenId: showtime.screenId,
          },
        })),
      },
    })

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { error: 'Some seats are already booked' },
        { status: 400 },
      )
    }

    // Create a ticket first
    const ticket = await prisma.ticket.create({
      data: {
        uid: userId,
        qrCode: await QRCode.toDataURL(
          JSON.stringify({
            userId,
            showtimeId,
            seats,
            bookingId: `BK${Date.now()}`,
          }),
        ),
      },
    })

    // Create bookings for each seat
    const bookings = await Promise.all(
      seats.map((seat) =>
        prisma.booking.create({
          data: {
            userId,
            showtimeId,
            screenId: showtime.screenId,
            row: seat.row,
            column: seat.column,
            ticketId: ticket.id,
          },
        }),
      ),
    )

    console.log('Created bookings:', bookings)

    return NextResponse.json({
      success: true,
      bookingId: bookings[0].id,
      ticketId: ticket.id,
      auditorium: {
        name: showtime.Screen.Auditorium.name,
        address: showtime.Screen.Auditorium.Address?.address,
        screenNumber: showtime.Screen.number,
      },
    })
  } catch (error) {
    console.error('Error marking seats as booked:', error)
    // Log the full error details
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
    }
    return NextResponse.json(
      {
        error: 'Failed to mark seats as booked',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
