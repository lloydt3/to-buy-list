import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
export const recipeRouter = createTRPCRouter({
  getRecipe: publicProcedure
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
                }
              },
              quantity: true,
            }
          }
        },
        orderBy: {updatedAt: "desc"}
      })
      if (!recipe) throw new Error("No recipe found.")

      return { status: "Ok", data: recipe }
    }),
  createRecipe: publicProcedure
    .input(
      z.object({
        email: z.string(),
        recipe: z.object({
            name: z.string(),
            description: z.string(),
            category: z.string(),
            frequency: z.number().nullish(),
          }),
        ingredients: z.array(
          z.object({
            id: z.string(),
            name: z.string().nullish(),
            description: z.string().nullish(),
            quantity: z.number(),
            notes: z.string().nullish(),
          })
        )
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

        const createdRecipe = await ctx.prisma.recipe.create({
          data: {
            title: input.recipe.name,
            description: input.recipe.description,
            category: input.recipe.category,
            createdByUserId: res.id,
            frequency: 0
          },
        })
        if (!createdRecipe) throw new Error("Failed to create record for recipe.")

        const recipeIngredientToCreate = input.ingredients.map(ingre =>( {
          recipeId: createdRecipe.id,
          ingredientId: ingre.id,
          quantity: ingre.quantity,          
        }))

        const createdRecipeIngredient = await ctx.prisma.recipeIngredient.createMany({
          data: recipeIngredientToCreate
        })
        if (!createdRecipeIngredient) throw new Error("Failed to create record for recipeIngredients")
        return {
          status: "ok",
          message: `${createdRecipe.title}を作成しました！`,
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
