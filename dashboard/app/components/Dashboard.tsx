"use client";
import { useState } from "react";
import type { DashboardData } from "@/lib/types";
import EarlyAdoptersTab from "./EarlyAdoptersTab";
import FoundingRepsTab from "./FoundingRepsTab";

type Tab = "early" | "reps";

export default function Dashboard({ data }: { data: DashboardData }) {
  const [tab, setTab] = useState<Tab>("early");

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/compass.png" alt="TradesBrain" width={36} height={36} className="h-9 w-9" />
            <div>
              <div className="text-sm font-extrabold leading-tight text-navy">
                TradesBrain · Internal Dashboard
              </div>
              <div className="text-xs text-slate-500">Signup analysis · read-only · local only</div>
            </div>
          </div>
          <form action="/logout" method="post">
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-navy transition hover:bg-tint">
              Sign out
            </button>
          </form>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-1 px-4 sm:px-6">
          <TabButton active={tab === "early"} onClick={() => setTab("early")}>
            Early Adopters
            <Count n={data.earlyAdopters.length} />
          </TabButton>
          <TabButton active={tab === "reps"} onClick={() => setTab("reps")}>
            Founding Rep Applications
            <Count n={data.foundingReps.length} />
          </TabButton>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {data.demo && (
          <Banner tone="amber">
            <strong>Demo data.</strong> No Supabase credentials detected — showing built-in
            sample rows. Add <code className="rounded bg-black/5 px-1">SUPABASE_URL</code> and{" "}
            <code className="rounded bg-black/5 px-1">SUPABASE_SERVICE_ROLE_KEY</code> to{" "}
            <code className="rounded bg-black/5 px-1">.env.local</code> (and set{" "}
            <code className="rounded bg-black/5 px-1">DASHBOARD_DEMO=0</code>) to read live data.
          </Banner>
        )}
        {data.error && (
          <Banner tone="red">
            <strong>Couldn&apos;t load live data.</strong> {data.error}
          </Banner>
        )}

        {tab === "early" ? (
          <EarlyAdoptersTab rows={data.earlyAdopters} />
        ) : (
          <FoundingRepsTab rows={data.foundingReps} />
        )}
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-10 pt-2 text-center text-xs text-slate-400 sm:px-6">
        Holds personal data (names, emails, phone, licence / VAT numbers). Run locally only —
        never deploy, never commit your <code>.env</code>.
      </footer>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition ${
        active
          ? "border-blue text-navy"
          : "border-transparent text-slate-500 hover:text-navy"
      }`}
    >
      {children}
    </button>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-600">
      {n}
    </span>
  );
}

function Banner({ tone, children }: { tone: "amber" | "red"; children: React.ReactNode }) {
  const cls =
    tone === "amber"
      ? "border-amber-300 bg-amber-50 text-amber-900"
      : "border-red-300 bg-red-50 text-red-900";
  return <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${cls}`}>{children}</div>;
}
