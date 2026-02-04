import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // Pour détecter le type de callback (recovery, signup, etc.)

  logger.log("🔐 Callback auth reçu:", { code: code ? "présent" : "absent", type });

  if (code) {
    const supabase = await createClient();
    
    // Vérifier d'abord si c'est un recovery (reset password)
    // Supabase peut envoyer le type dans l'URL ou dans le hash
    const isRecovery = type === "recovery" || 
                       searchParams.get("type") === "recovery" ||
                       request.url.includes("recovery") ||
                       request.url.includes("reset");

    logger.log("🔐 Type détecté:", { isRecovery, type, url: request.url });

    // Si c'est un recovery, échanger le code et rediriger vers reset-password
    if (isRecovery) {
      logger.log("🔐 Traitement comme recovery (reset password)");
      
      // Échanger le code pour une session temporaire
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        logger.error("❌ Erreur exchange code pour recovery:", exchangeError);
        // Rediriger vers la page de reset avec le code en paramètre (on le gérera côté client)
        return NextResponse.redirect(new URL(`/auth/reset-password?code=${code}&error=exchange_failed`, request.url));
      }

      logger.log("✅ Code échangé avec succès, redirection vers reset-password");
      // Rediriger vers la page de reset (le code est déjà échangé, on n'a plus besoin de le passer)
      return NextResponse.redirect(new URL("/auth/reset-password", request.url));
    }

    // Pour les autres types (signup, etc.), échanger le code normalement
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logger.error("❌ Erreur exchange code:", error);
      // Rediriger vers login en cas d'erreur
      return NextResponse.redirect(new URL("/login?error=auth_error", request.url));
    }

    logger.log("✅ Code échangé avec succès, redirection vers dashboard");
    // Rediriger vers le dashboard pour les autres types (signup, etc.)
    return NextResponse.redirect(new URL("/demandes", request.url));
  }

  // Pas de code, rediriger vers login
  logger.warn("⚠️ Callback sans code, redirection vers login");
  return NextResponse.redirect(new URL("/login?error=no_code", request.url));
}
