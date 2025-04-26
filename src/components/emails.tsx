import { FC } from "hono/jsx";
import { Layout } from "@/components/layout.tsx";


interface EmailMessagesProps {
  messages: string[];
}

export const EmailMessages: FC<{ messages: string[] }> = (props: { messages: string[] }) => {
  return (
    <Layout title="email list">
      <section>
        <h1>Hello Hono!</h1>
        <ul>
          {props.messages.map((message) => {
            return <li key={message}>{message}!!</li>;
          })}
        </ul>
      </section>
    </Layout>
  );
};
