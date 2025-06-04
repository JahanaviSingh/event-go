'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { trpcClient } from '@/trpc/clients/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, MapPin, Ticket, User } from 'lucide-react'
import { format } from 'date-fns'
import { PreferencesForm } from '@/components/user/PreferencesForm'
import { BookingsList } from '@/components/user/BookingsList'

export default function UserProfilePage() {
  const { data: user } = trpcClient.user.getProfile.useQuery()

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">User Profile</h1>
      <div className="grid gap-8 md:grid-cols-2">
        <PreferencesForm />
        <BookingsList />
      </div>
    </div>
  )
}
