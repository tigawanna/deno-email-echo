import { FC } from "hono/jsx";
import { Layout } from "@/components/layout.tsx";
import { Hono } from "hono";
import { AppBindings } from "@/lib/hono/types.ts";
import { getCookie } from "hono/cookie";

const listRoute = new Hono<AppBindings>();

listRoute.get("/", (c) => {
      const authToken = getCookie(c, "auth_token");
      const isAuthenticated = !!authToken;
  return c.html(<DashboardList isAuthenticated={isAuthenticated} />);
});

export { listRoute };

export const DashboardList: FC<{ isAuthenticated: boolean }> = ({isAuthenticated}) => {
  return (
    <Layout title="Message Dashboard" isAuthenticated={isAuthenticated}>
      <div class="dashboard-container">
        <h1 class="dashboard-title">Message Dashboard</h1>

        <div class="dashboard-cards">
          <a href="/message/email/html" class="dashboard-card email-card">
            <div class="card-icon">📧</div>
            <div class="card-content">
              <h2 class="card-title">Email Messages</h2>
              <p class="card-description">View all email messages sent through the system</p>
            </div>
            <div class="card-arrow">→</div>
          </a>

          <a href="/message/tg/html" class="dashboard-card telegram-card">
            <div class="card-icon">📱</div>
            <div class="card-content">
              <h2 class="card-title">Telegram Messages</h2>
              <p class="card-description">View all notifications sent to Telegram</p>
            </div>
            <div class="card-arrow">→</div>
          </a>
        </div>

        <div class="dashboard-footer">
          <p>Select a message type to view details</p>
        </div>
      </div>

      <style>{`
        .dashboard-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .dashboard-title {
          font-size: 32px;
          margin-bottom: 30px;
          color: #333;
          text-align: center;
        }
        
        .dashboard-cards {
          display: flex;
          flex-wrap: wrap;
          gap: 30px;
          justify-content: center;
        }
        
        .dashboard-card {
          display: flex;
          align-items: center;
          background: white;
          border-radius: 10px;
          padding: 25px;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          text-decoration: none;
          color: inherit;
          position: relative;
          overflow: hidden;
        }
        
        .dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }
        
        .email-card {
          border-left: 5px solid #0275d8;
        }
        
        .telegram-card {
          border-left: 5px solid #0088cc;
        }
        
        .card-icon {
          font-size: 36px;
          margin-right: 20px;
          flex-shrink: 0;
        }
        
        .card-content {
          flex: 1;
        }
        
        .card-title {
          font-size: 20px;
          margin: 0 0 5px 0;
          color: #333;
        }
        
        .card-description {
          font-size: 14px;
          color: #666;
          margin: 0;
        }
        
        .card-arrow {
          font-size: 24px;
          opacity: 0.3;
          margin-left: 15px;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        
        .dashboard-card:hover .card-arrow {
          opacity: 0.8;
          transform: translateX(5px);
        }
        
        .dashboard-footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .dashboard-cards {
            flex-direction: column;
            align-items: center;
          }
          
          .dashboard-card {
            max-width: 100%;
          }
        }
      `}</style>
    </Layout>
  );
};
