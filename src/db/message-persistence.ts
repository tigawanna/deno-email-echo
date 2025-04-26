import { saveEmailToKV } from "@/db/email-kv.ts";
import { EmailPayload } from "@/models/email.ts";
import { TelegramPayload } from "@/models/telegram.ts";
import { saveTelegramToKV } from "@/db/telegram-kv.ts";

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
      type: "email",
      issue,
    });
  }


static async saveTelegram(
    payload: TelegramPayload,
    status: "success" | "failed",
    issue?: string
  ) {
    await saveTelegramToKV({
      ...payload,
      sent: status,
      type: "telegram",
      issue,
    });
  }

}
