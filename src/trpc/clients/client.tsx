'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTRPCReact } from '@trpc/react-query'
import { useState } from 'react'
import { httpBatchLink } from '@trpc/client'
import { useAuth } from '@clerk/nextjs'

import { AppRouter } from '../server/router'
import { getUrl } from './shared'

export const trpcClient = createTRPCReact<AppRouter>()

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const { getToken } = useAuth()
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        retryOnMount: true,
      },
    },
  }))

  const [trpc] = useState(() =>
    trpcClient.createClient({
      links: [
        httpBatchLink({
          url: getUrl(),
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'include',
              headers: {
                ...options?.headers,
                'Content-Type': 'application/json',
              },
            }).then(async (res) => {
              if (!res.ok) {
                const text = await res.text()
                let errorMessage = `HTTP error ${res.status}`
                try {
                  const json = JSON.parse(text)
                  errorMessage = json.message || errorMessage
                } catch {
                  // If parsing fails, use the raw text
                  errorMessage = text || errorMessage
                }
                throw new Error(errorMessage)
              }
              return res
            })
          },
          async headers() {
            try {
              const token = await getToken()
              return {
                Authorization: token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
              }
            } catch {
              return {
                'Content-Type': 'application/json',
              }
            }
          },
        }),
      ],
    }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <trpcClient.Provider client={trpc} queryClient={queryClient}>
        {props.children}
      </trpcClient.Provider>
    </QueryClientProvider>
  )
}
