import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { type NextRequest } from 'next/server'
import { appRouter } from '@/trpc/server/router'
import { createTRPCContext } from '@/trpc/server'
import { TRPCError } from '@trpc/server'

export const dynamic = 'force-dynamic'

const handler = async (req: NextRequest) => {
  try {
    const response = await fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext: async () => {
        try {
          return await createTRPCContext({ headers: req.headers })
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error
          }
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create context',
          })
        }
      },
      onError({ error }) {
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          cause: error,
        })
      },
      responseMeta() {
        return {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      },
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    const code = error instanceof TRPCError ? error.code : 'INTERNAL_SERVER_ERROR'
    
    return new Response(
      JSON.stringify({
        error: code,
        message,
      }),
      {
        status: code === 'UNAUTHORIZED' ? 401 : 
                code === 'FORBIDDEN' ? 403 : 
                code === 'NOT_FOUND' ? 404 : 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

export { handler as GET, handler as POST }
