"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function creerDemande(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  // Récupérer l'utilisateur connecté
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Vous devez être connecté pour créer une demande.",
    };
  }

  const titre = (formData.get("titre") as string | null)?.trim() || "";
  const type = (formData.get("type") as string | null) || "";
  const budget = (formData.get("budget") as string | null)?.trim() || "";
  const description =
    (formData.get("description") as string | null)?.trim() || "";
  const complexite =
    (formData.get("complexite") as string | null)?.trim() || null;
  const urgence = (formData.get("urgence") as string | null)?.trim() || null;
  const ai_phase =
    (formData.get("ai_phase") as string | null)?.trim() || "none";

  if (!titre || !description) {
    return {
      ok: false,
      message: "Le titre et la description sont obligatoires.",
    };
  }

  // Budget texte -> entier FCFA approximatif
  let budgetValue: number | null = null;
  if (budget) {
    const digits = budget.replace(/[^\d]/g, "");
    if (digits) {
      budgetValue = Number(digits);
    }
  }

  const { error } = await supabase.from("requests").insert({
    user_id: user.id, // ← Remplissage automatique
    title: titre,
    description,
    budget_proposed: budgetValue,
    status: "analysis",
    complexity: complexite,
    urgency: urgence,
    ai_phase,
  });

  if (error) {
    console.error("SUPABASE INSERT ERROR:", error);
    return {
      ok: false,
      message: "Impossible d'enregistrer la demande. Réessayez plus tard.",
    };
  }

  revalidatePath("/demandes");

  return {
    ok: true,
    message: "Demande créée avec succès.",
  };
}
