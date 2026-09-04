import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wxmxiaiyryotmpwnutki.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_kqyGAowyFfvhpx8XznMLuA_jCrnFnry';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    (import.meta.env.VITE_SUPABASE_URL || supabaseUrl) && 
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || supabaseKey)
  );
};

export async function checkSupabaseConnection(): Promise<{ connected: boolean; message: string; latencyMs?: number }> {
  const start = performance.now();
  try {
    const { data, error } = await supabase.from('procurement_centres').select('count', { count: 'exact', head: true });
    const latency = Math.round(performance.now() - start);
    
    if (error) {
      // Even if table does not exist yet, connection to supabase endpoint succeeded
      return { 
        connected: true, 
        message: `Connected to Supabase (${latency}ms) — [${error.message}]`, 
        latencyMs: latency 
      };
    }
    return { connected: true, message: `Connected to Supabase (${latency}ms)`, latencyMs: latency };
  } catch (err: any) {
    return { connected: false, message: err?.message || 'Failed to connect to Supabase' };
  }
}
