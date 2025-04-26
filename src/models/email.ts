import { ContentfulStatusCode } from "hono/utils/http-status";

import { z } from "npm:zod";
import { returnValidationData } from "@/lib/zod.ts";
import { MessagePersistence, PersistenceOptions } from "@/db/message-persistence.ts";
import { envVariables } from "@/env.ts";
import { TelegramNotifier } from "@/lib/telegram/client.ts";
import { nodemailerClient } from "@/lib/mailer/nodemailer.ts";



export interface EmailResponse {
  success: boolean;
  status?: unknown;
  message?: string;
  statusCode: ContentfulStatusCode;
  validationError?: unknown;
}

export const emailMessagePayload = z.object({
  clientName: z.string().min(1, "Client name cannot be empty"),
  from: z.string().email("Invalid email format"),
  to: z.string().email("Invalid email format"),
  subject: z.string().min(1, "Subject cannot be empty"),
  text: z.string().min(1, "Email body cannot be empty"),
  persist: z.boolean().optional(),
  tg: z.boolean().optional(),
});

export const emailMessageQueryParams = emailMessagePayload
.omit({
  text: true,
  to: true,
})
.extend({
  sent: z.enum(["success", "failed"]).optional(),
})
.partial()

export type EmailMessagePayload = z.infer<typeof emailMessagePayload>;

export interface EmailPayload extends EmailMessagePayload {
  clientName: string;
  sent?: "success" | "failed";
  issue?: string;
}

export type NodemailerInputs = Pick<EmailPayload, "from" | "to" | "subject" | "text">;

export type EmailMessageClient = {
  type: "success";
  client: EmailMessage;
};

export type EmailBodyValidationError = {
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

export class EmailMessage {
  private payload: EmailPayload;
  private persistenceOptions: PersistenceOptions;
  private static schema = emailMessagePayload;
  
  constructor(payload: EmailPayload, persistenceOptions: PersistenceOptions = { enabled: true }) {
    this.payload = payload;
    this.persistenceOptions = persistenceOptions;
  }
  
  static fromRequestBody(
    body: unknown, 
    persistenceOptions: PersistenceOptions = { enabled: true }
  ): EmailMessageClient | EmailBodyValidationError {
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
      client: new EmailMessage({
        from: result.data.from,
        to: result.data.to,
        subject: result.data.subject,
        text: result.data.text,
        clientName: result.data.clientName,
        persist: result.data.persist,
        tg: result.data.tg
      }, persistenceOptions),
    };
  }
  
  getNodemailerPayload(): NodemailerInputs {
    return {
      from: this.payload.from,
      to: this.payload.to,
      subject: this.payload.subject,
      text: this.payload.text
    };
  }
  
  formatTelegramMessage(status: "sent" | "failed", error?: string): string {
    const formattedDateTime = new Date().toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    
    return (
      `📧 Email ${status === "sent" ? "Sent" : "Failed"}\n` +
      `📅 ${formattedDateTime}\n\n` +
      `From: ${this.payload.from}\n` +
      `To: ${this.payload.to}\n` +
      `Subject: ${this.payload.subject}\n` +
      (error ? `\n❌ Error: ${error}` : '')
    );
  }
  
  async forwardToTelegram(status: "sent" | "failed", error?: string): Promise<void> {
    if (!this.payload.tg) return;
    
    try {
      const telegramNotifier = new TelegramNotifier({
        botToken: envVariables.TELEGRAM_BOT_TOKEN,
        channelId: envVariables.TELEGRAM_CHANNEL_ID,
      });
      
      const message = this.formatTelegramMessage(status, error);
      await telegramNotifier.send(message);
    } catch (telegramError) {
      console.error("Failed to forward email to Telegram:", telegramError);
      // We don't want to fail the email operation if Telegram forwarding fails
    }
  }
  
  async send(): Promise<EmailResponse> {
    try {
      const nodemailerPayload = this.getNodemailerPayload();
      const nodemailerResponse = await nodemailerClient(nodemailerPayload);
      
      // Handle error response
      if (nodemailerResponse instanceof Error) {
        if (this.persistenceOptions.enabled && this.payload.persist) {
          await this.saveFailure(nodemailerResponse.message);
        }
        
        // Forward to Telegram if tg is true
        await this.forwardToTelegram("failed", nodemailerResponse.message);
        
        return {
          success: false,
          message: "Error sending email",
          status: nodemailerResponse.message,
          statusCode: 500
        };
      }
      
      // Handle unsuccessful response
      if (!nodemailerResponse.success) {
        console.error("Nodemailer response error:===> ", nodemailerResponse.error);
        if (this.persistenceOptions.enabled && this.payload.persist) {
          await this.saveFailure(nodemailerResponse.message);
        }
        
        // Forward to Telegram if tg is true
        await this.forwardToTelegram("failed", nodemailerResponse.message);
        
        return {
          success: false,
          message: "Unsuccessful sending email",
          status: nodemailerResponse.error,
          statusCode: 500
        };
      }
      
      // Handle successful response
      if (this.persistenceOptions.enabled && this.payload.persist) {
        await this.saveSuccess();
      }
      
      // Forward to Telegram if tg is true
      await this.forwardToTelegram("sent");
      
      return {
        success: true,
        status: nodemailerResponse,
        statusCode: 200
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Caught error sending email: ==>", error);
      
      if (this.persistenceOptions.enabled && this.payload.persist) {
        await this.saveFailure(errorMessage);
      }
      
      // Forward to Telegram if tg is true
      await this.forwardToTelegram("failed", errorMessage);
      
      return {
        success: false,
        message: "Error sending email",
        status: errorMessage,
        statusCode: 500
      };
    }
  }
  
  private async saveSuccess(): Promise<void> {
    await MessagePersistence.saveEmail(this.payload, "success");
  }
  
  private async saveFailure(issue: string): Promise<void> {
    await MessagePersistence.saveEmail(this.payload, "failed", issue);
  }
}
