import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const missingEnvError = new Error(
  'Supabase belum dikonfigurasi. Salin `.env.example` ke `.env` lalu isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.'
);

const createOfflineQuery = () => {
  const chain = {
    select: () => chain,
    insert: () => Promise.resolve({ data: null, error: missingEnvError }),
    update: () => chain,
    delete: () => chain,
    order: () => Promise.resolve({ data: null, error: null }),
    eq: () => Promise.resolve({ data: null, error: missingEnvError }),
    then: (onFulfilled?: (value: { data: null; error: null }) => unknown, onRejected?: (reason: unknown) => unknown) =>
      Promise.resolve({ data: null, error: null }).then(onFulfilled, onRejected),
  };

  return chain;
};

const createOfflineClient = () =>
  ({
    from: () => createOfflineQuery(),
  }) as unknown as SupabaseClient;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const hasSupabaseEnv = Boolean(supabaseUrl && supabaseKey);

if (!hasSupabaseEnv) {
  console.warn(missingEnvError.message);
}

export const supabase = hasSupabaseEnv
  ? createClient(supabaseUrl as string, supabaseKey as string)
  : createOfflineClient();
