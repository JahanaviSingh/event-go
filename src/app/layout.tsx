import type { Metadata } from 'next'
import { Geist, Geist_Mono, Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { TRPCReactProvider } from '../trpc/clients/client'
import { Container } from '@/components/atoms/container'
import { Navbar } from '@/components/organisms/Navbar'
import { Toaster } from '@/components/molecules/Toaster/toaster'
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})
const inter = Inter({ subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Event-go',
  description: 'Event-go is a platform for hosting and attending events.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <TRPCReactProvider>
        <html lang="en">
          <body className={inter.className}>
            <Toaster />
            <Navbar />
            <Container>{children}</Container>
          </body>
        </html>
      </TRPCReactProvider>
    </ClerkProvider>
  )
}