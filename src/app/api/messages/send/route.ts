import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin/permissions";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { request_id, content } = body;

    // Validation
    if (!request_id || !content || !content.trim()) {
      return NextResponse.json(
        { error: "request_id et content sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que la demande existe
    const { data: demande, error: demandeError } = await supabase
      .from("requests")
      .select("id, user_id")
      .eq("id", request_id)
      .single();

    if (demandeError || !demande) {
      logger.error("Demande non trouvée", { request_id, error: demandeError });
      return NextResponse.json(
        { error: "Demande non trouvée" },
        { status: 404 }
      );
    }

    // Déterminer le type d'expéditeur
    const isUserAdmin = await isAdmin(user.id);
    const senderType = isUserAdmin ? "admin" : "client";

    // Vérifier les permissions
    if (senderType === "client" && demande.user_id !== user.id) {
      return NextResponse.json(
        { error: "Vous n'avez pas accès à cette demande" },
        { status: 403 }
      );
    }

    // Créer le message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        request_id,
        sender_id: user.id,
        sender_type: senderType,
        content: content.trim(),
        is_read: false,
      })
      .select()
      .single();

    if (messageError) {
      logger.error("Erreur lors de la création du message", {
        error: messageError,
        request_id,
        user_id: user.id,
      });
      return NextResponse.json(
        { error: "Erreur lors de l'envoi du message" },
        { status: 500 }
      );
    }

    logger.info("Message créé avec succès", {
      message_id: message.id,
      request_id,
      sender_type: senderType,
    });

    return NextResponse.json({
      ok: true,
      message: message,
    });
  } catch (error: any) {
    logger.error("Erreur serveur lors de l'envoi du message", {
      error: error.message,
    });
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
