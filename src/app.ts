import { Hono } from 'hono'
import { pinoLogger } from "@/middleware/loggermiddleware.ts";
import { serveStatic } from 'hono/deno'
import { AppBindings } from "@/lib/hono/types.ts";
import emailRoute from "./routes/message.ts";
import { checkToken, ratelimitMiddleware } from "@/middleware/ratelimit.ts";
import { envVariables } from "@/env.ts";
import { loginRoute } from "@/components/login.tsx";
import { listRoute } from "@/components/list.tsx";
import { homeRoute } from "@/components/home.tsx";
import { deleteCookie } from "hono/cookie";


const app = new Hono<AppBindings>()


// @ts-expect-error type of c is not correct ,it's types are more alligned with hono-zod-openapi
app.use(pinoLogger())

app.route("/",homeRoute)
app.route("/login",loginRoute)
app.get("/logout",(c) => {
  c.var.logger.info("Logout")
  deleteCookie(c, "auth_token")
  return c.redirect("/")
})
// app.get('/', (c) => {
//   return c.text('Hello Hono!')
// })

// app.use(ratelimitMiddleware)
app.use(checkToken)

app.get('/envVariables', (c) => {
  return c.json(envVariables)
})

// Serve static files from the "static" directory
app.use('/static/*', serveStatic({ root: './' }))
app.route("/messages",emailRoute)
app.route("/list",listRoute)
app.onError((err, c) => {
  c.var.logger.error(err, 'Uncaught error')
  return c.text('Custom Error Message', 500)
})

export default app
