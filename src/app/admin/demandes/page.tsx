// /src/app/admin/demandes/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole } from "@/lib/admin/permissions";
import DemandesAdminClient from "./DemandesAdminClient";
import { logger } from "@/lib/logger";

export default async function AdminDemandesPage() {
  // Client user pour l'authentification
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ✅ Utilisation de la logique centralisée
  const { isAdmin, isSuperAdmin } = await import('@/lib/admin/permissions');
  const adminStatus = await isAdmin(user.id, user.email || undefined);
  const superAdminStatus = await isSuperAdmin(user.id);

  if (!adminStatus) {
    redirect("/demandes");
  }

  // ✅ Utiliser le client admin pour récupérer les demandes
  const adminSupabase = createAdminClient();

  // Récupérer les demandes
  const { data: demandes, error: demandesError } = await adminSupabase
    .from("requests")
    .select(`
      *,
      ai_analyses (*)
    `)
    .order("created_at", { ascending: false });

  if (demandesError) {
    logger.error("Error fetching requests:", demandesError);
  }

  // Enrichir avec les infos utilisateurs
  const enrichedDemandes = await Promise.all(
    (demandes || [])
      .filter((demande) => demande.user_id)
      .map(async (demande: any) => {
        // Vérifier que user_id est valide (format UUID)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        if (!demande.user_id || !uuidRegex.test(demande.user_id)) {
          logger.warn(`Invalid user_id for request ${demande.id}: ${demande.user_id}`);
          return {
            ...demande,
            user: {
              email: 'Utilisateur invalide',
              raw_user_meta_data: { full_name: 'N/A' },
            },
          };
        }
  
        try {
          const { data: userData, error: userError } = await adminSupabase.auth.admin.getUserById(
            demande.user_id
          );
  
          if (userError) {
            logger.error(`Error fetching user ${demande.user_id}:`, userError);
          }
  
          return {
            ...demande,
            user: userData?.user
              ? {
                  email: userData.user.email || 'Email inconnu',
                  raw_user_meta_data: userData.user.user_metadata || {},
                }
              : {
                  email: 'Utilisateur supprimé',
                  raw_user_meta_data: { full_name: 'N/A' },
                },
          };
        } catch (error) {
          logger.error(`Unexpected error fetching user ${demande.user_id}:`, error);
          return {
            ...demande,
            user: {
              email: 'Erreur',
              raw_user_meta_data: { full_name: 'N/A' },
            },
          };
        }
      })
  );

  // Récupérer les stats
  const { data: stats, error: statsError } = await adminSupabase
    .from("admin_stats")
    .select("*")
    .single();

  if (statsError) {
    logger.error("Error fetching stats:", statsError);
  }

  return (
    <DemandesAdminClient
      initialDemandes={enrichedDemandes}
      stats={stats || {
        draft_count: 0,
        analysis_count: 0,
        awaiting_payment_count: 0,
        in_production_count: 0,
        delivered_count: 0,
        cancelled_count: 0,
        total_revenue: 0,
      }}
      userEmail={user.email || ""}
      isSuperAdmin={superAdminStatus}
    />
  );
}
