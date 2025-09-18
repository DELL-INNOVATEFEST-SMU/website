import { createClient } from "@supabase/supabase-js";

// Vite envs: define these in .env
// VITE_SUPABASE_URL=...
// VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  {
    auth: {
      // Persist session across reloads; auto-refresh tokens
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "interstellar-auth", // unique key to avoid collisions
    },
    // Functions invoked with supabase.functions.invoke will
    // auto-attach the current session's access token under the hood.
  }
);
