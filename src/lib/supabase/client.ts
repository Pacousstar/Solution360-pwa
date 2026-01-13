// /src/lib/supabase/client.ts
// ✅ GESTION D'ERREURS AMÉLIORÉE - MonAP
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Vérifier les variables d'environnement
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    throw new Error(
      `❌ Variables d'environnement Supabase manquantes : ${missing.join(', ')}\n` +
      `Veuillez créer un fichier .env.local avec ces variables.\n` +
      `Voir docs/ENV_TEMPLATE.md pour le template.`
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
