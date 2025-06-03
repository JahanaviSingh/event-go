import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'

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
    const { 
      showTitle, 
      showtime, 
      screenNumber, 
      seats, 
      totalAmount,
      showtimeId,
      screenId,
      auditorium
    } = body

    // Generate a unique ticket ID
    const ticketId = `TKT-${uuidv4().slice(0, 8).toUpperCase()}`

    // Generate QR code
    const qrCode = await QRCode.toDataURL(JSON.stringify({
      userId,
      showtimeId,
      seats,
      bookingId: `BK${Date.now()}`,
      ticketId
    }))

    // Create ticket with only the required fields
    const ticket = await prisma.ticket.create({
      data: {
        uid: userId,
        qrCode
      }
    })

    // Return ticket data with additional info from the request
    return NextResponse.json({
      ticket: {
        ...ticket,
        ticketId,
        showTitle,
        showtime,
        screenNumber,
        seats,
        totalAmount,
        showtimeId,
        screenId,
        auditorium
      },
      qrCode
    })
  } catch (error) {
    console.error('Error generating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to generate ticket' },
      { status: 500 }
    )
  }
} 