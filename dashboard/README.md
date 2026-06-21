# TradesBrain — Internal Signup Dashboard

A small, **local-only** dashboard for the founder + a few team members to analyse
our signup data and make GTM / monetization / scaling decisions.

It reads two tables from our existing Supabase project:

- `early_adopters` — Early Adopter offer signups
- `founding_rep_applications` — Founding Rep applications

It is **read-only**: display, filter, sort, export. No editing, deleting,
emailing, or status changes — we read and decide.

---

## ⚠️ Security — read this first

This tool displays sensitive personal data (names, emails, phone, licence and
VAT numbers).

- **Do not deploy this.** It is for local machines only — never put it on the
  internet.
- **Do not commit `.env`.** Credentials live in `.env.local`, which is
  gitignored. The repo never contains a key.
- It uses the Supabase **service-role key**, which bypasses row-level security.
  Treat it like a password. It is used **only on the server** (Next.js) and is
  never sent to the browser.
- A simple password gate (`APP_PASSWORD`) keeps a passerby on a shared machine
  out. This is a light guard — the real protection is that the app runs locally
  only.

---

## Run it

Requires Node 18.18+ (or 20+).

```bash
cd dashboard
npm install

# First look — no credentials needed (shows built-in sample rows):
npm run dev
# open http://localhost:4400
```

### Point it at real data

1. Copy the example env file and fill it in:

   ```bash
   cp .env.local.example .env.local
   ```

2. Set the values in `.env.local`:

   - `APP_PASSWORD` — a shared password your team types to open the dashboard.
   - `SUPABASE_URL` — `https://quvcparzpurwwkrxpiki.supabase.co`
     (Supabase → Project Settings → Data API → Project URL).
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase → Project Settings → **API** →
     `service_role` key. **Secret. Never commit or share.**
   - `DASHBOARD_DEMO=0` — read live data (set to `1` to force sample data).

3. Restart the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:4400, enter the password, and you'll see live data.

> Each team member adds their **own** `.env.local` on their own machine. The
> file is never shared through git.

---

## What's inside

**Tab 1 — Early Adopters**
- Summary cards: total signups (X of 200 spots used), spots remaining, last-7-day
  velocity, distinct states/trades.
- Breakdown bars by trade and by user type.
- Signups-by-state table (sortable).
- **Trade × State** cross-table — the key GTM view (where are the plumbers?).
- Full records table — filter by trade / state / user type / date range, sort any
  column, export filtered rows to CSV.

**Tab 2 — Founding Rep Applications**
- Summary cards: total applications, states covered, distinct trades, last-7-day
  velocity.
- Breakdown bars by trade and by state.
- **State coverage** grid — every US state flagged *covered* (has applicants) or
  *gap* (none), with a "gaps only" toggle. We recruit ~one Rep per launch state,
  so this surfaces where we still need someone.
- Full applications table — name, trade, state, years, licence, VAT, contact
  (email + phone), and the full "why" (expandable). Filter by trade / state /
  minimum years, sort by experience (desc by default), export to CSV.

All numbers come from live Supabase queries — nothing is hardcoded. Empty states
are handled gracefully (zero rows yet).

---

## Notes

- **Founding Rep fields:** the dashboard stores and shows every field the form
  collects — full name, email, phone, VAT number, trade, state / region, licence
  number, years in trade, and the "why" text. There is no company field (the
  form's hidden "company" input is a bot honeypot, not stored).
- **Years of experience** is free text on the form (e.g. "14"); the dashboard
  parses the leading number for sorting/filtering.
- The dashboard is fed by the website forms: the Early Adopter form writes
  directly to `early_adopters`; the Founding Rep form's Edge Function
  (`founding-rep-email`) writes to `founding_rep_applications` in addition to
  emailing the application.

## Tech

Next.js (App Router) · React · Tailwind CSS · `@supabase/supabase-js`. Data is
fetched server-side so the service-role key never reaches the browser.
