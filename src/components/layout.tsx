import type { FC, JSX, JSXNode, PropsWithChildren, ReactElement } from "hono/jsx";
import { css, cx, keyframes, Style } from "hono/css";

const globalClass = css`
  :-hono-global {
    html {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
      color: #333;
    }
  }
`;

const headerStyles = css`
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const containerStyles = css`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const titleStyles = css`
  font-size: 22px;
  font-weight: 600;
  color: #333;
  padding: 15px 0;
  margin: 0;
`;

const navStyles = css`
  ul {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  li {
    margin-left: 20px;
  }
  
  a {
    text-decoration: none;
    color: #555;
    padding: 10px 5px;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
    display: block;
    font-weight: 500;
    font-size: 15px;
  }
  
  a:hover {
    color: #0275d8;
    border-bottom: 2px solid #0275d8;
  }
  
  a.active {
    color: #0275d8;
    border-bottom: 2px solid #0275d8;
    font-weight: 600;
  }
  
  @media (max-width: 768px) {
    ul {
      padding: 10px 0;
    }
    
    li {
      margin-left: 15px;
    }
    
    a {
      font-size: 14px;
      padding: 5px;
    }
  }
`;

const authButtonStyles = css`
  background-color: #0275d8;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-decoration: none;
  
  &:hover {
    background-color: #025aa5;
  }
`;

interface LayoutProps {
  title: string;
  isAuthenticated?: boolean;
}

export function Layout({ title, isAuthenticated = false, children }: PropsWithChildren<LayoutProps>) {
  return (
    <html>
      <head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
        <link rel="stylesheet" href="/styles.css" />
        <Style>{globalClass}</Style>
      </head>
      <body>
        <header class={headerStyles}>
          <div class={containerStyles}>
            <h1 class={titleStyles}>{title}</h1>
            <nav class={navStyles}>
              <ul>
                <li><a href="/" class="active">Home</a></li>
                
                {isAuthenticated && (
                  <>
                    <li><a href="/messages/email/html">Email Messages</a></li>
                    <li><a href="/messages/tg/html">Telegram Messages</a></li>
                  </>
                )}
                
                {isAuthenticated ? (
                  <li><a href="/logout" class={authButtonStyles}>Logout</a></li>
                ) : (
                  <li><a href="/login" class={authButtonStyles}>Login</a></li>
                )}
              </ul>
            </nav>
          </div>
        </header>
        
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
