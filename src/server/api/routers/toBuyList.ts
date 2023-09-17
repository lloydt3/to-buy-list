import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

export const toBuyRouter = createTRPCRouter({
  updateToBuyListStatus: publicProcedure
    .input(z.object({ id: z.string(), status: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {const res = await ctx.prisma.toBuyList.update({
        where: { id: input.id },
        data: { status: input.status },
      })
        if (!res) throw new Error("Can't update status of tobuylist")
        return {status: "Ok", message: "Updated list status."}
      }
      catch (e) {
        return {status: "Error", message: "Can't update list status."}
      }
    }),
  getToBuyListName: publicProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const res = await ctx.prisma.toBuyList.findMany({
          where: { createdByUserEmail: input.email },
          select: { listName: true },
          distinct: ["listName"],
        })
        if(!res) throw new Error("Failed to query DB.")
      return res
      } catch (e) {
        throw new Error("Failed to get list name.")
    }
  }),
  getToBuyList: publicProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const res = await ctx.prisma.toBuyList.findMany({
          where: { createdByUserEmail: input.email },
          select: {
            id: true,
            listName: true,
            name: true,
            count: true,
            status: true,
            updatedAt: true,
          },
          orderBy:[ {status:"desc"}, {updatedAt: "desc"}],
        })
        if (!res) throw new Error("Can't find any records")
        return { status: "Ok", message: "Success", res }
      } catch (e) {
        console.error(e)
        return { status: "Error", message: "failed to get list." }
      }
    }),
  createToBuyItem: publicProcedure
    .input(
      z.object({
        listName: z.string(),
        name: z.string(),
        count: z.string(),
        status: z.string(),
        createdByUserEmail: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const res = await ctx.prisma.toBuyList.create({
          data: {
            listName: input.listName,
            name: input.name,
            status: input.status,
            count: input.count,
            createdByUserEmail: input.createdByUserEmail,
          },
        })
        if (!res) throw new Error("Can't create new to buy list record.")
        return { status: "Ok", message: "Item added to list." }
      } catch (e) {
        console.error(e)
        return { status: "Error", message: e }
      }
    }),
})
