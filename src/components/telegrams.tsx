import { FC } from "hono/jsx";
import { Layout } from "@/components/layout.tsx";
import { getTelegramFromKV, SaveTelegramToKv } from "@/db/telegram-kv.ts";
import { formatDate } from "@/utils/dat.ts";
import { Hono } from "hono";
import { AppBindings } from "@/lib/hono/types.ts";


interface TelegramMessagesProps {
  telegrams: {
    key: Deno.KvKey;
    value: string;
    versionstamp: string;
  }[];
}


const tgMessageHtmlRoute = new Hono<AppBindings>();

tgMessageHtmlRoute.get("/", async (c) => {
const { clientName, sent} = c.req.query()
  try {
    const msgs = await getTelegramFromKV({
      clientName: clientName,
      sent: sent as "success" | "failed",
      type: "telegram",
    });
    return c.html(<TelegramMessages telegrams={msgs} />);
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

export {tgMessageHtmlRoute};





export const TelegramMessages: FC<TelegramMessagesProps> = (props) => {
  // Function to safely parse JSON
  const parseTelegramValue = (jsonString: string): SaveTelegramToKv => {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Error parsing telegram data:", e);
      return {
        type: "telegram",
        data: "Unknown content",
        clientName: "unknown",
        sent: "failed",
      };
    }
  };

  return (
    <Layout title="Telegram Messages" isAuthenticated>
      <div class="telegram-container">
        <h1 class="telegram-title">
          <span class="telegram-icon">📱</span> Telegram Messages
        </h1>

        {props.telegrams.length === 0 ? (
          <div class="no-telegrams">
            <p>No telegram messages found</p>
          </div>
        ) : (
          <div class="telegram-list">
            {props.telegrams.map((message) => {
              const telegramData = parseTelegramValue(message.value);
              const status = telegramData.sent || "unknown";

              return (
                <div class={`telegram-card ${status}`} key={message.versionstamp}>
                  <div class="telegram-header">
                    <h3 class="telegram-type">
                      <span class="event-icon">🚀</span> {telegramData.type}
                    </h3>
                    <span class={`status-badge ${status}`}>{status}</span>
                  </div>

                  <div class="telegram-content">
                    <pre>{telegramData.data}</pre>
                  </div>

                  <div class="telegram-footer">
                    <div class="telegram-info">
                      <div class="telegram-field">
                        <span class="field-label">Client:</span>
                        <span class="field-value">{telegramData.clientName}</span>
                      </div>
                    </div>
                    <div class="telegram-meta">
                      <span class="telegram-time">
                        <span class="time-icon">🕒</span> {formatDate(message.key)}
                      </span>
                    </div>
                  </div>

                  {telegramData.issue && (
                    <div class="telegram-error">
                      <p class="error-message">
                        <span class="error-icon">❌</span> {telegramData.issue}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .telegram-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        
        .telegram-title {
          font-size: 28px;
          margin-bottom: 25px;
          color: #0088cc; /* Telegram blue */
          border-bottom: 2px solid #eaeaea;
          padding-bottom: 10px;
          display: flex;
          align-items: center;
        }
        
        .telegram-icon {
          margin-right: 10px;
        }
        
        .no-telegrams {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 40px;
          text-align: center;
          color: #6c757d;
          font-size: 18px;
          border: 1px dashed #dee2e6;
        }
        
        .telegram-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .telegram-card {
          background-color: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
          border-left: 4px solid #0088cc; /* Telegram blue */
          transition: transform 0.2s ease;
        }
        
        .telegram-card:hover {
          transform: translateY(-2px);
        }
        
        .telegram-card.success {
          border-left-color: #28a745;
        }
        
        .telegram-card.failed {
          border-left-color: #dc3545;
        }
        
        .telegram-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .telegram-type {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #333;
          display: flex;
          align-items: center;
        }
        
        .event-icon {
          margin-right: 8px;
        }
        
        .status-badge {
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          font-weight: bold;
          letter-spacing: 0.5px;
        }
        
        .status-badge.success {
          background-color: #d4edda;
          color: #155724;
        }
        
        .status-badge.failed {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .status-badge.unknown {
          background-color: #e2e3e5;
          color: #383d41;
        }
        
        .telegram-content {
          background-color: #f7f9fb;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
          border: 1px solid #eaeaea;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .telegram-content pre {
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 14px;
          color: #212529;
        }
        
        .telegram-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #6c757d;
        }
        
        .telegram-info {
          flex: 1;
        }
        
        .telegram-field {
          font-size: 14px;
          display: flex;
          align-items: center;
        }
        
        .field-label {
          color: #6c757d;
          margin-right: 5px;
          font-weight: 500;
        }
        
        .field-value {
          color: #495057;
        }
        
        .telegram-meta {
          text-align: right;
        }
        
        .telegram-time {
          color: #6c757d;
          font-size: 14px;
          display: flex;
          align-items: center;
        }
        
        .time-icon {
          margin-right: 5px;
        }
        
        .telegram-error {
          background-color: #fff8f8;
          border-radius: 8px;
          padding: 12px 15px;
          margin-top: 15px;
          border: 1px solid #f8d7da;
        }
        
        .error-message {
          color: #721c24;
          margin: 0;
          font-size: 14px;
          display: flex;
          align-items: center;
        }
        
        .error-icon {
          margin-right: 8px;
        }
        
        @media (max-width: 768px) {
          .telegram-footer {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .telegram-meta {
            text-align: left;
            margin-top: 10px;
          }
        }
      `}</style>
    </Layout>
  );
};
