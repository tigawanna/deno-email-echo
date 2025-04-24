import { pinoLogger as logger } from "npm:@tigawanna/hono-pino";
import {pino} from "npm:pino";
import pretty from "npm:pino-pretty";
import { envVariables } from "../env.ts";



export function pinoLogger() {
  return logger({
    pino: pino(
      {
        level: envVariables.LOG_LEVEL || "info",
      },
      envVariables.NODE_ENV === "production"
        ? undefined
        : pretty({
            colorize: true,
          }),
    ),
    http: {
      reqId: () => crypto.randomUUID(),
      // minimalMessage: envVariables.LOG_LEVEL === "debug",
      minimalMessage: envVariables.LOG_LEVEL !== "debug",
    },
  });
}
