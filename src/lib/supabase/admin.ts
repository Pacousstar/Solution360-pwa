// /src/lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

// Client admin qui bypass RLS - À utiliser UNIQUEMENT côté serveur
// ⚠️ SÉCURITÉ : Ne jamais utiliser côté client (expose SUPABASE_SERVICE_ROLE_KEY)
export function createAdminClient() {
  // Vérifier qu'on est côté serveur
  if (typeof window !== 'undefined') {
    throw new Error(
      '❌ SECURITY ERROR: createAdminClient() ne peut pas être utilisé côté client. ' +
      'Utilisez une route API pour les opérations admin.'
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
