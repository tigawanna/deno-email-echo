import { ContentfulStatusCode } from "hono/utils/http-status";
import { TelegramNotifier } from "@/telegram/client.ts";
import { z } from "npm:zod";
import { returnValidationData } from "@/lib/zod.ts";

interface TelegramConfig {
  botToken: string;
  channelId: string;
}

export interface TelegramPayload {
  type: string;
  data: string;
  config: TelegramConfig;
}

export interface TelegramResponse {
  success: boolean;
  message?: string;
  error?: unknown;
  statusCode: ContentfulStatusCode;
  validationError?: unknown;
}

export const telegramMessagePayload = z.object({
  type: z.string(),
  data: z.string(),
});

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

  constructor(payload: TelegramPayload) {
    this.payload = payload;
    this.notifier = new TelegramNotifier({
      botToken: payload.config.botToken,
      channelId: payload.config.channelId,
    });
  }

  static  fromRequestBody(
    body: unknown,
    config: TelegramConfig
  ): TelegramMessageClient | TelegramBodyValidationError {
    // Validate the request body
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
        type: result.data.type,
        data: result.data.data,
        config,
      }),
    };
  }

  formatMessage(): string {
    return (
      `🚀 API Event: ${this.payload.type}\n` +
      `📅 ${new Date().toISOString()}\n\n\n` +
      `Details: ${this.payload.data}`
    );
  }

  async send(): Promise<TelegramResponse> {
    try {
      const message = this.formatMessage();
      const result = await this.notifier.send(message);

      if (!result.success) {
        return {
          success: false,
          message: "Failed to send Telegram message",
          error: result.message,
          statusCode: result.statusCode || 500,
        };
      }

      return {
        success: true,
        message: "Message sent successfully",
        statusCode: 200,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error sending Telegram message:", errorMessage);

      return {
        success: false,
        message: "Error sending Telegram message",
        error: errorMessage,
        statusCode: 500,
      };
    }
  }
}
