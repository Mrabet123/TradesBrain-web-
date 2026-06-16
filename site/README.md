# TradesBrain — Marketing Website

The launch marketing site for TradesBrain. Built with **Astro + Tailwind CSS v4 + React islands**, mobile-first, static-rendered for fast load and SEO. Copy is verbatim from the Messaging Bank; voice follows the Neuromarketing Playbook.

> Separate from the app repo by design (Build Playbook / Workflow Guide).

## Run it

```bash
cd site
npm install
npm run dev        # local dev at http://localhost:4321
npm run build      # static build → dist/
npm run preview    # serve the built dist/
```

## Pages (Spec §1)

| Route            | Page                              |
| ---------------- | --------------------------------- |
| `/`              | Home — full funnel (8 sections)   |
| `/how-it-works`  | How It Works                      |
| `/pricing`       | Pricing                           |
| `/founding-rep`  | Founding Rep + Early Adopter      |
| `/download`      | Download (badges + QR)            |
| `/support`       | Support / Help Center *(app-store dependency)* |
| `/privacy`       | Privacy Policy *(hard app-store dependency)* |
| `/terms`         | Terms of Use                      |

## ⚠️ Before launch — fill these placeholders

All live in `src/data/site.ts` unless noted, each marked `TODO`:

1. **Pricing numbers** — the dollar amounts in `PLANS` are placeholders; no validated
   prices were in the deliverables. Set the real figures.
2. **iOS IAP consistency** — confirm the iOS payment decision (iOS Build Guide Step 0)
   and align the wording on `/pricing` and `/support` so web/Android (Stripe) and iOS
   tell one story. Marked with a comment on both pages.
3. **Store links** — `STORE_LINKS` are `#` placeholders until the apps are live.
4. **Support inbox** — `CONTACT.support` must be a live, monitored address before
   app submission (stores require a working support URL).
5. **Early-adopter counter** — `EARLY_ADOPTER.spotsClaimed` must be wired to the real
   signup count. Never faked (Playbook §6).
6. **Founding Rep capture** — currently composes an email to `ghassen.mansouri@trades-brain.com`.
   To use a backend (Formspree / API route / Supabase), replace `handleSubmit` in
   `src/components/react/FoundingRepForm.tsx`.
7. **Legal wording** — `/privacy` and `/terms` have the structure built; passages marked
   `[ FOR LAWYER REVIEW ]` must be completed/approved by counsel. The Privacy URL is a
   hard app-store dependency.

## Deploy (trades-brain.com)

The domain is owned via Namecheap; it still needs a host.

1. Deploy to **Vercel** (recommended — free tier, cleanest target). Framework preset:
   Astro. Root directory: `site`. Build: `npm run build`. Output: `dist`.
2. Vercel provides DNS records → paste them into **Namecheap → Domain → Advanced DNS**
   for `trades-brain.com`.
3. Confirm the live site loads, is mobile-responsive, and that all links, badges,
   the Rep capture, the counter, and the QR work.

## Assets

Brand + motion assets live in `public/assets/` (logo lockup + Rex Lottie animations,
copied from `all-deliverables/`). The compass mark in the nav/footer is inline SVG
(`src/components/Logo.astro`) so it stays crisp at any size.

## Design tokens

Defined in `src/styles/global.css` (`@theme`): navy `#1E3A5F`, blue `#2E75B6`,
light tint `#EEF5FC`, success/amber/danger, Inter type, generous spacing.
