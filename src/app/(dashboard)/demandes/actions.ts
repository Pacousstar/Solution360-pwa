"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type WorkflowStep =
  | "analysis"
  | "awaiting_payment"
  | "in_production"
  | "delivered";
type AiPhase = "none" | "deepseek" | "gpt4o";

export async function mettreAJourDemande(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as WorkflowStep | null;
  const ai_phase = formData.get("ai_phase") as AiPhase | null;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Non authentifié." };
  }

  const payload: { status?: WorkflowStep; ai_phase?: AiPhase } = {};
  if (status) payload.status = status;
  if (ai_phase) payload.ai_phase = ai_phase;

  const { error } = await supabase
    .from("requests")
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id); // ← Sécurité : ne peut modifier que ses propres demandes

  if (error) {
    console.error("SUPABASE UPDATE ERROR:", error);
    return { ok: false, message: "Mise à jour impossible." };
  }

  revalidatePath("/demandes");
  return { ok: true, message: "Demande mise à jour." };
}
