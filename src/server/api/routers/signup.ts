import { z } from "zod"
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc"
import bcrypt from "bcrypt"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { env } from "~/env.mjs"
export const signUpRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
        accessCode: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.accessCode !== env.ACCESS_CODE) {
        throw new Error("Not authorized to register")
      }
      const hashedPassword = await bcrypt.hash(input.password, 10)
      // console.log(input.name, input.email, hashedPassword)
      try {
        const res = await ctx.prisma.user.create({
          data: {
            name: input.name,
            email: input.email,
            password: hashedPassword,
          },
        })

        return {
          status: "ok",
          message: `${input.name} created!`,
        }
      } catch (e) {
        console.log("triggered!!")
        if (e instanceof PrismaClientKnownRequestError) {
          console.log("prisma error!!!!", e.code)
          if (e.code === "P2002")
            throw new Error("メールアドレスは登録済みです。")
          else
            throw new Error("登録に失敗しました。管理者に連絡してください。")
        }
        else {
          console.log("error object: ", e)
          throw new Error("Server error. Please contact admin.")
        }
      }
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany()
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!"
  }),
})
