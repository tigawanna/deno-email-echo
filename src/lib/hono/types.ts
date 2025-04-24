import type { PinoLogger } from "npm:@tigawanna/hono-pino";

type Bindings = {
  TOKEN: string;
};
type Env = {
  [key: string]: Bindings;
};

export interface AppBindings {
  Env: Env;
  Bindings: Bindings;
  Variables: {
    logger: PinoLogger;
  };
}
