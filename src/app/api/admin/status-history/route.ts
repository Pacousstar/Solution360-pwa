import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin/permissions";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const request_id = searchParams.get("request_id");

    if (!request_id) {
      return NextResponse.json(
        { error: "request_id est requis" },
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

    // Récupérer l'historique des statuts
    // Note: Si la table status_history n'existe pas, on crée l'historique depuis les dates de la demande
    let history: any[] = [];

    // Essayer de récupérer depuis status_history
    const { data: statusHistory } = await supabase
      .from("status_history")
      .select("*")
      .eq("request_id", request_id)
      .order("created_at", { ascending: true });

    if (statusHistory && statusHistory.length > 0) {
      history = statusHistory.map((h) => ({
        id: h.id,
        status: h.new_status,
        old_status: h.old_status,
        date: h.created_at,
        changed_by: h.changed_by,
        change_reason: h.change_reason,
      }));
    } else {
      // Fallback: créer l'historique depuis les dates de la demande
      const { data: requestData } = await supabase
        .from("requests")
        .select("status, created_at, updated_at")
        .eq("id", request_id)
        .single();

      if (requestData) {
        history = [
          {
            id: "initial",
            status: requestData.status || "pending",
            old_status: null,
            date: requestData.created_at,
            changed_by: null,
            change_reason: "Création de la demande",
          },
        ];

        if (requestData.updated_at && requestData.updated_at !== requestData.created_at) {
          history.push({
            id: "updated",
            status: requestData.status || "pending",
            old_status: "pending",
            date: requestData.updated_at,
            changed_by: null,
            change_reason: "Mise à jour",
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      history,
    });
  } catch (error: any) {
    logger.error("Erreur serveur lors de la récupération de l'historique", {
      error: error.message,
    });
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
