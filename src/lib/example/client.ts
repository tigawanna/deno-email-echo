//  how to use in the calling application


type EmailMessagePayload = {
  clientName: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  persist?: boolean | undefined;
  tg?: boolean | undefined;
};

export async function sendEmailMessage(message: EmailMessagePayload) {
  const { MESSAGE_API_URL, MESSAGE_APPI_KEY } = process.env;
  if (!MESSAGE_API_URL) throw new Error("Message API URL is not defined");
  if (!MESSAGE_APPI_KEY) throw new Error("Message API key is not defined");
  try {
    const res = await fetch(`${MESSAGE_API_URL}/messages/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MESSAGE_APPI_KEY}`,
      },
      body: JSON.stringify(message),
    });

    if (!res.ok) {
      throw new Error(`Failed to send email: ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

type TelegramPayload = {
  clientName: string;
  type: string;
  data: string;
  persist?: boolean | undefined;
};

export async function sendTelegramMessage(message: TelegramPayload) {
  const { MESSAGE_API_URL, MESSAGE_APPI_KEY } = process.env;
  if (!MESSAGE_API_URL) throw new Error("Message API URL is not defined");
  if (!MESSAGE_APPI_KEY) throw new Error("Message API key is not defined");
  try {
   const res = await fetch(`${MESSAGE_API_URL}/messages/tg`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MESSAGE_APPI_KEY}`,
      },
      body: JSON.stringify(message),
    });

    if (!res.ok) {
      throw new Error(`Failed to send Telegram message: ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    throw error;
  }
}
