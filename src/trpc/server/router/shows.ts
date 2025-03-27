import { protectedProcedure } from "@/trpc/server";
import { createTRPCRouter, publicProcedure } from "..";

export const showsRouter = createTRPCRouter({
    shows: publicProcedure.query(({ctx})=>{
        return ctx.db.show.findMany()
    }),
})
