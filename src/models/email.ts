import { saveEmailToKV } from "@/db/email-kv.ts";
import { nodemailerClient } from "@/mailer/nodemailer.ts";
import { ContentfulStatusCode } from "hono/utils/http-status";


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

export class EmailMessage {
  private payload: EmailPayload;
  
  constructor(payload: EmailPayload) {
    this.payload = payload;
  }
  
  static fromRequest(body: Record<string, unknown>, clientName: string): EmailMessage {
    return new EmailMessage({
      from: body.from as string,
      to: body.to as string,
      subject: body.subject as string,
      text: body.text as string,
      clientName: clientName
    });
  }
  
  getNodemailerPayload(): NodemailerInputs {
    return {
      from: this.payload.from,
      to: this.payload.to,
      subject: this.payload.subject,
      text: this.payload.text
    };
  }
  
  async send(): Promise<{
    success: boolean;
    status?: unknown;
    message?: string;
    statusCode: ContentfulStatusCode | undefined;
  }> {
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
