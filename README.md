# deno messages

A simple service to send emails and backups to telegram and deno kv inscae of email failure 
use cases include your contact me fomr on your portfolio site or any other form that sends emails with a chance of silent failure

## Features

- Send emails through a simple API
- Forward messages to Telegram
- Persistence options with Deno KV
- Filter and query message history
organization

## Installation

```bash
git clone https://github.com/your-username/deno-messages.git
cd deno-messages
deno task dev
```

## Configuration

Create a `.env` file with the following variables:

```sh
# Email configuration
EMAIL_USERNAME=your-email@example.com  # The email address used to send emails
EMAIL_PASSWORD=your-password           # The password or app-specific password for the email account
SMTP_HOST
SMTP_USER=your-brevo-smtp-user   # Brevo SMTP username for sending via Brevo service
SMTP_PASSWORD=your-brevo-password # Brevo SMTP password

# Telegram configuration
TELEGRAM_BOT_TOKEN=your-telegram-bot-token  # Your Telegram bot token from BotFather
TELEGRAM_CHAT_ID=your-chat-id               # The chat ID where messages will be sent
TELEGRAM_CHANNEL_ID=your-channel-id         # Channel ID for broadcasting messages

# Application configuration
NODE_ENV=development                   # Application environment (development/production)
LOG_LEVEL=info                         # Logging level (debug/info/warn/error)
AUTH_TOKEN=your-secret-auth-token      # Authentication token for securing API endpoints
# ALLOWED_ORIGINS=origin1,origin2      # Comma-separated list of allowed CORS origins
```
```




example usage

```json5
// GET /messages/email
{
    "clientName": "portfolio site", // optional: used to group by the project
    "sent": "success", // optional; "success" | "failed"
    "subject": "It's sunny outside", // optional
    "from": "senderemail@gmail.com" // optional
}

```
```json5
// POST /messages/email
{
  "clientName":"portfolio site", // used to group by the project
  "to":"sendeemail@gmail.com",
  "from":"senderemail@gmail.com",
  "subject":"It's sunny outside",
  "text":"Touching grass would be awesome today",
  "persist":true, // persist to deno kx
  "tg":true // forward to telegram
  
}
```



````json5
// GET /messages/tg
// query
{
  "clientName":"portfolio site", // optional: used to group by the project
  "sent":"success" // optional; "success" | "failed"
}
```
```

```json5
// POST /messages/tg
// body
{
  "data":"SENDING MESSAGE TO",
  "type":"TELEGRAM MESSAGE SENT",
  "clientName":"thunder client",
  "persist":true
  }
```
