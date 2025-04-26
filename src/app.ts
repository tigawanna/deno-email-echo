import { Hono } from 'hono'
import { pinoLogger } from "@/middleware/loggermiddleware.ts";
import { serveStatic } from 'hono/deno'
import { AppBindings } from "@/lib/hono/types.ts";
import emailRoute from "./routes/message.ts";
import { checkToken, ratelimitMiddleware } from "@/middleware/ratelimit.ts";


const app = new Hono<AppBindings>()


// @ts-expect-error type of c is not correct ,it's types are more alligned with hono-zod-openapi
app.use(pinoLogger())

app.use(ratelimitMiddleware)
app.use(checkToken)

// Serve static files from the "static" directory
app.use('/static/*', serveStatic({ root: './' }))
app.get('/', (c) => {
  return c.text('Hello Hono!')
})
app.route("/messages",emailRoute)

app.onError((err, c) => {
  c.var.logger.error(err, 'Uncaught error')
  return c.text('Custom Error Message', 500)
})

export default app
