import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { ArrowLeft, Download, Calendar, CreditCard, CheckCircle } from "lucide-react";
import dynamic from "next/dynamic";
import WorkflowTimelineClient from "@/components/WorkflowTimelineClient";
import WorkflowGuideClient from "./WorkflowGuideClient";

// Lazy loading du composant de messagerie
const MessageThreadClient = dynamic(() => import("./MessageThreadClient"), {
  loading: () => (
    <div className="h-[600px] flex items-center justify-center">
      <p className="text-gray-500">Chargement de la messagerie...</p>
    </div>
  ),
});

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
  final_price: number | null;
  price_justification: string | null;
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

// ✅ Type adapté à votre structure
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
  const type = fileType.toLowerCase();
  if (type.includes("pdf")) return "📄";
  if (type.includes("zip") || type.includes("rar")) return "🗜️";
  if (type.includes("image") || type.includes("png") || type.includes("jpg"))
    return "🖼️";
  if (type.includes("video") || type.includes("mp4")) return "🎬";
  return "📎";
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DemandeDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Récupérer la demande
  const { data: demande, error: requestError } = await supabase
    .from("requests")
    .select("*")
    .eq("id", id)
    .single();

  if (requestError || !demande) {
    notFound();
  }

  // Vérifier si admin
  const { data: adminCheck } = await supabase
    .from("admin_users")
    .select("is_admin")
    .eq("user_id", user.id)
    .single();

  const isAdmin = adminCheck?.is_admin || false;

  // Admin voit tout, client que ses demandes
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

  // ✅ Récupérer les livrables
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
          <Link href="/demandes">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Retour à mes demandes
            </Button>
          </Link>
        </div>

        {/* Card principale */}
        <Card variant="elevated" className="overflow-hidden">
          {/* Header demande */}
          <CardHeader className="bg-gradient-to-r from-orange-500 to-sky-500 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide opacity-90 mb-2">
                  Demande #{request.id.slice(0, 8)}
                </p>
                <CardTitle className="text-3xl text-white">{request.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" size="sm" className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                  {formatStatus(request.status)}
                </Badge>
                {request.status === "awaiting_payment" && request.final_price && (
                  <Badge variant="default" size="sm" className="bg-orange-500 text-white border-orange-600 animate-pulse">
                    💳 Paiement requis
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Créée le {formatDate(request.created_at)}
              </div>
            </div>
          </CardHeader>

          {/* Contenu */}
          <CardBody className="p-6 space-y-6">
            {/* Timeline et Guide du Workflow */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <WorkflowTimelineClient
                requestId={request.id}
                currentStatus={request.status || "pending"}
              />
              <WorkflowGuideClient
                currentStatus={request.status || "pending"}
                requestId={request.id}
                hasFinalPrice={!!request.final_price}
                hasPriceJustification={!!request.price_justification}
                hasDeliverables={deliverables.length}
              />
            </div>

            {/* Description */}
            <section>
              <CardTitle className="text-lg mb-3">
                Description de votre projet
              </CardTitle>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {request.description}
              </p>
            </section>

            {/* Infos projet */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card variant="bordered" className="bg-gray-50">
                <CardBody className="p-4">
                  <p className="text-xs uppercase text-gray-500 mb-1">
                    Budget proposé
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatBudget(request.budget_proposed)}
                  </p>
                </CardBody>
              </Card>
              <Card variant="bordered" className="bg-gray-50">
                <CardBody className="p-4">
                  <p className="text-xs uppercase text-gray-500 mb-1">
                    Complexité
                  </p>
                  <p className="font-semibold text-gray-900">
                    {request.complexity || "—"}
                  </p>
                </CardBody>
              </Card>
              <Card variant="bordered" className="bg-gray-50">
                <CardBody className="p-4">
                  <p className="text-xs uppercase text-gray-500 mb-1">Urgence</p>
                  <p className="font-semibold text-gray-900">
                    {request.urgency || "—"}
                  </p>
                </CardBody>
              </Card>
              <Card variant="bordered" className="bg-gray-50">
                <CardBody className="p-4">
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
                </CardBody>
              </Card>
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
                  <Card variant="bordered" className="bg-purple-50 border-purple-200 mb-4">
                    <CardBody className="p-4">
                      <CardTitle className="text-sm text-purple-900 mb-2">
                        📋 Résumé du besoin
                      </CardTitle>
                      <p className="text-sm text-purple-800 leading-relaxed">
                        {analysis.summary}
                      </p>
                    </CardBody>
                  </Card>
                )}

                {/* Livrables attendus (IA) */}
                {analysis.deliverables && analysis.deliverables.length > 0 && (
                  <Card variant="bordered" className="bg-blue-50 border-blue-200 mb-4">
                    <CardBody className="p-4">
                      <CardTitle className="text-sm text-blue-900 mb-3">
                        📦 Livrables attendus
                      </CardTitle>
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
                    </CardBody>
                  </Card>
                )}

                {/* Prix estimé */}
                {analysis.estimated_price_fcfa && (
                  <Card variant="bordered" className="bg-emerald-50 border-emerald-200 mb-4">
                    <CardBody className="p-4">
                      <CardTitle className="text-sm text-emerald-900 mb-2">
                        💰 Estimation de prix
                      </CardTitle>
                      <p className="text-2xl font-bold text-emerald-700">
                        {formatBudget(analysis.estimated_price_fcfa)}
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        Prix indicatif basé sur votre cahier des charges
                      </p>
                    </CardBody>
                  </Card>
                )}

                {/* Questions de clarification */}
                {analysis.clarification_questions &&
                  analysis.clarification_questions.length > 0 && (
                    <Card variant="bordered" className="bg-amber-50 border-amber-200">
                      <CardBody className="p-4">
                        <CardTitle className="text-sm text-amber-900 mb-3">
                          ❓ Questions pour affiner le devis
                        </CardTitle>
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
                      </CardBody>
                    </Card>
                  )}

                {/* Prix final et justification */}
                {request.final_price && (
                  <Card variant="bordered" className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300 mt-6">
                    <CardBody className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-emerald-900">
                            Devis Final
                          </CardTitle>
                          <p className="text-xs text-emerald-600">
                            Prix validé par notre équipe
                          </p>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-6 mb-4 border-2 border-emerald-200">
                        <div className="flex items-baseline justify-between mb-4">
                          <span className="text-sm font-semibold text-gray-600">
                            Montant à payer
                          </span>
                          <span className="text-4xl font-black text-emerald-600">
                            {formatBudget(request.final_price)}
                          </span>
                        </div>

                        {request.price_justification && (
                          <div className="pt-4 border-t border-emerald-100">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">
                              Justification du tarif
                            </h3>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {request.price_justification}
                            </p>
                          </div>
                        )}
                      </div>

                      {request.status === "awaiting_payment" && (
                        <div className="space-y-3">
                          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                                  <CreditCard className="w-5 h-5 text-white" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-orange-900 mb-1">
                                  Action requise : Paiement en attente
                                </h4>
                                <p className="text-sm text-orange-700">
                                  Pour lancer la production de votre projet, veuillez procéder au paiement du devis.
                                </p>
                              </div>
                            </div>
                          </div>
                          <Link href={`/demandes/${request.id}/paiement`}>
                            <Button
                              variant="primary"
                              size="lg"
                              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
                              rightIcon={<CreditCard className="w-5 h-5" />}
                            >
                              💳 Payer maintenant
                            </Button>
                          </Link>
                        </div>
                      )}

                      {request.status === "in_production" && (
                        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-100 rounded-lg p-4">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-semibold">
                            Paiement confirmé - Votre projet est en production
                          </span>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                )}

                {/* Bouton valider devis (si pas de prix final mais statut awaiting_payment) */}
                {request.status === "awaiting_payment" && !request.final_price && (
                  <Card variant="bordered" className="bg-gradient-to-r from-orange-50 to-sky-50 border-orange-200 mt-6">
                    <CardBody className="p-4">
                      <p className="text-sm text-gray-700 mb-3">
                        Votre devis est en préparation. Vous recevrez bientôt le prix final.
                      </p>
                    </CardBody>
                  </Card>
                )}
              </section>
            ) : (
              <section className="border-t border-gray-200 pt-6">
                <Card variant="bordered" className="bg-gray-50">
                  <CardBody className="p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 mx-auto mb-3">
                      <span className="text-2xl">⏳</span>
                    </div>
                    <CardTitle className="text-sm mb-1">
                      Analyse en cours
                    </CardTitle>
                    <p className="text-xs text-gray-600">
                      Notre équipe analyse votre demande. Vous recevrez le devis
                      sous 48h.
                    </p>
                  </CardBody>
                </Card>
              </section>
            )}

            {/* ✅ LIVRABLES FINAUX (adapté à votre structure) */}
            {deliverables.length > 0 && (
              <section className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <span className="text-lg">🎉</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Vos livrables ({deliverables.length})
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl">
                            {getFileIcon(deliverable.file_type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {deliverable.title}
                            </h4>
                            {deliverable.description && (
                              <p className="text-xs text-gray-600 mt-1">
                                {deliverable.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {formatDate(deliverable.created_at)}
                            </p>
                          </div>
                        </div>
                        {deliverable.file_url && (
                          <a
                            href={deliverable.file_url}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-4"
                          >
                            <Button variant="success" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                              Télécharger
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Message si status = delivered mais pas de livrables */}
            {request.status === "delivered" && deliverables.length === 0 && (
              <section className="border-t border-gray-200 pt-6">
                <Card variant="bordered" className="bg-blue-50 border-blue-200">
                  <CardBody className="p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-200 mx-auto mb-3">
                      <span className="text-2xl">📦</span>
                    </div>
                    <CardTitle className="text-sm mb-1">
                      Livrables en préparation
                    </CardTitle>
                    <p className="text-xs text-gray-600">
                      Les fichiers finaux seront disponibles très bientôt.
                    </p>
                  </CardBody>
                </Card>
              </section>
            )}

            {/* Messagerie */}
            <section className="border-t border-gray-200 pt-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-2">💌 Communication</h2>
                <p className="text-sm text-gray-600">
                  Échangez directement avec l'équipe Solution360° concernant votre demande.
                </p>
              </div>
              <MessageThreadClient requestId={request.id} />
            </section>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
