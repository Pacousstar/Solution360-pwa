import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../lib/supabase-server";

export async function POST(request: NextRequest) {
  console.log("🚀 API /api/analyze-request appelée");
  
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("👤 User:", user?.email || "Non connecté");

  if (!user) {
    console.log("❌ Utilisateur non authentifié");
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { request_id } = await request.json();
  console.log("📝 Request ID reçu:", request_id);

  if (!request_id) {
    console.log("❌ request_id manquant");
    return NextResponse.json(
      { error: "request_id manquant" },
      { status: 400 }
    );
  }

  // Récupérer la demande
  const { data: req, error: reqError } = await supabase
    .from("requests")
    .select("*")
    .eq("id", request_id)
    .single();

  if (reqError || !req) {
    console.log("❌ Demande introuvable:", reqError);
    return NextResponse.json(
      { error: "Demande introuvable" },
      { status: 404 }
    );
  }

  console.log("✅ Demande trouvée:", req.title);

  // Vérifier que l'utilisateur est admin
  const { data: adminCheck } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  if (!adminCheck) {
    console.log("❌ Utilisateur non admin");
    return NextResponse.json(
      { error: "Accès refusé - Réservé aux admins" },
      { status: 403 }
    );
  }

  console.log("✅ Utilisateur admin confirmé");

  // Appeler DeepSeek API
  const deepseekResponse = await callDeepSeekAPI({
    title: req.title,
    description: req.description,
    complexity: req.complexity,
    urgency: req.urgency,
    budget_proposed: req.budget_proposed,
  });

  if (!deepseekResponse.ok) {
    console.log("❌ Erreur DeepSeek API");
    return NextResponse.json(
      { error: "Erreur API DeepSeek" },
      { status: 500 }
    );
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
    return NextResponse.json(
      { error: "Impossible de sauvegarder l'analyse" },
      { status: 500 }
    );
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

  return NextResponse.json({
    ok: true,
    analysis: deepseekResponse,
  });
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
