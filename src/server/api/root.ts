import { exampleRouter } from "~/server/api/routers/example";
import { signUpRouter } from "./routers/signup";
import { ingredientsRouter } from "./routers/ingredients";
import { recipeRouter } from "./routers/recipe";
import { createTRPCRouter } from "~/server/api/trpc";
import { menuScheduleRouter } from "./routers/menuSchedule";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  signup: signUpRouter,
  ingredient: ingredientsRouter,
  recipe: recipeRouter,
  menuSchedule: menuScheduleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
