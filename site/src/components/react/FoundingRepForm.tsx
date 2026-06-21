import { useState } from "react";

/**
 * Founding Rep application capture (Spec Page 4 / Build Playbook §4).
 *
 * Submits straight to the `founding-rep-email` Supabase Edge Function, which
 * emails the application to the Rep inbox via Resend — no mail client involved,
 * the visitor just clicks once. If the request fails (network, or the email
 * service isn't configured yet), we fall back to a pre-filled mailto so an
 * application is never lost.
 */
interface Props {
  to: string;
  endpoint: string;
  anonKey: string;
}

export default function FoundingRepForm({ to, endpoint, anonKey }: Props) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function mailtoFallback(data: Record<string, string>) {
    const subject = encodeURIComponent(
      `Founding Rep application — ${data.name} (${data.trade}, ${data.region})`
    );
    const body = encodeURIComponent(
      [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `Phone: ${data.phone}`,
        `VAT number: ${data.vat}`,
        `Trade: ${data.trade}`,
        `State / region: ${data.region}`,
        `Licence number: ${data.license}`,
        `Years in the trade: ${data.years}`,
        ``,
        `Why I'd represent TradesBrain:`,
        data.about,
      ].join("\n")
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);

    const f = new FormData(e.currentTarget);
    const data = {
      name: String(f.get("name") || ""),
      email: String(f.get("email") || ""),
      phone: String(f.get("phone") || ""),
      vat: String(f.get("vat") || ""),
      trade: String(f.get("trade") || ""),
      region: String(f.get("region") || ""),
      license: String(f.get("license") || ""),
      years: String(f.get("years") || ""),
      about: String(f.get("about") || ""),
      company: String(f.get("company") || ""), // honeypot
    };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setSent(true);
    } catch {
      // Network or service error — don't lose the application.
      setError(
        "We couldn't send it automatically. We've opened your email app as a backup — just hit send."
      );
      mailtoFallback(data);
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-navy placeholder:text-body/50 focus:border-blue focus:outline-none";
  const label = "block text-sm font-semibold text-navy mb-1.5";

  if (sent) {
    return (
      <div className="rounded-2xl border border-success/30 bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <h3 className="text-xl font-extrabold text-navy">
          Your application is in.
        </h3>
        <p className="mt-2 text-body">
          It's been sent straight to our team — no further action needed. We
          read every application personally and reply fast.
        </p>
        <p className="mt-4 text-sm text-body/80">
          Questions?{" "}
          <a className="font-semibold text-blue underline" href={`mailto:${to}`}>
            Email us at {to}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-navy/10 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="name">Full name</label>
          <input id="name" name="name" required className={field} placeholder="Your name" />
        </div>
        <div>
          <label className={label} htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className={field} placeholder="you@trade.com" />
        </div>
        <div>
          <label className={label} htmlFor="phone">Phone number</label>
          <input id="phone" name="phone" type="tel" required className={field} placeholder="+1 555 123 4567" />
        </div>
        <div>
          <label className={label} htmlFor="vat">VAT number</label>
          <input id="vat" name="vat" required className={field} placeholder="e.g. GB123456789" />
        </div>
        <div>
          <label className={label} htmlFor="trade">Your trade</label>
          <input id="trade" name="trade" required className={field} placeholder="e.g. Plumbing" />
        </div>
        <div>
          <label className={label} htmlFor="region">State / region</label>
          <input id="region" name="region" required className={field} placeholder="e.g. Texas" />
        </div>
        <div>
          <label className={label} htmlFor="license">Licence number</label>
          <input id="license" name="license" required className={field} placeholder="e.g. MP-1234567" />
        </div>
        <div>
          <label className={label} htmlFor="years">Years in the trade</label>
          <input id="years" name="years" required className={field} placeholder="e.g. 14" />
        </div>
      </div>
      <div className="mt-4">
        <label className={label} htmlFor="about">
          Why you'd put your name behind TradesBrain
        </label>
        <textarea id="about" name="about" rows={4} required className={field} placeholder="Tell us about your standing in your trade and your network." />
      </div>

      {/* Honeypot — hidden from real users, catches bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-blue/30 bg-tint p-3 text-sm text-navy">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue px-7 py-3.5 text-base font-semibold text-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {busy ? "Sending…" : "Become a Founding Rep"}
      </button>
      <p className="mt-3 text-xs text-body/70">
        We review every application personally. Criteria: licensed, experienced,
        and well-connected in your trade and state.
      </p>
    </form>
  );
}
