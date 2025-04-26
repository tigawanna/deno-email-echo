import { saveEmailToKV } from "@/db/email-kv.ts";
import { EmailPayload } from "@/models/email.ts";
import { TelegramPayload } from "@/models/telegram.ts";

export interface PersistenceOptions {
  enabled: boolean;
}

export class MessagePersistence {
  static async saveEmail(
    payload: EmailPayload, 
    status: "success" | "failed", 
    issue?: string
  ): Promise<void> {
    await saveEmailToKV({
      ...payload,
      sent: status,
      issue
    });
  }
  
  static saveTelegram(
    payload: TelegramPayload,
    status: "success" | "failed",
    issue?: string
  ) {
    // You can implement this if you need to persist Telegram messages too
    // For now, we'll implement a stub
    console.log(`Persisting Telegram message: ${payload.type}, status: ${status}`);
    // You could create a similar KV function like saveEmailToKV for Telegram
  }
}
