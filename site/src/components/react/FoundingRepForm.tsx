import { useState } from "react";

/**
 * Founding Rep application capture (Spec Page 4 / Build Playbook §4).
 *
 * No backend exists yet, so this composes a pre-filled email to the Rep
 * inbox and hands off to the visitor's mail client — reliable and honest,
 * with nothing faked. To wire a real backend later (Formspree, an API
 * route, Supabase, etc.), replace the body of `handleSubmit` with a fetch
 * to your endpoint; the field names below are ready for it.
 */
interface Props {
  to: string;
}

export default function FoundingRepForm({ to }: Props) {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "");
    const trade = String(f.get("trade") || "");
    const region = String(f.get("region") || "");
    const license = String(f.get("license") || "");
    const about = String(f.get("about") || "");
    const email = String(f.get("email") || "");

    const subject = encodeURIComponent(
      `Founding Rep application — ${name} (${trade}, ${region})`
    );
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Email: ${email}`,
        `Trade: ${trade}`,
        `State / region: ${region}`,
        `Licence / experience: ${license}`,
        ``,
        `Why I'd represent TradesBrain:`,
        about,
      ].join("\n")
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  const field =
    "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-navy placeholder:text-body/50 focus:border-blue focus:outline-none";
  const label = "block text-sm font-semibold text-navy mb-1.5";

  if (sent) {
    return (
      <div className="rounded-2xl border border-success/30 bg-white p-8 text-center shadow-[var(--shadow-card)]">
        <h3 className="text-xl font-extrabold text-navy">
          Your application is on its way.
        </h3>
        <p className="mt-2 text-body">
          Your email app should have opened with everything filled in — just
          hit send. We read every application personally and reply fast.
        </p>
        <p className="mt-4 text-sm text-body/80">
          Didn't open?{" "}
          <a className="font-semibold text-blue underline" href={`mailto:${to}`}>
            Email us directly at {to}
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
          <label className={label} htmlFor="trade">Your trade</label>
          <input id="trade" name="trade" required className={field} placeholder="e.g. Plumbing" />
        </div>
        <div>
          <label className={label} htmlFor="region">State / region</label>
          <input id="region" name="region" required className={field} placeholder="e.g. Texas" />
        </div>
      </div>
      <div className="mt-4">
        <label className={label} htmlFor="license">Licence & years in the trade</label>
        <input id="license" name="license" required className={field} placeholder="Licensed master plumber, 14 years" />
      </div>
      <div className="mt-4">
        <label className={label} htmlFor="about">
          Why you'd put your name behind TradesBrain
        </label>
        <textarea id="about" name="about" rows={4} className={field} placeholder="Tell us about your standing in your trade and your network." />
      </div>
      <button
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue px-7 py-3.5 text-base font-semibold text-white shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:bg-blue-600 sm:w-auto"
      >
        Become a Founding Rep
      </button>
      <p className="mt-3 text-xs text-body/70">
        We review every application personally. Criteria: licensed, experienced,
        and well-connected in your trade and state.
      </p>
    </form>
  );
}
