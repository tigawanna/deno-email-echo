import { FC } from "hono/jsx";
import { Layout } from "@/components/layout.tsx";
import { Hono } from "hono";
import { AppBindings } from "@/lib/hono/types.ts";
import { setCookie } from "hono/cookie";

const loginRoute = new Hono<AppBindings>();

// Handle the login form GET request
loginRoute.get("/", (c) => {
  return c.html(<LoginForm error={null} />);
});

// Handle the login form POST request
loginRoute.post("/", async (c) => {
  const { token } = await c.req.parseBody();
  
  if (!token || typeof token !== 'string') {
    return c.html(<LoginForm error="Please enter a valid token" />);
  }
  
  // You might want to validate the token here against a list of valid tokens
  // For now, we'll accept any non-empty token
  
  // Set the token as a secure cookie
  setCookie(c, 'auth_token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'Strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
  
  // Redirect to the lists page
  return c.redirect('/');
});

export { loginRoute };

// Login form component
interface LoginFormProps {
  error: string | null;
}

export const LoginForm: FC<LoginFormProps> = ({ error }) => {
  return (
    <Layout title="Login">
      <div class="login-container">
        <div class="login-card">
          <h1 class="login-title">
            <span class="login-icon">🔐</span> API Access
          </h1>
          
          {error && (
            <div class="error-alert">
              <span class="error-icon">⚠️</span> {error}
            </div>
          )}
          
          <form method="post" class="login-form">
            <div class="form-group">
              <label for="token" class="form-label">Authentication Token</label>
              <input 
                type="password" 
                id="token" 
                name="token" 
                class="form-input" 
                placeholder="Enter your access token" 
                required 
                autofocus
              />
            </div>
            
            <div class="form-actions">
              <button type="submit" class="login-button">
                Login <span class="button-icon">→</span>
              </button>
            </div>
          </form>
          
          <div class="login-footer">
            <p class="help-text">Please enter your API token to access the dashboard.</p>
          </div>
        </div>
      </div>
      
      <style>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 80vh;
          padding: 20px;
        }
        
        .login-card {
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          width: 100%;
          max-width: 420px;
          padding: 30px;
        }
        
        .login-title {
          display: flex;
          align-items: center;
          font-size: 24px;
          color: #333;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f0f0f0;
        }
        
        .login-icon {
          margin-right: 10px;
        }
        
        .error-alert {
          background-color: #fff8f8;
          border-left: 3px solid #dc3545;
          padding: 12px 15px;
          margin-bottom: 20px;
          border-radius: 4px;
          color: #721c24;
          font-size: 14px;
          display: flex;
          align-items: center;
        }
        
        .error-icon {
          margin-right: 8px;
        }
        
        .login-form {
          margin-bottom: 20px;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #495057;
        }
        
        .form-input {
          display: block;
          width: 100%;
          padding: 12px 15px;
          font-size: 16px;
          line-height: 1.5;
          color: #495057;
          background-color: #fff;
          background-clip: padding-box;
          border: 1px solid #ced4da;
          border-radius: 4px;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        
        .form-input:focus {
          border-color: #80bdff;
          outline: 0;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
        
        .form-actions {
          margin-top: 25px;
        }
        
        .login-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 12px 20px;
          font-size: 16px;
          font-weight: 500;
          color: #fff;
          background-color: #0275d8;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .login-button:hover {
          background-color: #025aa5;
        }
        
        .button-icon {
          margin-left: 8px;
        }
        
        .login-footer {
          margin-top: 25px;
          padding-top: 15px;
          border-top: 1px solid #f0f0f0;
          text-align: center;
        }
        
        .help-text {
          font-size: 14px;
          color: #6c757d;
          margin: 0;
        }
      `}</style>
    </Layout>
  );
};
