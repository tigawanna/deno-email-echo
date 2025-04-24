import { kv } from "@/db/kv.ts";
import { KV_EMAIL } from "@/consts.ts";

export async function saveEmailToKV(
    payload: {
        from: string;
        to: string;
        subject: string;
        text: string;
        sent: "success" | "failed";
        issue?: string;
        clientName: string,
  }
) {
  const timestamp = new Date().toISOString();
  const value = JSON.stringify(payload);
  await kv.set([KV_EMAIL, payload.clientName, payload.sent, payload.subject, payload.from, timestamp], value);
}

interface ListKVEmailProps {
  clientName?: string;
  sent?: "success" | "failed";
  subject?: string;
  from?: string;
}

export async function getEmailFromKV({ clientName, subject, from, sent }: ListKVEmailProps) {
  const keys: string[] = [KV_EMAIL];
  if (clientName) {
    keys.push(clientName);
  }
  if (clientName && sent) {
    keys.push(sent);
  }
  if (clientName && sent && subject) {
    keys.push(subject);
  }
  if (clientName && sent && subject && from) {
    keys.push(from);
  }
  const iter = kv.list<string>({ prefix: keys });
  const emails = [];

  for await (const entry of iter) {
    const email = {
      key: entry.key,
      value: entry.value,
      versionstamp: entry.versionstamp,
    };
    emails.push(email);
  }

  return emails;
}
