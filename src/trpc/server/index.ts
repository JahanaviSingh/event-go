import { auth } from '@clerk/nextjs/server'
import { initTRPC, TRPCError } from '@trpc/server'
import { prisma } from '@/db/prisma'
import { Role } from '../../util/types'
import { authorizeUser } from './util'

export const createTRPCContext = async (opts: { headers: Headers }) => {
  try {
    const session = await auth()
    if (!session) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'No session found',
      })
    }
    return {
      db: prisma,
      session,
      ...opts,
    }
  } catch (error) {
    console.error('Failed to create TRPC context:', error)
    if (error instanceof TRPCError) {
      throw error
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to initialize context',
    })
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create()

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

const isAuthed = t.middleware(async ({ ctx, next }) => {
  try {
    if (!ctx.session) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'No session found',
      })
    }

    if (!ctx.session.userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User is not authenticated',
      })
    }

    return next({
      ctx: {
        ...ctx,
        userId: ctx.session.userId,
      },
    })
  } catch (error) {
    console.error('Authentication error:', error)
    if (error instanceof TRPCError) {
      throw error
    }
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication failed',
    })
  }
})

export const protectedProcedure = (...roles: Role[]) => {
  const procedure = t.procedure.use(isAuthed)
  
  if (roles.length > 0) {
    return procedure.use(async ({ ctx, next }) => {
      try {
        await authorizeUser(ctx.userId, roles)
        return next()
      } catch (error) {
        console.error('Authorization error:', error)
        if (error instanceof TRPCError) {
          throw error
        }
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Authorization failed',
        })
      }
    })
  }
  
  return procedure
}
