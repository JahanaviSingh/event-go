import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check all tickets in the database
    const allTickets = await prisma.ticket.findMany({
      include: {
        Bookings: {
          include: {
            Showtime: {
              include: {
                Show: true,
                Screen: {
                  include: {
                    Auditorium: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // Check tickets for the current user
    const userTickets = await prisma.ticket.findMany({
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
                    Auditorium: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      status: 'success',
      data: {
        userId,
        totalTickets: allTickets.length,
        userTickets: userTickets.length,
        tickets: userTickets.map((ticket) => ({
          id: ticket.id,
          uid: ticket.uid,
          createdAt: ticket.createdAt,
          bookingsCount: ticket.Bookings.length,
          showTitle: ticket.Bookings[0]?.Showtime?.Show?.title,
          showtime: ticket.Bookings[0]?.Showtime?.startTime,
          screenNumber: ticket.Bookings[0]?.Showtime?.Screen?.number,
          auditoriumName:
            ticket.Bookings[0]?.Showtime?.Screen?.Auditorium?.name,
        })),
      },
    })
  } catch (error) {
    console.error('Error checking tickets:', error)
    return NextResponse.json(
      { error: 'Failed to check tickets' },
      { status: 500 },
    )
  }
}
