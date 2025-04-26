import { kv } from "@/db/kv.ts";
import { KV_EMAIL, KV_MESSAGES } from "@/consts.ts";
import { EmailMessagePayload } from "@/models/email.ts";

interface SaveEmailToKv extends EmailMessagePayload {
  sent: "success" | "failed";
  issue?: string;
  type: "email";
}

export async function saveEmailToKV(payload: SaveEmailToKv) {
  const timestamp = new Date().toISOString();
  const value = JSON.stringify(payload);
  await kv.set(
    [
      KV_MESSAGES,
      payload.clientName,
      KV_EMAIL,
      payload.sent,
      payload.subject,
      payload.from,
      timestamp,
    ],
    value
  );
}

interface ListKVEmailProps extends Partial<EmailMessagePayload> {
  sent?: "success" | "failed";
  type?: "email";
}

export async function getEmailFromKV({ clientName, subject, from, sent }: ListKVEmailProps) {
  const keys: string[] = [KV_MESSAGES];
  // Build the key array progressively
  // Only add subsequent parts if we have the previous ones
  if (clientName) {
    keys.push(clientName);
    keys.push(KV_EMAIL); // KV_EMAIL is a constant, so we don't need to check if it exists

    if (sent) {
      keys.push(sent);

      if (subject) {
        keys.push(subject);

        if (from) {
          keys.push(from);
        }
      }
    }
  }

  const iter = kv.list<string>({ prefix: keys });
  const emails = [];

  for await (const entry of iter) {
    const email = {
      key: entry.key,
      value: JSON.parse(entry.value) as EmailMessagePayload,
      versionstamp: entry.versionstamp,
    };
    emails.push(email);
  }

  return emails;
}
