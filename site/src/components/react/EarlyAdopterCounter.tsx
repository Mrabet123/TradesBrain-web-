import { useEffect, useState } from "react";

/**
 * Early-adopter scarcity counter — "X of 200 spots left".
 *
 * The number is REAL, never faked (Neuromarketing Playbook §6: no fake
 * scarcity). It reads the live signup count from Supabase via the
 * `early_adopter_count` RPC (which returns only an aggregate — never rows,
 * so no emails are exposed). It re-reads when a signup happens on the page
 * (the form dispatches the `early-adopter:signup` event).
 */
interface Props {
  total: number;
  offer: string;
  supabaseUrl: string;
  anonKey: string;
}

export default function EarlyAdopterCounter({
  total,
  offer,
  supabaseUrl,
  anonKey,
}: Props) {
  const [claimed, setClaimed] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/rpc/early_adopter_count`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
          body: "{}",
        });
        if (!res.ok) return;
        const value = await res.json();
        if (alive && typeof value === "number") setClaimed(value);
      } catch {
        // Leave claimed null — we show the full total rather than a fake number.
      }
    }

    load();
    const onSignup = () => load();
    window.addEventListener("early-adopter:signup", onSignup);
    return () => {
      alive = false;
      window.removeEventListener("early-adopter:signup", onSignup);
    };
  }, [supabaseUrl, anonKey]);

  const known = claimed ?? 0;
  const left = Math.max(total - known, 0);
  const pct = Math.min(Math.round((known / total) * 100), 100);

  return (
    <div className="rounded-2xl border border-blue/20 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <span className="block text-5xl font-extrabold tracking-tight text-navy tabular-nums">
            {left}
          </span>
          <span className="text-sm font-semibold uppercase tracking-wide text-body">
            of {total} founding spots left
          </span>
        </div>
        <span className="rounded-full bg-tint px-4 py-1.5 text-sm font-bold text-blue">
          {offer}
        </span>
      </div>

      <div
        className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-tint"
        role="progressbar"
        aria-valuenow={known}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${known} of ${total} founding spots claimed`}
      >
        <div
          className="h-full rounded-full bg-blue transition-[width] duration-700"
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-body">
        First {total} pros get {offer}. Founding members shape what Rex becomes.
      </p>
    </div>
  );
}
