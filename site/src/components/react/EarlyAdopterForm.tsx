import { useState } from "react";

/**
 * Early Adopter signup (Founding Rep page · Offer 2).
 *
 * Separate from the Founding Rep application in Offer 1 — its own component,
 * its own submission path, its own store. It writes a structured record to the
 * Supabase `early_adopters` table (not just an email) so signups can be capped
 * at 200 by order and prioritised at launch. Email uniqueness is enforced by a
 * case-insensitive index; a duplicate comes back as a 409 we turn into the
 * "already on the list" message.
 *
 * On success it dispatches `early-adopter:signup` so the live counter re-reads
 * the real remaining-spots number.
 */
interface Props {
  supabaseUrl: string;
  anonKey: string;
  /** Which page/CTA the signup came from. */
  source?: string;
}

const TRADES = ["Plumbing", "Electrical", "HVAC", "Roofing", "Other"];
const USER_TYPES = ["Solo Pro", "Crew / Team Owner", "Apprentice"];
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

const MESSAGES = {
  empty: "Please fill in this field to claim your spot.",
  email: "That email doesn't look right — check it so we can send your offer.",
  duplicate:
    "You're already on the list — your spot is safe. We'll be in touch at launch.",
  generic:
    "Something went wrong on our end. Give it another try in a moment.",
};

const NAME_RE = /^[\p{L}][\p{L}\s'-]*$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<
  Record<"name" | "email" | "trade" | "state" | "user_type" | "form", string>
>;

export default function EarlyAdopterForm({ supabaseUrl, anonKey, source }: Props) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  function validate(data: Record<string, string>): Errors {
    const e: Errors = {};
    if (!data.name.trim() || data.name.trim().length < 2 || !NAME_RE.test(data.name.trim()))
      e.name = MESSAGES.empty;
    if (!data.email.trim()) e.email = MESSAGES.empty;
    else if (!EMAIL_RE.test(data.email.trim())) e.email = MESSAGES.email;
    if (!data.trade) e.trade = MESSAGES.empty;
    if (!data.state) e.state = MESSAGES.empty;
    if (!data.user_type) e.user_type = MESSAGES.empty;
    return e;
  }

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (busy) return;

    const f = new FormData(ev.currentTarget);
    const data = {
      name: String(f.get("name") || "").trim(),
      email: String(f.get("email") || "").trim().toLowerCase(),
      trade: String(f.get("trade") || ""),
      state: String(f.get("state") || ""),
      user_type: String(f.get("user_type") || ""),
    };

    const found = validate(data);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setErrors({});
    setBusy(true);
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/early_adopters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ ...data, source: source || "founding-rep/offer-2" }),
      });

      if (res.status === 409) {
        setErrors({ form: MESSAGES.duplicate });
        return;
      }
      if (!res.ok) {
        setErrors({ form: MESSAGES.generic });
        return;
      }

      window.dispatchEvent(new Event("early-adopter:signup"));
      setSent(true);
    } catch {
      setErrors({ form: MESSAGES.generic });
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-navy placeholder:text-body/50 focus:border-blue focus:outline-none";
  const label = "block text-sm font-semibold text-navy mb-1.5";
  const errText = "mt-1.5 text-sm font-medium text-danger";

  if (sent) {
    return (
      <div className="rounded-2xl border border-success/30 bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <h3 className="text-xl font-extrabold text-navy">You're in.</h3>
        <p className="mt-3 text-body">
          Your early-adopter spot is locked — 30% off for 3 months when we
          launch. Watch your inbox; we'll email you the moment Rex is ready.
          Keep moving.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-navy/10 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <h3 className="text-2xl font-extrabold text-navy">Get the early-adopter offer</h3>
      <p className="mt-2 text-body">
        First 200 pros get 30% off for 3 months. Founding members shape what Rex
        becomes.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={label} htmlFor="ea-name">Name</label>
          <input
            id="ea-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            className={field}
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className={errText}>{errors.name}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={label} htmlFor="ea-email">Email</label>
          <input
            id="ea-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            className={field}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className={errText}>{errors.email}</p>}
        </div>

        <div>
          <label className={label} htmlFor="ea-trade">Trade</label>
          <select id="ea-trade" name="trade" defaultValue="" className={field} aria-invalid={!!errors.trade}>
            <option value="" disabled>Select your trade</option>
            {TRADES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.trade && <p className={errText}>{errors.trade}</p>}
        </div>

        <div>
          <label className={label} htmlFor="ea-state">US State</label>
          <select id="ea-state" name="state" defaultValue="" className={field} aria-invalid={!!errors.state}>
            <option value="" disabled>Select your state</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.state && <p className={errText}>{errors.state}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={label} htmlFor="ea-user-type">User Type</label>
          <select id="ea-user-type" name="user_type" defaultValue="" className={field} aria-invalid={!!errors.user_type}>
            <option value="" disabled>How do you work?</option>
            {USER_TYPES.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          {errors.user_type && <p className={errText}>{errors.user_type}</p>}
        </div>
      </div>

      {errors.form && (
        <p className="mt-4 rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm font-medium text-danger">
          {errors.form}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue px-7 py-3.5 text-base font-semibold text-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Saving your spot…" : "Claim my early-adopter spot"}
      </button>

      <p className="mt-3 text-xs text-body/70">
        By signing up you agree to our{" "}
        <a className="font-semibold text-blue underline" href="/privacy">
          Privacy Policy
        </a>
        . We'll only email you about your early-adopter offer and launch.
      </p>
    </form>
  );
}
