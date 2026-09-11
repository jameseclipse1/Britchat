import { createBrowserClient } from "@supabase/ssr";

// Browser-side client, used only for the auth session; all data reads/writes
// that matter go through Server Actions so RLS is enforced consistently.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
