import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
export const ingredientsRouter = createTRPCRouter({
  getIngredients: publicProcedure
    .input(
      z.object({
        email: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      })
      if (!user) throw new Error("User not found.")
      const ingre = await ctx.prisma.ingredients.findMany({
        where: { createdByUserId: user.id },
        orderBy: { updatedAt: "desc" },
      })
      if (!ingre) throw new Error("No ingredients found.")

      return { status: "Ok", data: ingre }
    }),
  createIngredient: publicProcedure
    .input(
      z.object({
        email: z.string(),
        dataArray: z.array(
          z.object({
            name: z.string(),
            description: z.string(),
            category: z.string(),
            unit: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const res = await ctx.prisma.user.findUnique({
          where: { email: input.email },
        })
        if (!res) {
          throw new Error("Can't find user record.")
        }

        const ingredientsToCreate = input.dataArray.map((ingredient) => ({
          name: ingredient.name,
          description: ingredient.description,
          unit: ingredient.unit,
          category: ingredient.category,
          createdByUserId: res.id,
          frequency: 0,
        }))

        const createdIngre = await ctx.prisma.ingredients.createMany({
          data: ingredientsToCreate,
        })
        if (!createdIngre) throw new Error("Failed to create record.")

        return {
          status: "ok",
          message: `Created ${createdIngre.count} records.`,
        }
      } catch (e) {
        console.error(e)
        throw new Error("Can't create record.")
      }
    }),
  editIngredient: publicProcedure
    .input(
      z.object({
        email: z.string(),
        dataArray: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
            category: z.string(),
            unit: z.string(),
          })
        ),
        deleteArray: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const res = await ctx.prisma.user.findUnique({
          where: { email: input.email },
        })
        if (!res) {
          throw new Error("Can't find user record.")
        }

        const returnMessage = {deleted: 0}
        if (input.deleteArray.length > 0) {
          const deletedIngredients = await ctx.prisma.ingredients.deleteMany({
            where: {
              id: {
                in: input.deleteArray,
              },
            },
          })
          if (!deletedIngredients) throw new Error("Can't delete records.")
          console.log(deletedIngredients.count)
          returnMessage.deleted = (deletedIngredients.count)
        }

        const updatedIngredients = input.dataArray.map(async (ingredient) => {
          const editedIngredient = await ctx.prisma.ingredients.update({
            where: { id: ingredient.id },
            data: {
              name: ingredient.name,
              description: ingredient.description,
              unit: ingredient.unit,
              category: ingredient.category,
            },
          })
          if (!editedIngredient) throw new Error("Failed to edit record")
          return editedIngredient
        })
        return {
          status: "ok",
          message: `Updated ${updatedIngredients.length} records. Deleted ${returnMessage.deleted} records.`,
        }
      } catch (e) {
        console.error(e)
        throw new Error("Can't update record.")
      }
    }),
})
