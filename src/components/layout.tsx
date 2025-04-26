import type { FC, JSX, JSXNode, PropsWithChildren, ReactElement } from "hono/jsx";
import { css, cx, keyframes, Style } from "hono/css";

const globalClass = css`
  :-hono-global {
    html {
      font-family: Arial, Helvetica, sans-serif;
    }
  }
`;

interface LayoutProps {
  title: string;
}

export function Layout({ title, children }: PropsWithChildren<LayoutProps>) {
  return (
    <html>
      <head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
        <link rel="stylesheet" href="/styles.css" />
        <Style>{globalClass}</Style>
      </head>
      <body>{children}</body>
    </html>
  );
}
