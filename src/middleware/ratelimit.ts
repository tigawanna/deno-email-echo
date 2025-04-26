import { getConnInfo } from 'hono/deno'
import { AUTH_TOKEN, KV_RATELIMIT, REQUEST_LIMIT } from "../consts.ts";
import { kv } from "../db/kv.ts";
import { BlankEnv, BlankInput, Next } from "hono/types";
import { Context } from "hono";
import { getCookie } from "hono/cookie";


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
  // Check for Authorization header first
  const authorizationHeader = c.req.header("Authorization");
  let isAuthorized = false;
  
  // Validate Authorization header if present
  if (authorizationHeader) {
    const bearer = authorizationHeader.split("bearer");
    if (bearer && bearer.length >= 2) {
      const token = bearer[1].trim();
      if (token === AUTH_TOKEN) {
        isAuthorized = true;
      }
    }
  }
  
  // If not authorized via header, check for auth_token cookie
  if (!isAuthorized) {
    const cookieToken = getCookie(c, 'auth_token');
    if (cookieToken && cookieToken === AUTH_TOKEN) {
      isAuthorized = true;
    }
  }
  
  // Return 401 if not authorized by either method
  if (!isAuthorized) {
    return c.text("Authentication required", 401);
  }
  
  // Continue to next middleware/handler if authorized
  return await next();
}
