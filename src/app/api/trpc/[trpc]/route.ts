import { initTRPC } from '@trpc/server'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { type NextRequest } from 'next/server'
import { appRouter } from '@/trpc/server/router'

const createContext = async (req: NextRequest) => {
  const headers = req.headers
  const session = await auth()

  return {
    headers,
    db: prisma,
    session,
  }
}

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(req),
  })

export { handler as GET, handler as POST }
function auth() {
  throw new Error('Function not implemented.')
}
