import { createSupabaseServerClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";

type RequestRow = {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  budget_proposed: number | null;
  status: string | null;
  complexity: string | null;
  urgency: string | null;
  ai_phase: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type AnalysisRow = {
  id: string;
  request_id: string;
  ai_provider: string;
  summary: string | null;
  deliverables: string[] | null;
  estimated_price_fcfa: number | null;
  clarification_questions: string[] | null;
  created_at: string | null;
};

type DeliverableRow = {
  id: string;
  request_id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
  created_at: string | null;
};

function formatStatus(s: string | null) {
  if (!s) return "Inconnu";
  const map: Record<string, string> = {
    draft: "Brouillon",
    analysis: "Analyse Solution360°",
    awaiting_payment: "En attente de paiement",
    in_production: "En production",
    delivered: "Livré",
    cancelled: "Annulé",
  };
  return map[s] || s;
}

function formatBudget(b: number | null) {
  if (!b || Number.isNaN(b)) return "Non spécifié";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(b);
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

function getFileIcon(fileType: string | null): string {
  if (!fileType) return "📎";
  const icons: Record<string, string> = {
    pdf: "📄",
    zip: "🗜️",
    figma: "🎨",
    github: "💻",
    drive: "☁️",
    link: "🔗",
  };
  return icons[fileType] || "📎";
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DemandeDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // ✅ MODIFIÉ : Admin voit TOUT, client voit SEULEMENT les siennes
  const { data: demande, error: requestError } = await supabase
    .from("requests")
    .select("*")
    .eq("id", id)
    .single();

  if (requestError || !demande) {
    notFound();
  }

  // ✅ NOUVEAU : Vérifier si admin
  const { data: adminCheck } = await supabase
    .from("admin_users")
    .select("is_admin")
    .eq("user_id", user.id)
    .single();

  const isAdmin = adminCheck?.is_admin || false;

  // ✅ MODIFIÉ : Admin voit TOUTES les demandes, client QUE les siennes
  if (!isAdmin && demande.user_id !== user.id) {
    notFound();
  }

  const request = demande as RequestRow;

  // Récupérer l'analyse IA
  const { data: analysisData } = await supabase
    .from("ai_analyses")
    .select("*")
    .eq("request_id", id)
    .single();

  const analysis = (analysisData as AnalysisRow) || null;

  // Récupérer les livrables finaux
  const { data: deliverablesData } = await supabase
    .from("deliverables")
    .select("*")
    .eq("request_id", id)
    .order("created_at", { ascending: false });

  const deliverables = (deliverablesData || []) as DeliverableRow[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-sky-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header avec retour */}
        <div className="mb-6">
          <Link
            href="/demandes"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Retour à mes demandes
          </Link>
        </div>

        {/* Card principale */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header demande */}
          <div className="bg-gradient-to-r from-orange-500 to-sky-500 px-6 py-8 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide opacity-90 mb-2">
                  Demande #{request.id.slice(0, 8)}
                </p>
                <h1 className="text-3xl font-bold">{request.title}</h1>
              </div>
              <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold">
                {formatStatus(request.status)}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Créée le {formatDate(request.created_at)}
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Description de votre projet
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {request.description}
              </p>
            </section>

            {/* Infos projet */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs uppercase text-gray-500 mb-1">
                  Budget proposé
                </p>
                <p className="font-semibold text-gray-900">
                  {formatBudget(request.budget_proposed)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs uppercase text-gray-500 mb-1">
                  Complexité
                </p>
                <p className="font-semibold text-gray-900">
                  {request.complexity || "—"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs uppercase text-gray-500 mb-1">Urgence</p>
                <p className="font-semibold text-gray-900">
                  {request.urgency || "—"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs uppercase text-gray-500 mb-1">
                  Phase IA
                </p>
                <p className="font-semibold text-gray-900">
                  {request.ai_phase === "deepseek"
                    ? "DeepSeek"
                    : request.ai_phase === "gpt4o"
                    ? "GPT-4o"
                    : "Aucune"}
                </p>
              </div>
            </section>

            {/* Analyse IA */}
            {analysis ? (
              <section className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <span className="text-lg">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Analyse Solution360°
                    </h2>
                    <p className="text-xs text-gray-500">
                      Générée le {formatDate(analysis.created_at)}
                    </p>
                  </div>
                </div>

                {/* Résumé */}
                {analysis.summary && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-semibold text-purple-900 mb-2">
                      📋 Résumé du besoin
                    </h3>
                    <p className="text-sm text-purple-800 leading-relaxed">
                      {analysis.summary}
                    </p>
                  </div>
                )}

                {/* Livrables attendus (IA) */}
                {analysis.deliverables &&
                  analysis.deliverables.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h3 className="text-sm font-semibold text-blue-900 mb-3">
                        📦 Livrables attendus
                      </h3>
                      <ul className="space-y-2">
                        {analysis.deliverables.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-blue-800"
                          >
                            <span className="text-blue-500 mt-0.5">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Prix estimé */}
                {analysis.estimated_price_fcfa && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                    <h3 className="text-sm font-semibold text-emerald-900 mb-2">
                      💰 Estimation de prix
                    </h3>
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatBudget(analysis.estimated_price_fcfa)}
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">
                      Prix indicatif basé sur votre cahier des charges
                    </p>
                  </div>
                )}

                {/* Questions de clarification */}
                {analysis.clarification_questions &&
                  analysis.clarification_questions.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-amber-900 mb-3">
                        ❓ Questions pour affiner le devis
                      </h3>
                      <ul className="space-y-2">
                        {analysis.clarification_questions.map((q, index) => (
                          <li
                            key={index}
                            className="text-sm text-amber-800 flex items-start gap-2"
                          >
                            <span className="text-amber-500 font-semibold">
                              {index + 1}.
                            </span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Bouton valider devis */}
                {request.status === "awaiting_payment" && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-sky-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-gray-700 mb-3">
                      Votre devis est prêt ! Validez-le pour passer au paiement
                      et lancer la production.
                    </p>
                    <button className="w-full bg-gradient-to-r from-orange-500 to-sky-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-sky-600 transition shadow-lg">
                      ✓ Valider ce devis et passer au paiement
                    </button>
                  </div>
                )}
              </section>
            ) : (
              <section className="border-t border-gray-200 pt-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 mx-auto mb-3">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Analyse en cours
                  </h3>
                  <p className="text-xs text-gray-600">
                    Notre équipe analyse votre demande. Vous recevrez le devis
                    sous 48h.
                  </p>
                </div>
              </section>
            )}

            {/* ✅ LIVRABLES FINAUX */}
            {request.status === "delivered" && deliverables.length > 0 && (
              <section className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <span className="text-lg">🎉</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Vos livrables
                    </h2>
                    <p className="text-xs text-gray-500">
                      Téléchargez ou consultez les fichiers finaux
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {deliverables.map((deliverable) => (
                    <div
                      key={deliverable.id}
                      className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getFileIcon(deliverable.file_type)}
                          </span>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {deliverable.title}
                            </h4>
                            {deliverable.description && (
                              <p className="text-xs text-gray-600 mt-1">
                                {deliverable.description}
                              </p>
                            )}
                          </div>
                        </div>
                        {deliverable.file_url && (
                          <a
                            href={deliverable.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700 transition flex items-center gap-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v6h16v-6m-2-8l-8-8-8 8m8 0v10"
                              />
                            </svg>
                            Accéder
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Mis à jour le {formatDate(deliverable.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Message si status = delivered mais pas de livrables */}
            {request.status === "delivered" && deliverables.length === 0 && (
              <section className="border-t border-gray-200 pt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-200 mx-auto mb-3">
                    <span className="text-2xl">📦</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Livrables en préparation
                  </h3>
                  <p className="text-xs text-gray-600">
                    Les fichiers finaux seront disponibles très bientôt.
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
