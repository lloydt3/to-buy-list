import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
// import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import bcrypt from "bcrypt";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      // ...other properties
      // role: UserRole;
    };
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  // callbacks: {
  //   session: ({ session, user }) => ({
  //     ...session,
  //     user: {
  //       ...session.user,
  //       id: user.id,
  //     },
  //   }),
  // },
  // adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "email", placeholder: "tommy@tommy.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const user = await prisma.user.findFirst({
          where: { email: credentials!.email },
        })
        console.log("trying to sign in")

        if (user?.password) {
          // Compare the provided password with the stored hashed password
          const isValid = await bcrypt.compare(
            credentials!.password,
            user.password
          )
          if (isValid) {
            console.log("success")
            return user // you might need to adjust the returned fields to fit your needs
          } else {
            console.log("failed")
            return null
          }
        } else {
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signIn"
  },
  //   providers: [
  //     // DiscordProvider({
  //     //   clientId: env.DISCORD_CLIENT_ID,
  //     //   clientSecret: env.DISCORD_CLIENT_SECRET,
  //     // }),
  //     /**
  //      * ...add more providers here.
  //      *
  //      * Most other providers require a bit more work than the Discord provider. For example, the
  //      * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
  //      * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
  //      *
  //      * @see https://next-auth.js.org/providers/github
  //      */
  //   ],
  // session: {
  //   strategy: "jwt"
  // },
  secret: env.NEXTAUTH_SECRET,
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
