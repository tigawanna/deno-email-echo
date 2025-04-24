import { Hono } from "hono";
import { AppBindings } from "@/lib/hono/types.ts";
// import { emailService } from "@/mailer/unemial.ts";
import { SmtpEmailOptions } from "npm:unemail/providers/smtp";
import { nodemailerClient, NodemailerInputs } from "@/mailer/nodemailer.ts";
import { getEmailFromKV, saveEmailToKV } from "@/db/email-kv.ts";

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

emailRoute.post("/", async (c) => {
  const payload = {
    from: dummyPayload.from.email,
    // @ts-expect-error type of to is not correct
    to: dummyPayload.to.email,
    subject: dummyPayload.subject,
    text: dummyPayload.text,
  } as NodemailerInputs;
  try {
    const nodemailerResponse = await nodemailerClient(payload);
    if (nodemailerResponse instanceof Error) {
      await saveEmailToKV({
        ...payload,
        clientName: "tester",
        issue: nodemailerResponse.message,
        sent: "failed",
      });
      return c.json(
        {
          message: "Error sending email",
          error: nodemailerResponse.message,
        },
        500
      );
    }
    if (!nodemailerResponse.success) {
      await saveEmailToKV({
        ...payload,
        clientName: "tester",
        issue: nodemailerResponse.message,
        sent: "failed",
      });
      return c.json(
        {
          message: "unsuccessful sending email",
          status: nodemailerResponse.error,
        },
        500
      );
    }
    await saveEmailToKV({
      ...payload,
      clientName: "tester",
      sent: "success",
    });
    return c.json({
      status: nodemailerResponse,
    });
  } catch (error) {
    c.var.logger.error(error, "Error catched while sending email");
    console.error("Error sending email:", error);
    await saveEmailToKV({
      ...payload,
      clientName: "tester",
      issue: error instanceof Error ? error.message : "Unknown error",
      sent: "failed",
    });
    return c.json(
      {
        message: "Error sending email",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

emailRoute.get("/list", async (c) => {
  const { clientName, sent, subject, from } = c.req.query();
  try {
    const emails = await getEmailFromKV({
      clientName: clientName,
      sent: sent as "success" | "failed",
      subject: subject,
      from: from,
    });
    return c.json(emails);
  } catch (error) {
    c.var.logger.error(error, "Error catched while getting emails");
    console.error("Error getting emails:", error);
    return c.json(
      {
        message: "Error getting emails",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

emailRoute.get("/list-html", async (c) => {
  const { clientName, sent, subject, from } = c.req.query();
  try {
    const emails = await getEmailFromKV({
      clientName: clientName,
      sent: sent as "success" | "failed",
      subject: subject,
      from: from,
    });
    
    // Create HTML content
    let html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            tr:hover { background-color: #f5f5f5; }
            .success { color: green; }
            .failed { color: red; }
          </style>
        </head>
        <body>
          <h1>Email List</h1>
          <table>
            <tr>
              <th>From</th>
              <th>To</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Client</th>
              <th>Timestamp</th>
            </tr>
    `;
    
    emails.forEach(email => {
      const data = JSON.parse(email.value);
      const timestamp = email.key[email.key.length - 1];
      html += `
        <tr>
          <td>${data.from}</td>
          <td>${data.to}</td>
          <td>${data.subject}</td>
          <td class="${data.sent}">${data.sent}${data.issue ? ` (${data.issue})` : ''}</td>
          <td>${data.clientName}</td>
          <td>${String(timestamp)}</td>
        </tr>
      `;
    });
    
    html += `
          </table>
        </body>
      </html>
    `;
    
    return new Response(html, {
      headers: {
        "Content-Type": "text/html"
      }
    });
  } catch (error) {
    c.var.logger.error(error, "Error caught while getting emails for HTML view");
    console.error("Error getting emails for HTML view:", error);
    
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .error { color: red; }
          </style>
        </head>
        <body>
          <h1 class="error">Error getting emails</h1>
          <p>${error instanceof Error ? error.message : "Unknown error"}</p>
        </body>
      </html>
    `;
    
    return new Response(errorHtml, {
      status: 500,
      headers: {
        "Content-Type": "text/html"
      }
    });
  }
});

export default emailRoute;
