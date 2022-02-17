import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useFetcher,
} from "remix";
import { useEffect } from "react";
import supabase from "~/utils/supabase";

import styles from "~/styles/app.css";

export function meta() {
  return { title: "New Remix App" };
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const loader = () => {
  return {
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY,
    },
  };
};

export default function App() {
  const { env } = useLoaderData();
  const fetcher = useFetcher();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        console.log("signing in");
        // call /auth/login
        fetcher.submit(
          {
            accessToken: session.access_token,
          },
          {
            method: "post",
            action: "/auth/login",
          }
        );
      }
    });
  }, []);
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(env)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}
