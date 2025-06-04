import { initTRPC, TRPCError } from '@trpc/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { type NextRequest } from 'next/server'

type Context = {
  req: NextRequest
}

const t = initTRPC.context<Context>().create()

const isAuthed = t.middleware(async ({ next, ctx }) => {
  try {
    const { userId } = getAuth(ctx.req)

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to access this resource',
      })
    }

    return next({
      ctx: {
        userId,
        db: prisma,
      },
    })
  } catch (error) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication failed',
    })
  }
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthed)
