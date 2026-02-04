// /src/lib/supabase/client.ts
// ✅ GESTION D'ERREURS AMÉLIORÉE - MonAP
import { createBrowserClient } from "@supabase/ssr";
import { logger } from "@/lib/logger";

export function createClient() {
  // Vérifier les variables d'environnement
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    const errorMessage = `❌ Variables d'environnement Supabase manquantes : ${missing.join(', ')}\n` +
      `Veuillez créer un fichier .env.local avec ces variables.\n` +
      `Voir docs/ENV_TEMPLATE.md pour le template.`;
    
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    const client = createBrowserClient(supabaseUrl, supabaseAnonKey);
    logger.log('✅ Client Supabase créé avec succès');
    return client;
  } catch (error: any) {
    logger.error('❌ Erreur lors de la création du client Supabase:', error);
    throw new Error(`Erreur lors de l'initialisation de Supabase: ${error.message}`);
  }
}
