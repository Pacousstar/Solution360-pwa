import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  logger.log("🚀 API /api/analyze-request appelée");
  
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    logger.log("👤 User:", user?.email || "Non connecté");

    if (!user) {
      logger.warn("❌ Utilisateur non authentifié");
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { request_id } = body;

    // Validation de sécurité
    const { validateRequestParams, isValidUUID, checkRateLimit } = await import('@/lib/security');
    
    // Rate limiting
    const rateLimitKey = `analyze:${user.id}`;
    if (!checkRateLimit(rateLimitKey, 5, 60000)) { // 5 requêtes par minute
      return NextResponse.json(
        { error: "Trop de requêtes. Veuillez patienter." },
        { status: 429 }
      );
    }

    // Validation des paramètres
    if (!request_id) {
      logger.warn("❌ request_id manquant");
      return NextResponse.json(
        { error: "request_id est requis" },
        { status: 400 }
      );
    }

    if (!isValidUUID(request_id)) {
      logger.warn("❌ request_id invalide (UUID)");
      return NextResponse.json(
        { error: "request_id invalide" },
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
      logger.error("❌ Demande introuvable:", reqError);
      return NextResponse.json(
        { error: "Demande introuvable" },
        { status: 404 }
      );
    }

    logger.log("✅ Demande trouvée:", req.title);

    // Vérifier que l'utilisateur est admin (utiliser la fonction centralisée)
    const { isAdmin } = await import("@/lib/admin/permissions");
    const adminStatus = await isAdmin(user.id, user.email || undefined);

    if (!adminStatus) {
      logger.warn("❌ Utilisateur non admin:", user.email);
      return NextResponse.json(
        { error: "Accès refusé - Réservé aux admins" },
        { status: 403 }
      );
    }

    logger.log("✅ Utilisateur admin confirmé");

    // Appeler DeepSeek API
    const aiResponse = await callDeepSeekAPI({
      title: req.title,
      description: req.description,
      complexity: req.complexity,
      urgency: req.urgency,
      budget_proposed: req.budget_proposed,
    });

    if (!aiResponse.ok) {
      logger.error("❌ Erreur DeepSeek API");
      return NextResponse.json(
        { error: "Erreur lors de l'analyse IA. Veuillez réessayer." },
        { status: 500 }
      );
    }

    logger.log("✅ Réponse DeepSeek reçue");

    // Stocker l'analyse
    const { error: insertError } = await supabase.from("ai_analyses").upsert(
      {
        request_id,
        ai_provider: "deepseek",
        summary: aiResponse.summary,
        deliverables: aiResponse.deliverables,
        estimated_price_fcfa: aiResponse.estimated_price_fcfa,
        clarification_questions: aiResponse.clarification_questions,
        raw_response: aiResponse.raw,
      },
      { onConflict: "request_id" }
    );

    if (insertError) {
      logger.error("❌ SUPABASE INSERT AI_ANALYSES ERROR:", insertError);
      return NextResponse.json(
        { error: "Impossible de sauvegarder l'analyse" },
        { status: 500 }
      );
    }

    logger.log("✅ Analyse sauvegardée dans Supabase");

    // Mettre à jour la demande
    await supabase
      .from("requests")
      .update({
        ai_phase: "deepseek",
        updated_at: new Date().toISOString(),
      })
      .eq("id", request_id);

    logger.log("✅ Demande mise à jour (ai_phase = deepseek)");

    return NextResponse.json({
      ok: true,
      analysis: aiResponse,
      provider: "deepseek",
    });
  } catch (error: any) {
    logger.error("❌ Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur. Veuillez réessayer." },
      { status: 500 }
    );
  }
}

// Fonction d'appel à DeepSeek API
// TODO: Ajouter support GPT-4o plus tard (fonction callGPT4oAPI à créer)
async function callDeepSeekAPI(params: {
  title: string;
  description: string;
  complexity: string | null;
  urgency: string | null;
  budget_proposed: number | null;
}): Promise<{
  ok: boolean;
  provider?: string;
  summary?: string;
  deliverables?: string[];
  estimated_price_fcfa?: number | null;
  clarification_questions?: string[];
  raw?: any;
}> {
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

  logger.log("🔑 DEEPSEEK_API_KEY présente ?", !!DEEPSEEK_API_KEY);

  if (!DEEPSEEK_API_KEY) {
    logger.error("❌ DEEPSEEK_API_KEY manquante dans .env.local");
    return { ok: false };
  }

  const prompt = buildAnalysisPrompt(params);

  logger.log("🤖 Appel DeepSeek API en cours...");
  logger.log("📋 Params:", { title: params.title, complexity: params.complexity });

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
      logger.error("❌ DeepSeek API error:", errorText);
      return { ok: false };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    logger.log("📦 Réponse brute DeepSeek:", content);

    // Parser le JSON retourné par DeepSeek
    let parsed;
    try {
      parsed = JSON.parse(content);
      logger.log("✅ JSON parsé avec succès");
    } catch (parseError) {
      logger.error("❌ Erreur parsing JSON DeepSeek:", parseError);
      return { ok: false };
    }

    return {
      ok: true,
      provider: "deepseek",
      summary: parsed.summary || "",
      deliverables: parsed.deliverables || [],
      estimated_price_fcfa: parsed.estimated_price_fcfa || null,
      clarification_questions: parsed.clarification_questions || [],
      raw: data,
    };
  } catch (error) {
    logger.error("❌ DeepSeek API call failed:", error);
    return { ok: false };
  }
}

// Fonction pour construire le prompt d'analyse
// TODO: Cette fonction pourra être partagée avec GPT-4o quand il sera ajouté
function buildAnalysisPrompt(params: {
  title: string;
  description: string;
  complexity: string | null;
  urgency: string | null;
  budget_proposed: number | null;
}): string {
  return `Tu es un consultant business spécialisé dans l'analyse de projets digitaux en Afrique francophone.

Voici une demande client :

Titre : ${params.title}
Description : ${params.description}
Complexité perçue : ${params.complexity || "Non spécifiée"}
Urgence : ${params.urgency || "Normale"}
Budget proposé par le client : ${params.budget_proposed ? `${params.budget_proposed} FCFA` : "Non spécifié"}

Ta mission :
1. Résume clairement le besoin client (2-3 phrases max).
2. Liste les livrables concrets attendus (format JSON array).
3. Propose une estimation de prix réaliste en FCFA (entier, basé sur le marché africain).
4. Si des informations manquent, pose 2-3 questions de clarification (format JSON array).

Réponds UNIQUEMENT en JSON valide avec cette structure :
{
  "summary": "...",
  "deliverables": ["Livrable 1", "Livrable 2", ...],
  "estimated_price_fcfa": 500000,
  "clarification_questions": ["Question 1 ?", "Question 2 ?", ...]
}`;
}
