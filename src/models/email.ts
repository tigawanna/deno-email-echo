import { saveEmailToKV } from "@/db/email-kv.ts";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { nodemailerClient } from "@/lib/nodemailer/brevo-client.ts";
import { z } from "npm:zod";
import { returnValidationData } from "@/lib/zod.ts";

export interface NodemailerInputs {
  from: string;
  to: string;
  subject: string;
  text: string;
}

export interface EmailPayload extends NodemailerInputs {
  clientName: string;
  sent?: "success" | "failed";
  issue?: string;
}

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
});

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
  private static schema = emailMessagePayload;
  
  constructor(payload: EmailPayload) {
    this.payload = payload;
  }
  
  static fromRequestBody(body: unknown): EmailMessageClient | EmailBodyValidationError {
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
        clientName: result.data.clientName
      }),
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
  
  async send(): Promise<EmailResponse> {
    try {
      const nodemailerPayload = this.getNodemailerPayload();
      const nodemailerResponse = await nodemailerClient(nodemailerPayload);
      
      // Handle error response
      if (nodemailerResponse instanceof Error) {
        await this.saveFailure(nodemailerResponse.message);
        return {
          success: false,
          message: "Error sending email",
          status: nodemailerResponse.message,
          statusCode: 500
        };
      }
      
      // Handle unsuccessful response
      if (!nodemailerResponse.success) {
        await this.saveFailure(nodemailerResponse.message);
        return {
          success: false,
          message: "Unsuccessful sending email",
          status: nodemailerResponse.error,
          statusCode: 500
        };
      }
      
      // Handle successful response
      await this.saveSuccess();
      return {
        success: true,
        status: nodemailerResponse,
        statusCode: 200
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error sending email:", error);
      await this.saveFailure(errorMessage);
      
      return {
        success: false,
        message: "Error sending email",
        status: errorMessage,
        statusCode: 500
      };
    }
  }
  
  private async saveSuccess(): Promise<void> {
    await saveEmailToKV({
      ...this.payload,
      sent: "success"
    });
  }
  
  private async saveFailure(issue: string): Promise<void> {
    await saveEmailToKV({
      ...this.payload,
      issue,
      sent: "failed"
    });
  }
}
