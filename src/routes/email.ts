import { Hono } from "hono";
import { AppBindings } from "@/lib/hono/types.ts";
// import { emailService } from "@/mailer/unemial.ts";
import { SmtpEmailOptions } from "npm:unemail/providers/smtp";
import { nodemailerClient } from "@/mailer/nodemailer.ts";

const emailRoute = new Hono<AppBindings>();

const dummyPayload: SmtpEmailOptions = {
  to: {
    email: "denniskinuthiawaweru@gmail.com",
    name: "Dennis Kinuthia Waweru",
  },
  from: {
    email: "denniskinuthiaw@gmail.com",
    name: "Dennis Kinuthia",
  },
  subject: "Test email from deno",
  text: "This is a test email from deno",
  html: "<h1>This is a test email from deno</h1>",
};

// emailRoute.get("/", async (c) => {
//   // const { email } = await c.req.json()
//   try {
//     const response = await emailService.sendEmail(dummyPayload);
//     if (response.error) {
//       return c.json(
//         {
//           message: "Error sending email",
//           error: response.error.message,
//         },
//         500
//       );
//     }
//     if (!response.success) {
//       return c.json(
//         {
//           message: "unsuccessful sending email",
//           status: response.error,
//         },
//         500
//       );
//     }
//     return c.json({
//       status: response.data,
//     });
//   } catch (error) {
//     c.var.logger.error(error, "Error catched while sending email");
//     console.error("Error sending email:", error);
//     return c.json(
//       {
//         message: "Error sending email",
//         error,
//       },
//       500
//     );
//   }
// });

emailRoute.get("/nodemailer", async (c) => {
  try {
    const nodemailerResponse = await nodemailerClient({
      from: dummyPayload.from.email,
      // @ts-expect-error type of to is not correct
      to: dummyPayload.to.email,
      subject: dummyPayload.subject,
      // @ts-expect-error type of text is not correct
      text: dummyPayload.text,
    });
    if (nodemailerResponse.error) {
      return c.json(
        {
          message: "Error sending email",
          error: nodemailerResponse.error,
        },
        500
      );
    }
    if (!nodemailerResponse.success) {
      return c.json(
        {
          message: "unsuccessful sending email",
          status: nodemailerResponse.error,
        },
        500
      );
    }
    return c.json({
      status: nodemailerResponse,
    });
  } catch (error) {
    c.var.logger.error(error, "Error catched while sending email");
    console.error("Error sending email:", error);
    return c.json(
      {
        message: "Error sending email",
        error,
      },
      500
    );
  }
});

export default emailRoute;
