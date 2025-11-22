import { createClient } from '@supabase/supabase-js';

// Read Supabase configuration from Vite environment variables.
// Create a local `.env` (not committed) with the keys from your Supabase project,
// for example copy `.env.example` to `.env` and fill the values.
// Vite exposes variables that start with `VITE_` via `import.meta.env`.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string;
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
	// Warn in dev when env vars are not set. In production, set secrets in your host.
	console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Check your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
