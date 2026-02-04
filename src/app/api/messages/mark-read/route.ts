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
    const { message_ids, request_id } = body;

    if (!message_ids || !Array.isArray(message_ids) || message_ids.length === 0) {
      return NextResponse.json(
        { error: "message_ids est requis (tableau)" },
        { status: 400 }
      );
    }

    // Si request_id est fourni, marquer tous les messages non lus de cette demande
    if (request_id) {
      // Vérifier que la demande existe
      const { data: demande, error: demandeError } = await supabase
        .from("requests")
        .select("id, user_id")
        .eq("id", request_id)
        .single();

      if (demandeError || !demande) {
        return NextResponse.json(
          { error: "Demande non trouvée" },
          { status: 404 }
        );
      }

      // Vérifier les permissions
      const isUserAdmin = await isAdmin(user.id);
      if (!isUserAdmin && demande.user_id !== user.id) {
        return NextResponse.json(
          { error: "Vous n'avez pas accès à cette demande" },
          { status: 403 }
        );
      }

      // Marquer tous les messages non lus de cette demande comme lus
      // (sauf ceux envoyés par l'utilisateur actuel)
      const { error: updateError } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("request_id", request_id)
        .eq("is_read", false)
        .neq("sender_id", user.id);

      if (updateError) {
        logger.error("Erreur lors de la mise à jour des messages", {
          error: updateError,
          request_id,
        });
        return NextResponse.json(
          { error: "Erreur lors de la mise à jour" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        message: "Messages marqués comme lus",
      });
    }

    // Sinon, marquer les messages spécifiques
    const { error: updateError } = await supabase
      .from("messages")
      .update({ is_read: true })
      .in("id", message_ids);

    if (updateError) {
      logger.error("Erreur lors de la mise à jour des messages", {
        error: updateError,
        message_ids,
      });
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Messages marqués comme lus",
    });
  } catch (error: any) {
    logger.error("Erreur serveur lors de la mise à jour des messages", {
      error: error.message,
    });
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
