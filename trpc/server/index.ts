import { auth } from '@clerk/nextjs/server'
import { initTRPC, TRPCError } from '@trpc/server'
import { prisma } from '@/db/prisma'
import { Role } from './util/types'
import { authorizeUser } from './util'

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = auth()
  return {
    db: prisma,
    session,
    ...opts,
  }
}
const t = initTRPC.context<typeof createTRPCContext>().create()
export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = (...roles: Role[])=> 
  publicProcedure.use(async ({ ctx, next }) => {
    const session = await ctx.session; // Await the session promise
    if (!session || !session.userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User is not authenticated',
      });
    }
    await authorizeUser(session.userId, roles); // Use the awaited session
    return next({
      ctx,
    });
  });