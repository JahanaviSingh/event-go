import { createTRPCRouter, publicProcedure } from '..';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()
export const showsRouter = createTRPCRouter({
    shows: publicProcedure.query(({ctx})=>{
        return ctx.db.show.findMany();
    })
})