import type { User, Session } from "@supabase/supabase-js";

export interface SupabaseUser extends User {}
export interface SupabaseSession extends Session {}

export interface AuthResponse {
  user: SupabaseUser | null;
  session: SupabaseSession | null;
  error?: {
    message: string;
    status?: number;
  } | null;
}
