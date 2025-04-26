
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

export function nodemailerClient(mailOptions:NodemailerInputs):Promise<NodemailerResponse|Error> {
    return new Promise<NodemailerResponse>((resolve, reject) => {
        return resolve({
            message: "Successfully sent, Thank you!",
            error: false,
            success: true,
          });
      transporter.sendMail(mailOptions, (error: unknown) => {
        if (error) {
          if(error instanceof Error){
            reject(error)
          }  
          reject(
            new Error("Error sending email: " + error)
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
