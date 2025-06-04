import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/db/prisma'
import { generateQRCode } from '@/util/qr'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 },
      )
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const { userId, bookingInfo } = session.metadata!
      const parsedBookingInfo = JSON.parse(bookingInfo!)

      // Create a ticket record first
      const ticket = await prisma.ticket.create({
        data: {
          uid: userId,
          qrCode: await generateQRCode({
            userId,
            showtimeId: parsedBookingInfo.showtimeId,
            seats: parsedBookingInfo.seats,
            bookingId: `BK${Date.now()}`,
          }),
          status: 'ACTIVE',
        },
      })

      // Create the booking with the ticket reference
      await prisma.booking.create({
        data: {
          userId,
          showtimeId: parsedBookingInfo.showtimeId,
          screenId: parsedBookingInfo.screenId,
          row: parsedBookingInfo.seats[0].row,
          column: parsedBookingInfo.seats[0].column,
          ticketId: ticket.id,
        },
      })

      // Update the seats as booked
      await Promise.all(
        parsedBookingInfo.seats.map((seat: { row: number; column: number }) =>
          prisma.seat.update({
            where: {
              screenId_row_column: {
                screenId: parsedBookingInfo.screenId,
                row: seat.row,
                column: seat.column,
              },
            },
            data: {
              booked: true,
            },
          }),
        ),
      )
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    )
  }
}
