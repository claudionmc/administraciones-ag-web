import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function clientAccessEnabled() {
  return process.env.CLIENT_ACCESS_ENABLED === "true" &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export async function createClient() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" },
      cookies: {
        getAll: () => store.getAll(),
        setAll(values) {
          try {
            values.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            // Server Components cannot write cookies; proxy refreshes the session.
          }
        },
      },
    },
  );
}
