'use client'

import { BookingPage } from '@/components/templates/BookingPage'
import { useAppSelector } from '@/store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Booking() {
  const router = useRouter()
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=/booking')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return <BookingPage />
} 