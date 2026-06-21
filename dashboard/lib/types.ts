// Row shapes returned from Supabase. Kept loose (nullable) because this is an
// analysis tool reading whatever is in the tables — never writing.

export interface EarlyAdopter {
  id: string;
  name: string;
  email: string;
  trade: string;
  state: string;
  user_type: string;
  source: string | null;
  created_at: string;
}

export interface FoundingRep {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  vat_number: string | null;
  trade: string | null;
  state_region: string | null;
  licence_number: string | null;
  years_in_trade: string | null;
  why_text: string | null;
  source: string | null;
  created_at: string;
}

export interface DashboardData {
  demo: boolean;
  error: string | null;
  earlyAdopters: EarlyAdopter[];
  foundingReps: FoundingRep[];
}
