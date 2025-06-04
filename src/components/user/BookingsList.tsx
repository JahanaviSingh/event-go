'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/trpc/react'
import { format, isAfter, isBefore, startOfDay } from 'date-fns'
import { Calendar, Clock, MapPin, Ticket } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function BookingsList() {
  const { data: bookings, isLoading } = api.user.getBookings.useQuery()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading bookings...</p>
        </CardContent>
      </Card>
    )
  }

  if (!bookings?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No bookings found.</p>
        </CardContent>
      </Card>
    )
  }

  const today = startOfDay(new Date())
  const upcomingBookings = bookings.filter((booking) =>
    isAfter(new Date(booking.showtime.startTime), today),
  )
  const pastBookings = bookings.filter((booking) =>
    isBefore(new Date(booking.showtime.startTime), today),
  )

  const BookingCard = ({ booking }: { booking: (typeof bookings)[0] }) => (
    <div
      key={booking.id}
      className="flex flex-col space-y-2 rounded-lg border p-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{booking.showtime.show.name}</h3>
          <p className="text-sm text-muted-foreground">
            {booking.showtime.screen.auditorium.name}
          </p>
        </div>
        <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
          {booking.status}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {format(new Date(booking.showtime.startTime), 'MMM d, yyyy')}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(booking.showtime.startTime), 'h:mm a')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{booking.showtime.screen.auditorium.location}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Ticket className="h-4 w-4 text-muted-foreground" />
          <span>{booking.seatNumber}</span>
        </div>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming bookings.
              </p>
            ) : (
              upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>
          <TabsContent value="past" className="space-y-4">
            {pastBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No past bookings.</p>
            ) : (
              pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>
          <TabsContent value="all" className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
