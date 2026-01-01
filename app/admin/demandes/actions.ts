"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../lib/supabase-server";

type WorkflowStep =
  | "analysis"
  | "awaiting_payment"
  | "in_production"
  | "delivered";
type AiPhase = "none" | "deepseek" | "gpt4o";

export async function mettreAJourDemandeAdmin(formData: FormData) {
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

  // Vérifier que l'utilisateur est admin
  const { data: adminCheck } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  if (!adminCheck) {
    return { ok: false, message: "Accès refusé." };
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
    .eq("id", id);

  if (error) {
    console.error("SUPABASE UPDATE ERROR:", error);
    return { ok: false, message: "Mise à jour impossible." };
  }

  revalidatePath("/admin/demandes");
  return { ok: true, message: "Demande mise à jour." };
}

export async function lancerAnalyseIA(formData: FormData) {
  const request_id = formData.get("request_id") as string;

  console.log("🚀 lancerAnalyseIA appelée pour request_id:", request_id);

  if (!request_id) {
    return { ok: false, message: "ID manquant" };
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("👤 User:", user?.email || "Non connecté");

  if (!user) {
    return { ok: false, message: "Non authentifié." };
  }

  // Vérifier que l'utilisateur est admin
  const { data: adminCheck } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  if (!adminCheck) {
    console.log("❌ Utilisateur non admin");
    return { ok: false, message: "Accès refusé." };
  }

  console.log("✅ Utilisateur admin confirmé");

  // Récupérer la demande
  const { data: req, error: reqError } = await supabase
    .from("requests")
    .select("*")
    .eq("id", request_id)
    .single();

  if (reqError || !req) {
    console.log("❌ Demande introuvable:", reqError);
    return { ok: false, message: "Demande introuvable" };
  }

  console.log("✅ Demande trouvée:", req.title);

  // Appeler DeepSeek API directement
  const deepseekResponse = await callDeepSeekAPI({
    title: req.title,
    description: req.description,
    complexity: req.complexity,
    urgency: req.urgency,
    budget_proposed: req.budget_proposed,
  });

  if (!deepseekResponse.ok) {
    console.log("❌ Erreur DeepSeek API");
    return { ok: false, message: "Erreur lors de l'analyse IA" };
  }

  console.log("✅ Réponse DeepSeek reçue");

  // Stocker l'analyse
  const { error: insertError } = await supabase.from("ai_analyses").upsert(
    {
      request_id,
      ai_provider: "deepseek",
      summary: deepseekResponse.summary,
      deliverables: deepseekResponse.deliverables,
      estimated_price_fcfa: deepseekResponse.estimated_price_fcfa,
      clarification_questions: deepseekResponse.clarification_questions,
      raw_response: deepseekResponse.raw,
    },
    { onConflict: "request_id" }
  );

  if (insertError) {
    console.error("❌ SUPABASE INSERT AI_ANALYSES ERROR:", insertError);
    return { ok: false, message: "Impossible de sauvegarder l'analyse" };
  }

  console.log("✅ Analyse sauvegardée dans Supabase");

  // Mettre à jour la demande
  await supabase
    .from("requests")
    .update({
      ai_phase: "deepseek",
      updated_at: new Date().toISOString(),
    })
    .eq("id", request_id);

  console.log("✅ Demande mise à jour (ai_phase = deepseek)");

  revalidatePath("/admin/demandes");
  return { ok: true, message: "Analyse lancée avec succès" };
}

// Fonction d'appel à DeepSeek API
async function callDeepSeekAPI(params: {
  title: string;
  description: string;
  complexity: string | null;
  urgency: string | null;
  budget_proposed: number | null;
}) {
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

  console.log("🔑 DEEPSEEK_API_KEY présente ?", !!DEEPSEEK_API_KEY);

  if (!DEEPSEEK_API_KEY) {
    console.error("❌ DEEPSEEK_API_KEY manquante dans .env.local");
    return { ok: false };
  }

  const prompt = `Tu es un consultant business spécialisé dans l'analyse de projets digitaux en Afrique francophone.

Voici une demande client :

Titre : ${params.title}
Description : ${params.description}
Complexité perçue : ${params.complexity || "Non spécifiée"}
Urgence : ${params.urgency || "Normale"}
Budget proposé par le client : ${params.budget_proposed ? `${params.budget_proposed} FCFA` : "Non spécifié"}

Ta mission :
1. Résume clairement le besoin client (2-3 phrases max).
2. Liste les livrables concrets attendus (format JSON array).
3. Propose une estimation de prix réaliste en FCFA (entier).
4. Si des informations manquent, pose 2-3 questions de clarification (format JSON array).

Réponds UNIQUEMENT en JSON valide avec cette structure :
{
  "summary": "...",
  "deliverables": ["Livrable 1", "Livrable 2", ...],
  "estimated_price_fcfa": 500000,
  "clarification_questions": ["Question 1 ?", "Question 2 ?", ...]
}`;

  console.log("🤖 Appel DeepSeek API en cours...");
  console.log("📋 Params:", { title: params.title, complexity: params.complexity });

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en analyse de projets digitaux. Tu réponds toujours en JSON valide.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ DeepSeek API error:", errorText);
      return { ok: false };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    console.log("📦 Réponse brute DeepSeek:", content);

    // Parser le JSON retourné par DeepSeek
    const parsed = JSON.parse(content);

    console.log("✅ JSON parsé avec succès");

    return {
      ok: true,
      summary: parsed.summary || "",
      deliverables: parsed.deliverables || [],
      estimated_price_fcfa: parsed.estimated_price_fcfa || null,
      clarification_questions: parsed.clarification_questions || [],
      raw: data,
    };
  } catch (error) {
    console.error("❌ DeepSeek API call failed:", error);
    return { ok: false };
  }
}
