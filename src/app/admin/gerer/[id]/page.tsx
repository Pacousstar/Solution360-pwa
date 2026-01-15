import { redirect, notFound } from "next/navigation";
import { uploadDeliverable, listDeliverables } from "@/lib/supabase/storage";
import GererDemandeClient from "./GererDemandeClient";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin/permissions";

export default async function AdminGererPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ upload?: string; status?: string; message?: string }>;
}) {
  const { id } = await params;
  const { upload, status: statusUpdate, message } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) redirect("/login");

  // ✅ Utiliser la logique centralisée pour vérifier admin
  const adminStatus = await isAdmin(user.id, user.email || undefined);
  if (!adminStatus) redirect("/demandes");

  const { data: demande } = await supabase
    .from("requests")
    .select("*, ai_analyses (*)")
    .eq("id", id)
    .single();

  if (!demande) notFound();

  const deliverables = await listDeliverables(id);

  return (
    <GererDemandeClient
      demande={demande}
      deliverables={deliverables}
      uploadStatus={upload}
      statusUpdate={statusUpdate}
      uploadMessage={message}
    />
  );
}
