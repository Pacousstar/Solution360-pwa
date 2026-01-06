import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DemandesContent from "./DemandesContent";

type RequestRow = {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  budget_proposed: number | null;
  status: string | null;
  complexity: string | null;
  urgency: string | null;
  ai_phase: string | null;
  created_at: string | null;
  updated_at: string | null;
};

// Composant de chargement
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <div className="h-5 w-24 bg-gray-200 rounded-full"></div>
                <div className="h-5 w-32 bg-orange-200 rounded-full"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="w-20 h-5 bg-gray-200 rounded ml-4"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Composant serveur pour récupérer les données
async function DemandesData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Récupérer les demandes de l'utilisateur
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const demandes = (data || []) as RequestRow[];

  // Récupérer les infos utilisateur
  const { data: userData } = await supabase
    .from("auth.users")
    .select("raw_user_meta_data")
    .eq("id", user.id)
    .single();

  const fullName =
    userData?.raw_user_meta_data?.full_name || user.email?.split("@")[0] || "User";

  if (error) {
    console.error("Erreur chargement demandes:", error);
  }

  return <DemandesContent demandes={demandes} userFullName={fullName} />;
}

export default function MesDemandesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-sky-50/30">
      <Suspense fallback={<LoadingSkeleton />}>
        <DemandesData />
      </Suspense>
    </div>
  );
}
