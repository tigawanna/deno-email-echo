import { createEmailService } from "npm:unemail";
import smtpProvider from "npm:unemail/providers/smtp";
import { SmtpConfig } from "npm:unemail/types";
import { envVariables } from "@/env.ts";

export const brevoSmtpConfig: SmtpConfig = {
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // use TLS
  user: envVariables.BREVO_SMTP_USER,
  password: envVariables.BREVO_SMTP_PASSWORD,
};

// export const mailcrabConfig: SmtpConfig = {
//   host: "localhost",
//   port: 1025, // default MailCrab port
//   secure: false, // typically false for development
// };

// Basic configuration
export const emailService = createEmailService({
  provider: smtpProvider(brevoSmtpConfig),
});
