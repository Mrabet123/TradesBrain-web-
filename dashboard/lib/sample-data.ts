// Built-in sample rows used ONLY in demo mode (no Supabase credentials, or
// DASHBOARD_DEMO=1). They let you see the dashboard immediately before pointing
// it at the real data. None of this is real PII. Real numbers always come from
// live Supabase queries — this is never used when credentials are present.

import type { EarlyAdopter, FoundingRep } from "./types";

// created_at values are fixed strings so demo mode is deterministic. A couple
// are recent-ish relative to mid-2026 to exercise the "last 7 days" velocity —
// but note "last 7 days" is computed against the real current date at runtime,
// so demo velocity may read 0 depending on when you run it. That's expected.
export const sampleEarlyAdopters: EarlyAdopter[] = [
  { id: "ea-1", name: "Marcus Reilly", email: "marcus.reilly@example.com", trade: "Plumbing", state: "Texas", user_type: "Solo Pro", source: "founding-rep/offer-2", created_at: "2026-06-19T14:22:00Z" },
  { id: "ea-2", name: "Tanya Brooks", email: "tanya.brooks@example.com", trade: "Plumbing", state: "Texas", user_type: "Crew / Team Owner", source: "founding-rep/offer-2", created_at: "2026-06-18T09:10:00Z" },
  { id: "ea-3", name: "Dev Patel", email: "dev.patel@example.com", trade: "Electrical", state: "California", user_type: "Solo Pro", source: "founding-rep/offer-2", created_at: "2026-06-17T18:05:00Z" },
  { id: "ea-4", name: "A. Johnson", email: "ajohnson@example.com", trade: "Plumbing", state: "Florida", user_type: "Apprentice", source: "founding-rep/offer-2", created_at: "2026-06-12T11:00:00Z" },
  { id: "ea-5", name: "Rosa Mendez", email: "rosa.mendez@example.com", trade: "HVAC", state: "Texas", user_type: "Crew / Team Owner", source: "founding-rep/offer-2", created_at: "2026-06-05T16:40:00Z" },
  { id: "ea-6", name: "Liam O'Connor", email: "liam.oconnor@example.com", trade: "Plumbing", state: "California", user_type: "Solo Pro", source: "founding-rep/offer-2", created_at: "2026-05-29T08:30:00Z" },
  { id: "ea-7", name: "Grace Kim", email: "grace.kim@example.com", trade: "Roofing", state: "New York", user_type: "Solo Pro", source: "founding-rep/offer-2", created_at: "2026-05-21T13:15:00Z" },
  { id: "ea-8", name: "Owen Walsh", email: "owen.walsh@example.com", trade: "Plumbing", state: "Texas", user_type: "Apprentice", source: "founding-rep/offer-2", created_at: "2026-05-12T10:00:00Z" },
];

export const sampleFoundingReps: FoundingRep[] = [
  { id: "fr-1", full_name: "Frank DiMaggiO", email: "frank.dimaggio@example.com", phone: "+1 512 555 0143", vat_number: "GB123456789", trade: "Plumbing", state_region: "Texas", licence_number: "MP-1102934", years_in_trade: "22", why_text: "Been running a plumbing outfit in Austin for two decades. I know every contractor in the metro and I've trained a dozen apprentices. I want a tool that actually talks like the job site.", source: "founding-rep/offer-1", created_at: "2026-06-18T15:00:00Z" },
  { id: "fr-2", full_name: "Denise Carter", email: "denise.carter@example.com", phone: "+1 305 555 0199", vat_number: null, trade: "Plumbing", state_region: "Florida", licence_number: "CFC-5582010", years_in_trade: "15", why_text: "Master plumber, Miami-Dade. Strong network through the local union hall. Happy to put my name behind something that helps the trade.", source: "founding-rep/offer-1", created_at: "2026-06-14T12:30:00Z" },
  { id: "fr-3", full_name: "Sam Whitfield", email: "sam.whitfield@example.com", phone: "+1 415 555 0177", vat_number: null, trade: "Electrical", state_region: "California", licence_number: "C10-998211", years_in_trade: "9", why_text: "Licensed electrician in the Bay Area. Younger crowd follows me on socials — I can move early adopters fast.", source: "founding-rep/offer-1", created_at: "2026-06-02T09:45:00Z" },
  { id: "fr-4", full_name: "Hank Brewer", email: "hank.brewer@example.com", phone: "+1 713 555 0125", vat_number: null, trade: "HVAC", state_region: "Texas", licence_number: "TACLA-44021", years_in_trade: "31", why_text: "HVAC, Houston. 31 years. Semi-retired but still the guy everyone calls. I'd love to help shape this for the next generation.", source: "founding-rep/offer-1", created_at: "2026-05-20T17:20:00Z" },
];
