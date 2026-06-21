/**
 * Central site configuration for the TradesBrain marketing website.
 *
 * One source of truth for links, contact addresses, pricing and the
 * early-adopter offer. Copy lives close to the components that use it,
 * but anything that is a real-world value (a URL, an email, a number)
 * lives here so it can be updated in one place before launch.
 *
 * ⚠️  PLACEHOLDERS TO CONFIRM BEFORE LAUNCH are marked `TODO`.
 */

export const SITE = {
  name: "TradesBrain",
  domain: "trades-brain.com",
  url: "https://trades-brain.com",
  tagline: "AI co-pilot for skilled trade professionals",
  coreLine:
    "You already know the trade. Rex makes sure you never lose money proving it.",
  spine: "Keep moving. Stay certain. Close the job.",
  description:
    "TradesBrain puts Rex, a master-level co-pilot, in your pocket. Hit a wall on a job, ask Rex, and get the certain, code-backed answer — so you keep moving, stay certain, and close the job.",
};

export const CONTACT = {
  // Support address Apple/Google require (Support page + footer).
  support: "support@trades-brain.com", // TODO: confirm support inbox is live before app submission.
  // Founding Rep applications route here (Spec Page 4 / Build Playbook §4).
  reps: "ghassen.mansouri@trades-brain.com",
};

/**
 * Founding Rep form delivery — the `founding-rep-email` Supabase Edge Function
 * sends each application straight to CONTACT.reps via Resend (no mail client
 * involved). The anon key is a public client credential by design; the
 * function still gates on it and a honeypot field.
 *
 * ⚠️ For sending to work, set RESEND_API_KEY (and ideally RESEND_FROM with a
 * verified trades-brain.com sender) in Supabase → Edge Functions secrets.
 */
export const FORM_API = {
  foundingRep:
    "https://quvcparzpurwwkrxpiki.supabase.co/functions/v1/founding-rep-email",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dmNwYXJ6cHVyd3drcnhwaWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMTc1NjAsImV4cCI6MjA5Mzc5MzU2MH0.2elPy01MVdv-tvWw1u88TATgxN3WYvDxmO9amLN6MQU",
};

/**
 * Supabase project for the marketing site's own capture tables.
 * Used by the Early Adopter form (insert into `early_adopters`) and the
 * live remaining-spots counter (RPC `early_adopter_count`). The anon key is
 * a public client credential by design; RLS gates what it can do (insert
 * only — it can't read anyone's email back).
 */
export const SUPABASE = {
  url: "https://quvcparzpurwwkrxpiki.supabase.co",
  anonKey: FORM_API.anonKey,
};

export const STORE_LINKS = {
  // Placeholders until the apps are live (Build Playbook §4 + Workflow Guide Prompt 6).
  appStore: "#", // TODO: paste the App Store listing URL once live.
  googlePlay: "#", // TODO: paste the Google Play listing URL once live.
};

/**
 * Early-adopter offer — the counter is REAL, never faked
 * (Neuromarketing Playbook §6: no fake scarcity). The remaining-spots count
 * is read live from Supabase (`early_adopter_count` RPC over the
 * `early_adopters` table) by EarlyAdopterCounter — nothing to hardcode.
 */
export const EARLY_ADOPTER = {
  totalSpots: 200,
  offer: "30% off for three months",
};

/**
 * Pricing — three plans, Pro anchored as the natural choice
 * (Spec Page 3 + Messaging Bank §10).
 *
 * Figures follow TradesBrain_UnifiedPricing_v1.xlsx (the single source of
 * truth across iOS, Android and web). The alignment rule:
 *   • MONTHLY prices use Apple's closest predefined tier and are shown
 *     IDENTICALLY on every surface (iOS IAP, Android, Website).
 *   • ANNUAL prices stay at their real values on Android/Stripe/Web
 *     (not Apple-tier-constrained).
 *
 *   Solo  — $69.99/mo · $662.40/yr  (= $55.20/mo)
 *   Pro   — $119.99/mo · $1,152/yr  (= $96/mo)
 *   Team  — $259.99/mo · $2,496/yr  (= $208/mo) for a base of 3 seats,
 *           plus $89.99/mo ($854.40/yr) per additional seat.
 * The monthly-equivalent on annual is a display-only calculation — the
 * actual annual charge is the full yearly amount billed once.
 *
 * `monthly` / `annualMonthly` / `annualTotal` are display strings so the
 * cents ($55.20) render exactly. The trial (10 free questions) is managed
 * in-app, never via Stripe.
 */
export const PLANS = [
  {
    id: "solo",
    name: "Solo",
    forWho: "The solo pro who owns the job and the name on it.",
    monthly: "69.99",
    annualMonthly: "55.20",
    annualTotal: "662.40",
    anchored: false,
    valueLine: "Everything you need to keep moving and close on the spot.",
    features: [
      "Unlimited questions to Rex on the job",
      "Code-backed answers with the AHJ verify note",
      "Diagnosis help, in plain language",
      "Professional reports & quotes",
      "1 seat",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    forWho: "The pro running flat-out who wants every edge.",
    monthly: "119.99",
    annualMonthly: "96",
    annualTotal: "1,152",
    anchored: true,
    valueLine: "The natural choice — built for the pro doing more jobs a day.",
    features: [
      "Everything in Solo",
      "Priority answers from Rex",
      "Advanced report & quote templates",
      "Job history you can search",
      "1 seat",
    ],
  },
  {
    id: "team",
    name: "Team",
    forWho: "The crew owner who wants every tech certain, the first time.",
    monthly: "259.99",
    annualMonthly: "208",
    annualTotal: "2,496",
    unit: "base 3 seats",
    extraSeat: "$89.99/mo per extra seat",
    anchored: false,
    valueLine: "Every tech on the crew gets the certain answer the first time.",
    features: [
      "Everything in Pro, for the whole crew",
      "Includes 3 seats — add more anytime at $89.99/mo each",
      "Shared templates: consistent quotes & reports company-wide",
      "Searchable job history across the crew",
      "Owner oversight across every tech",
    ],
  },
] as const;

export const TRIAL = {
  // Spec Page 3 + Messaging Bank §10: the trial is the low-risk entry.
  headline: "Start with 10 free questions",
  line: "Put Rex on your next ten questions and see the difference on the job. No card to keep moving.",
};

/**
 * Primary navigation — the launch pages (Spec §1).
 * Support / Privacy / Terms live in the footer.
 */
export const NAV = [
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Founding Rep", href: "/founding-rep" },
  { label: "Support", href: "/support" },
];

export const CTA = {
  primary: "Keep moving — download free",
  short: "Download free",
  rep: "Become a Founding Rep",
  early: "Get the early-adopter offer",
  trial: "Start with 10 free questions",
  job: "Put Rex on your next job",
};
