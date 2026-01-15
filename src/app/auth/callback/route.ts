import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // Pour détecter le type de callback (recovery, signup, etc.)

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error);
      // Rediriger vers login en cas d'erreur
      return NextResponse.redirect(new URL("/login?error=auth_error", request.url));
    }

    // Si c'est un reset password (type = recovery), rediriger vers la page de reset
    if (type === "recovery" || searchParams.get("type") === "recovery") {
      // Passer le code à la page de reset
      return NextResponse.redirect(new URL(`/auth/reset-password?code=${code}`, request.url));
    }
  }

  // Rediriger vers le dashboard pour les autres types (signup, etc.)
  return NextResponse.redirect(new URL("/demandes", request.url));
}
