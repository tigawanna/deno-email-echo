import { FC } from "hono/jsx";
import { Layout } from "@/components/layout.tsx";
import { getEmailFromKV, SaveEmailToKv } from "@/db/email-kv.ts";
import { formatDate } from "@/utils/dat.ts";
import { Hono } from "hono";
import { AppBindings } from "@/lib/hono/types.ts";

interface EmailMessagesProps {
  emails: {
    key: Deno.KvKey;
    value: string;
    versionstamp: string;
  }[];
}

const emailMessageHtmlRoute = new Hono<AppBindings>();

emailMessageHtmlRoute.get("/", async (c) => {
const { clientName, sent, subject, from } = c.req.query()
  try {
    const emails = await getEmailFromKV({
      clientName: clientName,
      sent: sent as "success" | "failed",
      subject: subject,
      from: from,
      type: "email",
    });
    return c.html(<EmailMessages emails={emails} />);
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

export {emailMessageHtmlRoute};



export const EmailMessages: FC<EmailMessagesProps> = (props) => {
  const parseEmailValue = (jsonString: string): SaveEmailToKv => {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Error parsing email data:", e);
      return {
        type: "email",
        clientName: "unknown",
        from: "unknown",
        to: "unknown",
        subject: "Error parsing email",
        text: "Could not parse email data",
        sent: "failed"
      };
    }
  };



  return (
    <Layout title="Email Messages">
      <div class="email-container">
        <h1 class="email-title">
          <span class="email-icon">📧</span> Email Messages
        </h1>

        {props.emails.length === 0 ? (
          <div class="no-emails">
            <p>No emails found</p>
          </div>
        ) : (
          <div class="email-list">
            {props.emails.map((message) => {
              const emailData = parseEmailValue(message.value);
              const status = emailData.sent || 'unknown';
              
              return (
                <div class={`email-card ${status}`} key={message.versionstamp}>
                  <div class="email-header">
                    <h3 class="email-subject">{emailData.subject}</h3>
                    <span class={`status-badge ${status}`}>
                      {status}
                    </span>
                  </div>

                  <div class="email-details">
                    <div class="email-info">
                      <div class="email-field">
                        <span class="field-label">From:</span>
                        <span class="field-value">{emailData.from}</span>
                      </div>
                      <div class="email-field">
                        <span class="field-label">To:</span>
                        <span class="field-value">{emailData.to}</span>
                      </div>
                      <div class="email-field">
                        <span class="field-label">Client:</span>
                        <span class="field-value">{emailData.clientName}</span>
                      </div>
                    </div>
                    <div class="email-meta">
                      <span class="email-time">{formatDate(message.key)}</span>
                    </div>
                  </div>
                  
                  {emailData.text && (
                    <div class="email-content">
                      <p class="email-text">{emailData.text.length > 200 
                        ? `${emailData.text.substring(0, 200)}...` 
                        : emailData.text}
                      </p>
                    </div>
                  )}
                  
                  {emailData.issue && (
                    <div class="email-error">
                      <p class="error-message">
                        <span class="error-icon">❌</span> {emailData.issue}
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
        .email-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        
        .email-title {
          font-size: 28px;
          margin-bottom: 25px;
          color: #333;
          border-bottom: 2px solid #eaeaea;
          padding-bottom: 10px;
          display: flex;
          align-items: center;
        }
        
        .email-icon {
          margin-right: 10px;
        }
        
        .no-emails {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 40px;
          text-align: center;
          color: #6c757d;
          font-size: 18px;
        }
        
        .email-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .email-card {
          background-color: #fff;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          border-left: 4px solid #ddd;
        }
        
        .email-card.success {
          border-left-color: #28a745;
        }
        
        .email-card.failed {
          border-left-color: #dc3545;
        }
        
        .email-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .email-subject {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
        
        .status-badge {
          font-size: 12px;
          padding: 3px 8px;
          border-radius: 12px;
          text-transform: uppercase;
          font-weight: bold;
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
        
        .email-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        
        .email-info {
          flex: 1;
        }
        
        .email-field {
          margin-bottom: 6px;
          font-size: 14px;
        }
        
        .field-label {
          color: #6c757d;
          width: 55px;
          display: inline-block;
        }
        
        .field-value {
          color: #495057;
        }
        
        .email-meta {
          text-align: right;
        }
        
        .email-time {
          color: #6c757d;
          font-size: 13px;
        }
        
        .email-content {
          background-color: #f8f9fa;
          border-radius: 4px;
          padding: 12px;
          margin: 10px 0;
          border: 1px solid #eaeaea;
        }
        
        .email-text {
          margin: 0;
          font-size: 14px;
          color: #495057;
          white-space: pre-line;
        }
        
        .email-error {
          background-color: #fff8f8;
          border-radius: 4px;
          padding: 10px 12px;
          margin-top: 8px;
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
          .email-details {
            flex-direction: column;
          }
          
          .email-meta {
            text-align: left;
            margin-top: 8px;
          }
        }
      `}</style>
    </Layout>
  );
};
