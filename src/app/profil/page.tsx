import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfilContent from "./ProfilContent";

export default async function ProfilPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirection côté serveur si pas d'utilisateur
  if (!user) {
    redirect("/login");
  }

  // ✅ Récupérer les métadonnées avec fallback intelligent
  const fullName = user.user_metadata?.full_name || "";
  const gender = user.user_metadata?.gender || "male";
  const phone = user.user_metadata?.phone || "";
  const company = user.user_metadata?.company || "";
  
  // ✅ Récupérer l'avatar avec fallback
  let avatarUrl = user.user_metadata?.avatar_url || null;

  // Si pas d'avatar dans metadata, vérifier si fichier existe dans Storage
  if (!avatarUrl) {
    const { data: files } = await supabase.storage
      .from("avatars")
      .list("", {
        search: user.id,
      });

    if (files && files.length > 0) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(files[0].name);
      avatarUrl = publicUrl;
    }
  }

  return (
    <ProfilContent
      user={{
        id: user.id,
        email: user.email || "",
        fullName,
        avatarUrl,
        gender,
        phone,
        company,
      }}
    />
  );
}
