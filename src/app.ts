import { Hono } from 'hono'
import { pinoLogger } from "@/middleware/loggermiddleware.ts";
import { serveStatic } from 'hono/deno'
import { AppBindings } from "@/lib/hono/types.ts";


const app = new Hono<AppBindings>()


// @ts-expect-error type of c is not correct ,it's types are more alligned with hono-zod-openapi
app.use(pinoLogger())



// Serve static files from the "static" directory
app.use('/static/*', serveStatic({ root: './' }))
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default app
