// Server-only data access. Uses the Supabase service-role key, which bypasses
// Row Level Security so the dashboard can read the PII tables. This module must
// only ever be imported from server components / server code — the key must
// never reach the browser.
import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { DashboardData, EarlyAdopter, FoundingRep } from "./types";
import { sampleEarlyAdopters, sampleFoundingReps } from "./sample-data";

export function isDemoMode(): boolean {
  if (process.env.DASHBOARD_DEMO === "1") return true;
  return !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function serverClient() {
  return createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      // Next.js caches fetch() by default in the App Router, which would make
      // the dashboard show stale counts until a restart. Force every Supabase
      // request to bypass that cache so we always read live data.
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    }
  );
}

export async function getDashboardData(): Promise<DashboardData> {
  if (isDemoMode()) {
    return {
      demo: true,
      error: null,
      earlyAdopters: sampleEarlyAdopters,
      foundingReps: sampleFoundingReps,
    };
  }

  try {
    const supabase = serverClient();
    const [ea, fr] = await Promise.all([
      supabase
        .from("early_adopters")
        .select("id,name,email,trade,state,user_type,source,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("founding_rep_applications")
        .select(
          "id,full_name,email,phone,vat_number,trade,state_region,licence_number,years_in_trade,why_text,source,created_at"
        )
        .order("created_at", { ascending: false }),
    ]);

    if (ea.error) throw new Error(`early_adopters: ${ea.error.message}`);
    if (fr.error) throw new Error(`founding_rep_applications: ${fr.error.message}`);

    return {
      demo: false,
      error: null,
      earlyAdopters: (ea.data ?? []) as EarlyAdopter[],
      foundingReps: (fr.data ?? []) as FoundingRep[],
    };
  } catch (err) {
    return {
      demo: false,
      error: err instanceof Error ? err.message : "Failed to load data from Supabase.",
      earlyAdopters: [],
      foundingReps: [],
    };
  }
}
