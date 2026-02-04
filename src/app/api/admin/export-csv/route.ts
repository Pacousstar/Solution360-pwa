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

    const isUserAdmin = await isAdmin(user.id);
    if (!isUserAdmin) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      );
    }

    // Récupérer toutes les demandes avec les infos utilisateur
    const { data: requests, error: requestsError } = await supabase
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (requestsError) {
      logger.error("Erreur lors de la récupération des demandes", {
        error: requestsError,
      });
      return NextResponse.json(
        { error: "Erreur lors de la récupération des données" },
        { status: 500 }
      );
    }

    // Récupérer les infos utilisateurs
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminSupabase = createAdminClient();
    const { data: users } = await adminSupabase.auth.admin.listUsers();

    // Créer le CSV
    const headers = [
      "ID",
      "Titre",
      "Description",
      "Statut",
      "Prix Final (FCFA)",
      "Budget Proposé (FCFA)",
      "Client Email",
      "Client Nom",
      "Date Création",
      "Date Mise à jour",
    ];

    const rows = (requests || []).map((request: any) => {
      const userData = users?.users.find((u) => u.id === request.user_id);
      const clientName =
        userData?.user_metadata?.full_name ||
        userData?.email?.split("@")[0] ||
        "N/A";
      const clientEmail = userData?.email || "N/A";

      // Fonction pour échapper les virgules et guillemets dans CSV
      const escapeCSV = (value: any) => {
        if (value === null || value === undefined) return "";
        const str = String(value);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      return [
        escapeCSV(request.id),
        escapeCSV(request.title),
        escapeCSV(request.description),
        escapeCSV(request.status),
        escapeCSV(request.final_price || ""),
        escapeCSV(request.budget_proposed || ""),
        escapeCSV(clientEmail),
        escapeCSV(clientName),
        escapeCSV(new Date(request.created_at).toLocaleString("fr-FR")),
        escapeCSV(
          request.updated_at
            ? new Date(request.updated_at).toLocaleString("fr-FR")
            : ""
        ),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    // Retourner le CSV
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="demandes-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    logger.error("Erreur serveur lors de l'export CSV", {
      error: error.message,
    });
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
