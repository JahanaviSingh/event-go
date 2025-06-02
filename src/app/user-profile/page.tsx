'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingHistory } from "@/components/user/BookingHistory"
import { UserPreferences } from "@/components/user/UserPreferences"
import { trpcClient } from "@/trpc/clients/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UserProfilePage() {
  const { data: user } = trpcClient.user.getProfile.useQuery()
  const { data: bookings } = trpcClient.user.getBookings.useQuery()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        <Link href="/account">
          <Button variant="outline">Account Settings</Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Shows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings?.filter(b => new Date(b.Showtime.startTime) > new Date()).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorite Genre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.preferences?.favoriteGenre || 'Not set'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preferred Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.preferences?.preferredLocation || 'Not set'}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
          </CardHeader>
          <CardContent>
            <BookingHistory bookings={bookings} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <UserPreferences user={user} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 