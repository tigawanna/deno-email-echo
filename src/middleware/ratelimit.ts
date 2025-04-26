import { getConnInfo } from 'hono/deno'
import { AUTH_TOKEN, KV_RATELIMIT, REQUEST_LIMIT } from "../consts.ts";
import { kv } from "../db/kv.ts";
import { BlankEnv, BlankInput, Next } from "hono/types";
import { Context } from "hono";


export async function ratelimitMiddleware(c: Context<BlankEnv, "/", BlankInput>, next: Next) {
  const info = getConnInfo(c);
  const ip = info.remote.address;
  if (!ip) {
    return c.text("no ip?", 429);
  }
  const currentLimit = await kv.get<number>([KV_RATELIMIT, ip]);
  if (currentLimit.value && currentLimit?.value === REQUEST_LIMIT) {
    return c.text("uwu", 429);
  }
  if (!currentLimit.value) {
    await kv.set([KV_RATELIMIT, ip], 1);
  } else if (currentLimit.value < REQUEST_LIMIT) {
    await kv.set([KV_RATELIMIT, ip], currentLimit.value + 1);
  }
  console.log({ currentLimit });

  await next();
}

export async function checkToken(c: Context<BlankEnv, "/", BlankInput>, next: Next) {
  const authorizationHeader = c.req.header("Authorization");
  if (!authorizationHeader) {
    return c.text("no authorizationHeader?", 401);
  }
  const bearer = authorizationHeader.split("bearer");
  if (!bearer || bearer.length < 2) {
    return c.text("invalid token length", 401);
  }
  const token = bearer[1].trim();
  if (token !== AUTH_TOKEN) {
    return c.text("invalid token", 401);
  }
  return await next();
}
