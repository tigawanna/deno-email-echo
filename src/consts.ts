import { envVariables } from "@/env.ts";

export const KV_REQUEST = 'user_request' as const
export const KV_RATELIMIT = 'ratelimit' as const
export const KV_EMAIL = 'user_email'  as const


export const AUTH_TOKEN = envVariables.AUTH_TOKEN
export const REQUEST_LIMIT = 10 // 5 requests
export const EXPIRES_IN = 1000 * 60 * 30 // 30 minutes 
