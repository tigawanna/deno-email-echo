
import { createTransport } from "nodemailer";
import { envVariables } from "@/env.ts";

export interface NodemailerResponse {
  message: string;
  error: boolean;
  success: boolean;
}
export interface NodemailerInputs {
  from: string;
  to: string;
  subject: string;
  text: string;
}

const transporter = createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user:envVariables.BREVO_SMTP_USER,
       pass:envVariables.BREVO_SMTP_PASSWORD,
    },
  });

export function nodemailerClient(mailOptions:NodemailerInputs) {
    return new Promise<NodemailerResponse>((resolve, reject) => {
      transporter.sendMail(mailOptions, (error: any, info: any) => {
        console.log("info ==== ", info);
        console.log("error ===== ", error);
        if (error) {
          reject(
            new Error("Error sending email: " + error.message)
          );
        } else {
          resolve({
            message: "Successfully sent, Thank you!",
            error: false,
            success: true,
          });
        }
      });
    });
  }
