import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StatsContent from "./StatsContent";

export default async function StatsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Récupérer toutes les demandes de l'utilisateur
  const { data: demandes } = await supabase
    .from("requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return <StatsContent demandes={demandes || []} />;
}
