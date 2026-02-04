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

    // Récupérer toutes les demandes
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

    // Récupérer tous les paiements
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (paymentsError) {
      logger.error("Erreur lors de la récupération des paiements", {
        error: paymentsError,
      });
    }

    // Calculer les statistiques
    const stats = {
      total: {
        requests: requests?.length || 0,
        payments: payments?.length || 0,
        revenue: payments
          ?.filter((p) => p.status === "completed")
          .reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0,
      },
      byStatus: {
        pending: requests?.filter((r) => r.status === "pending").length || 0,
        analysis: requests?.filter((r) => r.status === "analysis").length || 0,
        awaiting_payment:
          requests?.filter((r) => r.status === "awaiting_payment").length || 0,
        in_production:
          requests?.filter((r) => r.status === "in_production").length || 0,
        delivered: requests?.filter((r) => r.status === "delivered").length || 0,
        cancelled: requests?.filter((r) => r.status === "cancelled").length || 0,
      },
      byMonth: {} as Record<string, { requests: number; revenue: number }>,
      paymentStatus: {
        pending: payments?.filter((p) => p.status === "pending").length || 0,
        completed: payments?.filter((p) => p.status === "completed").length || 0,
        failed: payments?.filter((p) => p.status === "failed").length || 0,
        cancelled: payments?.filter((p) => p.status === "cancelled").length || 0,
      },
    };

    // Statistiques par mois
    requests?.forEach((request) => {
      const month = new Date(request.created_at).toLocaleString("fr-FR", {
        year: "numeric",
        month: "short",
      });
      if (!stats.byMonth[month]) {
        stats.byMonth[month] = { requests: 0, revenue: 0 };
      }
      stats.byMonth[month].requests++;
    });

    payments
      ?.filter((p) => p.status === "completed")
      .forEach((payment) => {
        const month = new Date(payment.created_at).toLocaleString("fr-FR", {
          year: "numeric",
          month: "short",
        });
        if (!stats.byMonth[month]) {
          stats.byMonth[month] = { requests: 0, revenue: 0 };
        }
        stats.byMonth[month].revenue += Number(payment.amount || 0);
      });

    // Conversion en tableau pour faciliter l'affichage
    const monthlyData = Object.entries(stats.byMonth).map(([month, data]) => ({
      month,
      ...data,
    }));

    return NextResponse.json({
      ok: true,
      stats: {
        ...stats,
        monthlyData,
      },
    });
  } catch (error: any) {
    logger.error("Erreur serveur lors de la récupération des analytics", {
      error: error.message,
    });
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
