'use client'

import { Geist, Geist_Mono, Inter } from 'next/font/google'
import 'maplibre-gl/dist/maplibre-gl.css'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { api } from '@/trpc/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'
import { useState } from 'react'
import { Toaster } from '@/components/molecules/Toaster/toaster'
import { Navbar } from '@/components/organisms/Navbar'
import { Providers } from './providers'
import { Container } from '@/components/atoms/container'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})
const inter = Inter({ subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
        }),
      ],
    }),
  )

  return (
    <ClerkProvider>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <html lang="en">
            <body className={inter.className}>
              <Toaster />
              <Navbar />
              <Providers>
                <Container>{children}</Container>
              </Providers>
            </body>
          </html>
        </QueryClientProvider>
      </api.Provider>
    </ClerkProvider>
  )
}
