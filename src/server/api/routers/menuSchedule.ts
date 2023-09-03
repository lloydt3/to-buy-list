import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
export const menuScheduleRouter = createTRPCRouter({
  getSchedule: publicProcedure
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
      const recipe = await ctx.prisma.recipe.findMany({
        where: { createdByUserId: user.id },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          frequency: true,
          recipeIngredient: {
            select: {
              ingredient: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  category: true,
                  unit: true,
                  frequency: true,
                },
              },
              quantity: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      })
      if (!recipe) throw new Error("No recipe found.")

      return { status: "Ok", data: recipe }
    }),
  createSchedule: publicProcedure
    .input(
      z.object({
        email: z.string(),
        schedule: z.array(
          z.object({
            id: z.string(),
            day: z.date(),
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

        const schedulesToCreate = input.schedule.map((sche) => ({
          menuId: sche.id,
          userId: res.id,
          plannedDate: sche.day,
        }))
        console.log(schedulesToCreate)

        const createdSchedule = await ctx.prisma.menuSchedule.createMany({
          data: schedulesToCreate,
        })

        if (!createdSchedule) throw new Error("Failed to create schedule.")

        return {
          status: "ok",
          message: `計${createdSchedule.count}の項目を作成しました！`,
        }
      } catch (e) {
        console.error(e)
        throw new Error("Can't create record.")
      }
    }),
  // editRecipe: publicProcedure
  //   .input(
  //     z.object({
  //       email: z.string(),
  //       dataArray: z.array(
  //         z.object({
  //           id: z.string(),
  //           name: z.string(),
  //           description: z.string(),
  //           category: z.string(),
  //           unit: z.string(),
  //         })
  //       ),
  //     })
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     try {
  //       const res = await ctx.prisma.user.findUnique({
  //         where: { email: input.email },
  //       })
  //       if (!res) {
  //         throw new Error("Can't find user record.")
  //       }

  //       const updatedIngredients = input.dataArray.map(async (ingredient) => {

  //         const editedIngredient = await ctx.prisma.ingredients.update({
  //           where: { id: ingredient.id },
  //           data: {
  //             name: ingredient.name,
  //             description: ingredient.description,
  //             unit: ingredient.unit,
  //             category: ingredient.category,
  //           },
  //         })
  //         if (!editedIngredient) throw new Error("Failed to edit record")
  //         return editedIngredient
  //       })
  //       return {
  //         status: "ok",
  //         message: `Updated ${updatedIngredients.length} records.`,
  //       }
  //     } catch (e) {
  //       console.error(e)
  //       throw new Error("Can't update record.")
  //     }
  //   }),
})
