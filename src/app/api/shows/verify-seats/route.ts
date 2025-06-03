import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { showtimeId, seats } = body

    if (!showtimeId || !seats || !Array.isArray(seats)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Check if any of the seats are already booked
    const existingBookings = await prisma.booking.findMany({
      where: {
        showtimeId,
        OR: seats.map(seat => ({
          AND: {
            row: seat.row,
            column: seat.column
          }
        }))
      }
    })

    if (existingBookings.length > 0) {
      // Return which specific seats are unavailable
      const unavailableSeats = existingBookings.map(booking => ({
        row: booking.row,
        column: booking.column
      }))

      return NextResponse.json({
        available: false,
        unavailableSeats
      })
    }

    return NextResponse.json({
      available: true
    })
  } catch (error) {
    console.error('Error verifying seats:', error)
    return NextResponse.json(
      { error: 'Failed to verify seats' },
      { status: 500 }
    )
  }
} 