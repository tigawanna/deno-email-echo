import { Hono } from "hono";
import { AppBindings } from "@/lib/hono/types.ts";
import { getEmailFromKV } from "@/db/email-kv.ts";
import { EmailMessage } from "@/models/email.ts";
import { TelegramMessage } from "@/models/telegram.ts";
import { getTelegramFromKV } from "@/db/telegram-kv.ts";


const messageRoute = new Hono<AppBindings>();

messageRoute.post("/email", async (c) => {
  try {
    const body = await c.req.json();
    const emailClient = EmailMessage.fromRequestBody(body);

    // Handle validation errors
    if (emailClient.type === "error") {
      return c.json(
        {
          message: emailClient.message,
          error: emailClient.error,
        },
        emailClient.statusCode
      );
    }

    // Send the email
    const result = await emailClient.client.send();

    if (result.success) {
      return c.json({ status: result.status });
    }

    return c.json(
      {
        message: result.message,
        error: result.status,
      },
      result.statusCode
    );
  } catch (error) {
    c.var.logger.error(error, "Error caught while sending email");
    console.error("Error sending email:", error);

    return c.json(
      {
        message: "Error sending email",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

messageRoute.post("/tg", async (c) => {
  try {
    const body = await c.req.json();
    const messageClient = await TelegramMessage.fromRequestBody(body);
    // Handle validation errors
    if (messageClient.type === "error") {
      return c.json(
        {
          message: messageClient.message,
          error: messageClient.error,
        },
        messageClient.statusCode
      );
    }
    // Send the message
    const result = await messageClient.client.send();
    if (result.success) {
      return c.json({ status: result.message });
    }
    return c.json(
      {
        message: result.message,
        error: result.error,
      },
      result.statusCode
    );
  } catch (error) {
    c.var.logger.error(error, "Error caught while sending Telegram message");
    console.error("Error sending Telegram message:", error);
    return c.json(
      {
        message: "Error sending Telegram message",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

messageRoute.get("/email/list", async (c) => {
const { clientName, sent, subject, from } = c.req.query()
  try {
    const emails = await getEmailFromKV({
      clientName: clientName,
      sent: sent as "success" | "failed",
      subject: subject,
      from: from,
      type: "email",
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
messageRoute.get("/tg/list", async (c) => {
const { clientName, sent } = c.req.query()
  try {
    const emails = await getTelegramFromKV({
      clientName: clientName,
      sent: sent as "success" | "failed",
       type: "telegram",
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


messageRoute.get("/list-html", async (c) => {
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

    emails.forEach((email) => {
      const data = JSON.parse(email.value);
      const timestamp = email.key[email.key.length - 1];
      html += `
        <tr>
          <td>${data.from}</td>
          <td>${data.to}</td>
          <td>${data.subject}</td>
          <td class="${data.sent}">${data.sent}${data.issue ? ` (${data.issue})` : ""}</td>
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
        "Content-Type": "text/html",
      },
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
        "Content-Type": "text/html",
      },
    });
  }
});

export default messageRoute;
