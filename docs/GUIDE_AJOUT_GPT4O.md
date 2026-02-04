# 🤖 GUIDE : Ajouter le Support GPT-4o
**Solution360° - Par MonAP**

---

## 📋 Vue d'Ensemble

Ce guide explique comment ajouter le support GPT-4o à l'intégration IA existante. Actuellement, seul DeepSeek est utilisé, mais la structure est prête pour ajouter GPT-4o.

---

## 🎯 Objectif

Ajouter GPT-4o comme option alternative ou prioritaire à DeepSeek, avec fallback automatique.

---

## 📝 Étapes d'Implémentation

### **Étape 1 : Créer la Fonction `callGPT4oAPI()`**

Dans `src/app/api/analyze-request/route.ts`, ajouter cette fonction après `callDeepSeekAPI()` :

```typescript
// Fonction d'appel à GPT-4o API
async function callGPT4oAPI(params: {
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
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    logger.log("⚠️ OPENAI_API_KEY non configurée");
    return { ok: false };
  }

  const prompt = buildAnalysisPrompt(params);

  logger.log("🤖 Appel GPT-4o API en cours...");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Tu es un expert consultant en analyse de projets digitaux pour l'Afrique francophone. Tu réponds toujours en JSON valide et structuré.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("❌ GPT-4o API error:", errorText);
      return { ok: false };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    logger.log("📦 Réponse brute GPT-4o:", content);

    let parsed;
    try {
      parsed = JSON.parse(content);
      logger.log("✅ JSON parsé avec succès (GPT-4o)");
    } catch (parseError) {
      logger.error("❌ Erreur parsing JSON GPT-4o:", parseError);
      return { ok: false };
    }

    return {
      ok: true,
      provider: "gpt-4o",
      summary: parsed.summary || "",
      deliverables: parsed.deliverables || [],
      estimated_price_fcfa: parsed.estimated_price_fcfa || null,
      clarification_questions: parsed.clarification_questions || [],
      raw: data,
    };
  } catch (error) {
    logger.error("❌ GPT-4o API call failed:", error);
    return { ok: false };
  }
}
```

---

### **Étape 2 : Modifier la Logique d'Appel**

Dans la fonction `POST()`, remplacer :

```typescript
// Appeler DeepSeek API
const aiResponse = await callDeepSeekAPI({
  title: req.title,
  description: req.description,
  complexity: req.complexity,
  urgency: req.urgency,
  budget_proposed: req.budget_proposed,
});
```

Par :

```typescript
// Appeler l'API IA (GPT-4o en priorité, DeepSeek en fallback)
let aiResponse = await callGPT4oAPI({
  title: req.title,
  description: req.description,
  complexity: req.complexity,
  urgency: req.urgency,
  budget_proposed: req.budget_proposed,
});

// Fallback vers DeepSeek si GPT-4o échoue ou n'est pas configuré
if (!aiResponse.ok) {
  logger.log("⚠️ GPT-4o non disponible, utilisation de DeepSeek");
  aiResponse = await callDeepSeekAPI({
    title: req.title,
    description: req.description,
    complexity: req.complexity,
    urgency: req.urgency,
    budget_proposed: req.budget_proposed,
  });
}

if (!aiResponse.ok) {
  logger.error("❌ Erreur API IA (GPT-4o et DeepSeek)");
  return NextResponse.json(
    { error: "Erreur lors de l'analyse IA. Veuillez réessayer." },
    { status: 500 }
  );
}
```

---

### **Étape 3 : Mettre à Jour le Stockage**

Remplacer :

```typescript
ai_provider: "deepseek",
```

Par :

```typescript
ai_provider: aiResponse.provider,
```

Et :

```typescript
ai_phase: "deepseek",
```

Par :

```typescript
ai_phase: aiResponse.provider,
```

---

### **Étape 4 : Configuration**

Ajouter dans `.env.local` :

```env
OPENAI_API_KEY=votre_cle_openai
```

---

## ✅ Vérification

1. Tester avec `OPENAI_API_KEY` configurée → GPT-4o doit être utilisé
2. Tester sans `OPENAI_API_KEY` → DeepSeek doit être utilisé en fallback
3. Vérifier que `ai_provider` est correctement stocké dans `ai_analyses`
4. Vérifier les logs pour confirmer le provider utilisé

---

## 📝 Notes

- La fonction `buildAnalysisPrompt()` est déjà partagée
- Le format de réponse est identique entre GPT-4o et DeepSeek
- Le fallback est automatique et transparent
- Les logs indiquent clairement quel provider est utilisé

---

**Signé : MonAP - Chef de Projet Solution360°**
