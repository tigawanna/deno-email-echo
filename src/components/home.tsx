import { FC } from "hono/jsx";
import { Layout } from "@/components/layout.tsx";
import { Hono } from "hono";
import { AppBindings } from "@/lib/hono/types.ts";
import { getCookie } from "hono/cookie";

const homeRoute = new Hono<AppBindings>();

homeRoute.get("/", (c) => {
  // Check if auth_token cookie exists
  const authToken = getCookie(c, 'auth_token');
  const isLoggedIn = !!authToken;
  
  return c.html(<HomePage isLoggedIn={isLoggedIn} />);
});

export { homeRoute };

interface HomePageProps {
  isLoggedIn: boolean;
}

export const HomePage: FC<HomePageProps> = ({ isLoggedIn }) => {
  return (
    <Layout title="Message API Dashboard" isAuthenticated={isLoggedIn}>
      <div class="home-container">
        <div class="home-header">
          <h1 class="home-title">Message API Dashboard</h1>
          <p class="home-subtitle">Monitor and manage your email and Telegram messages</p>
        </div>
        
        {isLoggedIn ? (
          <div class="home-content">
            <div class="dashboard-cards">
              <a href="/messages/email/html" class="dashboard-card email-card">
                <div class="card-icon">📧</div>
                <div class="card-content">
                  <h2 class="card-title">Email Messages</h2>
                  <p class="card-description">View all email messages sent through the system</p>
                </div>
                <div class="card-arrow">→</div>
              </a>
              
              <a href="/messages/tg/html" class="dashboard-card telegram-card">
                <div class="card-icon">📱</div>
                <div class="card-content">
                  <h2 class="card-title">Telegram Messages</h2>
                  <p class="card-description">View all notifications sent to Telegram</p>
                </div>
                <div class="card-arrow">→</div>
              </a>
            </div>
          </div>
        ) : (
          <div class="home-unauthenticated">
            <div class="auth-card">
              <div class="auth-icon">🔒</div>
              <h2 class="auth-title">Authentication Required</h2>
              <p class="auth-message">
                You need to log in to access the message dashboard
              </p>
              <a href="/login" class="login-button">
                Log In <span class="button-icon">→</span>
              </a>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .home-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .home-header {
          text-align: center;
          margin-bottom: 50px;
        }
        
        .home-title {
          font-size: 36px;
          font-weight: 700;
          color: #333;
          margin-bottom: 10px;
        }
        
        .home-subtitle {
          font-size: 18px;
          color: #666;
        }
        
        /* Cards for authenticated users */
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
        
        /* Unauthenticated view */
        .home-unauthenticated {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
        }
        
        .auth-card {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          padding: 40px 30px;
          text-align: center;
          max-width: 400px;
          width: 100%;
        }
        
        .auth-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        
        .auth-title {
          font-size: 24px;
          color: #333;
          margin-bottom: 15px;
        }
        
        .auth-message {
          color: #666;
          margin-bottom: 25px;
        }
        
        .login-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 12px 30px;
          background-color: #0275d8;
          color: white;
          font-size: 16px;
          font-weight: 500;
          border-radius: 5px;
          text-decoration: none;
          transition: background-color 0.2s ease;
        }
        
        .login-button:hover {
          background-color: #025aa5;
        }
        
        .button-icon {
          margin-left: 8px;
        }
        
        @media (max-width: 768px) {
          .dashboard-cards {
            flex-direction: column;
            align-items: center;
          }
          
          .dashboard-card {
            max-width: 100%;
          }
          
          .home-title {
            font-size: 28px;
          }
          
          .home-subtitle {
            font-size: 16px;
          }
        }
      `}</style>
    </Layout>
  );
};
