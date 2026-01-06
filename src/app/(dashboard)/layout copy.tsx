import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si pas d'utilisateur, rediriger vers login
  if (!user) {
    redirect("/login");
  }

  // Layout transparent : chaque page gère son propre header
  return <>{children}</>;
}
