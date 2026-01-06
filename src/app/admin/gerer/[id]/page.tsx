import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect, notFound } from "next/navigation";
import { uploadDeliverable, listDeliverables } from "@/lib/supabase/storage";
import GererDemandeClient from "./GererDemandeClient";

export default async function AdminGererPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ upload?: string; status?: string; message?: string }>;
}) {
  const { id } = await params;
  const { upload, status: statusUpdate, message } = await searchParams;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminEmails = ["pacous2000@gmail.com", "admin@solution360.app"];
  if (!adminEmails.includes(user.email || "")) redirect("/demandes");

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
