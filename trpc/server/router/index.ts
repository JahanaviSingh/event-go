import { title } from 'process'
import { createTRPCRouter, publicProcedure } from '..'

export const appRouter = createTRPCRouter({
  hello: publicProcedure.query(({ ctx }) => {
    return { name: 'Jahanavi', age: 100 }
  }),
})
export type AppRouter = typeof appRouter
