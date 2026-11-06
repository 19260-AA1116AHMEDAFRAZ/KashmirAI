// Supabase settings from .env.local (see .env.example). The publishable key is public by design:
// it can only do what the database's row-level security rules allow.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

// Without settings the site runs on the built-in sample data and skips sign-in (like the mobile app).
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
