import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Supabase client, or `null` when env vars are absent.
 *
 * Per the project plan, the app runs local-first (Milestone 1) and the
 * cloud layer plugs in for Milestone 2 simply by filling out `.env`.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
