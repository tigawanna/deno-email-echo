import { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "npm:zod";
import { returnValidationData } from "@/lib/zod.ts";
import { MessagePersistence} from "@/db/message-persistence.ts";
import { TelegramNotifier } from "@/lib/telegram/client.ts";
import { envVariables } from "@/env.ts";

export interface TelegramResponse {
  success: boolean;
  message?: string;
  error?: unknown;
  statusCode: ContentfulStatusCode;
  validationError?: unknown;
}

export const telegramMessagePayload = z.object({
  clientName: z.string().min(1, "Client name cannot be empty"),
  type: z.string(),
  data: z.string(),
  persist: z.boolean().optional(),
});
export type TelegramPayload = z.infer<typeof telegramMessagePayload>;

export type TelegramMessageClient = {
  type: "success";
  client: TelegramMessage;
};

export type TelegramBodyValidationError = {
  type: "error";
  message: "Invalid request body";
  statusCode: ContentfulStatusCode;
  error: Record<
    string,
    {
      code: "validation_failed";
      message: string;
    }
  >;
};

export class TelegramMessage {
  private payload: TelegramPayload;
  private notifier: TelegramNotifier;
  private static schema = telegramMessagePayload;

  constructor(
    payload: TelegramPayload, 
  ) {
    this.payload = payload;
    this.notifier = new TelegramNotifier({
      botToken:envVariables.TELEGRAM_BOT_TOKEN,
      channelId:envVariables.TELEGRAM_CHANNEL_ID,
    });
  }

  static fromRequestBody(body: unknown): TelegramMessageClient | TelegramBodyValidationError {
    const result = this.schema.safeParse(body);

    if (!result.success) {
      return {
        type: "error",
        message: "Invalid request body",
        error: returnValidationData(result.error),
        statusCode: 400,
      };
    }

    return {
      type: "success",
      client: new TelegramMessage({
        clientName: result.data.clientName,
        type: result.data.type,
        data: result.data.data,
        persist: result.data.persist ?? false,
      }),
    };
  }

  formatMessage(): string {
    return (
      `**${this.payload.type}**` +
      `📅 ${new Date().toISOString()}\n\n\n\n` +
      `${this.payload.data}`
    );
  }

  async send(): Promise<TelegramResponse> {
    try {
      const message = this.formatMessage();
      const result = await this.notifier.send(message);

      if (!result.success) {
        if (this.payload.persist) {
          await this.saveFailure(result.message || "Unknown error");
        }
        
        return {
          success: false,
          message: "Failed to send Telegram message",
          error: result.message,
          statusCode: result.statusCode || 500,
        };
      }

      if (this.payload.persist) {
        await this.saveSuccess();
      }
      
      return {
        success: true,
        message: "Message sent successfully",
        statusCode: 200,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error sending Telegram message:", errorMessage);
      
      if (this.payload.persist) {
        await this.saveFailure(errorMessage);
      }
      
      return {
        success: false,
        message: "Error sending Telegram message",
        error: errorMessage,
        statusCode: 500
      };
    }
  }
  
  private async saveSuccess(): Promise<void> {
    await MessagePersistence.saveTelegram(this.payload, "success");
  }
  
  private async saveFailure(issue: string): Promise<void> {
    await MessagePersistence.saveTelegram(this.payload, "failed", issue);
  }
}
