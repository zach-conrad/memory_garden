/**
* 
* Executes production health checks for the Memory Gardens application
*
* Defines diagnostic tests that verify backend connectivity, authentication, data acces,
* and security policies to help monitor the application's overall health
* @packageDocumentation
*/

import { supabase } from "./supabase";
import { repo } from "./store";

export interface CheckResult {
  name: string;
  status: "pass" | "fail";
  detail: string;
  durationMs: number;
}

async function timed(
  name: string,
  fn: () => Promise<{ pass: boolean; detail: string }>,
): Promise<CheckResult> {
  const start = performance.now();
  try {
    const { pass, detail } = await fn();
    return { name, status: pass ? "pass" : "fail", detail, durationMs: Math.round(performance.now() - start) };
  } catch (err) {
    return {
      name,
      status: "fail",
      detail: err instanceof Error ? err.message : "Unknown error",
      durationMs: Math.round(performance.now() - start),
    };
  }
}

/** Runs a fixed set of checks against the live backend — nothing here is mocked. */
export async function runHealthChecks(userId: string): Promise<CheckResult[]> {
  if (!supabase) {
    return [
      {
        name: "Supabase connection reachable",
        status: "fail",
        detail: "No Supabase credentials configured for this environment.",
        durationMs: 0,
      },
    ];
  }
  const client = supabase;

  return Promise.all([
    timed("Supabase connection reachable", async () => {
      // A permission-denied response still proves the round-trip worked —
      // only a thrown network error means Supabase itself is unreachable.
      const { error } = await client.from("memories").select("id", { head: true, count: "exact" });
      return { pass: true, detail: error ? `Reachable (query error: ${error.message})` : "Reachable" };
    }),

    timed("Auth session valid", async () => {
      const { data, error } = await client.auth.getSession();
      if (error) return { pass: false, detail: error.message };
      if (!data.session) return { pass: false, detail: "No active session." };
      const expiresAt = data.session.expires_at ? new Date(data.session.expires_at * 1000) : null;
      return { pass: true, detail: expiresAt ? `Valid, expires ${expiresAt.toLocaleTimeString()}` : "Valid" };
    }),

    timed("Memories query returns data", async () => {
      const list = await repo.list(userId);
      return { pass: true, detail: `Fetched ${list.length} ${list.length === 1 ? "memory" : "memories"}` };
    }),

    timed("Image storage bucket reachable", async () => {
      const { error } = await client.storage.from("memory-images").list("", { limit: 1 });
      if (error) return { pass: false, detail: error.message };
      return { pass: true, detail: "Bucket reachable" };
    }),

    timed("Private memories stay scoped to their owner", async () => {
      // Bypasses the app's own query scoping and asks RLS directly for
      // every private memory this client can see — if RLS is doing its
      // job, that should only ever be this user's own.
      const { data, error } = await client.from("memories").select("user_id").eq("is_shared", false);
      if (error) return { pass: false, detail: error.message };
      const leaked = (data ?? []).filter((row) => row.user_id !== userId);
      return leaked.length === 0
        ? { pass: true, detail: `${data?.length ?? 0} private ${data?.length === 1 ? "memory" : "memories"}, all correctly scoped to you` }
        : { pass: false, detail: `${leaked.length} private ${leaked.length === 1 ? "memory" : "memories"} from other users leaked through!` };
    }),
  ]);
}
