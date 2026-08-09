import { createClient } from "@supabase/supabase-js";

/**
 * Anon-key client: relies on RLS ("public read published articles") to
 * scope what it can see. Safe to use from server components that render
 * public pages.
 */
export function getPublicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase public env vars");
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
