import "jsr:@std/dotenv/load";
import { z } from "npm:zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  
  ALLOWED_ORIGINS: z.array(z.string()).optional(),
  AUTH_TOKEN: z.string().min(12),
  SMTP_PASSWORD: z.string().min(6),
  SMTP_HOST: z.string().min(3),
  SMTP_USER: z.string().min(6),
  TELEGRAM_BOT_TOKEN: z.string().min(3),
  TELEGRAM_CHANNEL_ID: z.string().min(3),
  // DATABASE_URL: z.string().url(),
  // DATABASE_AUTH_TOKEN: z.string().optional(),
  // API_URL: z.string(),
  // FRONTEND_URL: z.string(),
  // ACCESS_TOKEN_SECRET: z.string(),
  // REFRESH_TOKEN_SECRET: z.string(),
  // BREVO_API_KEY: z.string(),
  // BREVO_USER: z.string(),
  // EMAIL_FROM: z.string(),
});

export type TEnv = z.infer<typeof EnvSchema>;

const { data: env, error } = EnvSchema.safeParse(Deno.env.toObject());

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  Deno.exit(1);
}

const envVariables = env!;
export { envVariables };
