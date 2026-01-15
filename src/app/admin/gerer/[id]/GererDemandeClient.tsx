"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface GererDemandeClientProps {
  demande: any;
  deliverables: any[];
  uploadStatus?: string;
  statusUpdate?: string;
  uploadMessage?: string;
}

type TabType = "analyse" | "tarification" | "reponse" | "statut" | "notes" | "livrables";

export default function GererDemandeClient({
  demande: initialDemande,
  deliverables: initialDeliverables,
  uploadStatus,
  statusUpdate,
  uploadMessage,
}: GererDemandeClientProps) {
  const router = useRouter();
  const [demande, setDemande] = useState(initialDemande);
  const [activeTab, setActiveTab] = useState<TabType>("statut");
  const [notes, setNotes] = useState(demande.admin_notes || "");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deliverables, setDeliverables] = useState(initialDeliverables);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // États pour Analyse IA
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(demande.ai_analyses?.[0] || null);

  // États pour Tarification
  const [finalPrice, setFinalPrice] = useState<string>(demande.final_price?.toString() || "");
  const [priceJustification, setPriceJustification] = useState<string>(demande.price_justification || "");
  const [sendingQuote, setSendingQuote] = useState(false);

  // États pour Réponse
  const [responseTemplate, setResponseTemplate] = useState<string>("");
  const [adminResponse, setAdminResponse] = useState<string>("");
  const [sendingResponse, setSendingResponse] = useState(false);

  // Récupérer infos client
  const clientName = demande.user?.raw_user_meta_data?.full_name || demande.user?.email?.split("@")[0] || "Client";
  const clientEmail = demande.user?.email || "";

  // Afficher messages depuis URL
  useEffect(() => {
    if (uploadStatus === "success") {
      setMessage("✅ Livrable uploadé avec succès !");
    } else if (uploadStatus === "error") {
      setMessage(`❌ Erreur : ${uploadMessage || "Upload échoué"}`);
    } else if (statusUpdate === "updated") {
      setMessage("✅ Statut mis à jour avec succès !");
    }
  }, [uploadStatus, statusUpdate, uploadMessage]);

  // Lancer analyse IA
  const handleAnalyzeWithAI = async () => {
    setAnalyzing(true);
    setMessage("⏳ Analyse IA en cours...");

    try {
      const response = await fetch("/api/analyze-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: demande.id }),
      });

      const data = await response.json();

      if (data.ok && data.analysis) {
        setAiAnalysis(data.analysis);
        setMessage("✅ Analyse IA terminée ! Consultez les résultats ci-dessous.");
        // Si pas de prix final, pré-remplir avec l'estimation IA
        if (!finalPrice && data.analysis.estimated_price_fcfa) {
          setFinalPrice(data.analysis.estimated_price_fcfa.toString());
        }
        router.refresh();
      } else {
        setMessage(`❌ Erreur : ${data.error || "Analyse IA échouée"}`);
      }
    } catch (error: any) {
      setMessage(`❌ Erreur : ${error.message}`);
    }

    setAnalyzing(false);
  };

  // Envoyer devis
  const handleSendQuote = async () => {
    if (!finalPrice || !priceJustification.trim()) {
      setMessage("❌ Veuillez saisir le prix et la justification");
      return;
    }

    const price = parseFloat(finalPrice.replace(/\s/g, ""));
    if (isNaN(price) || price <= 0) {
      setMessage("❌ Prix invalide");
      return;
    }

    setSendingQuote(true);
    setMessage("⏳ Envoi du devis...");

    try {
      const response = await fetch("/api/admin/demandes/envoyer-devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: demande.id,
          finalPrice: price,
          priceJustification,
          clientEmail,
          clientName,
          requestTitle: demande.title,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("✅ Devis envoyé avec succès ! Statut changé à 'En attente de paiement'.");
        setDemande({ ...demande, status: "awaiting_payment", final_price: price, price_justification: priceJustification });
        router.refresh();
      } else {
        setMessage(`❌ Erreur : ${data.error || "Envoi du devis échoué"}`);
      }
    } catch (error: any) {
      setMessage(`❌ Erreur : ${error.message}`);
    }

    setSendingQuote(false);
  };

  // Envoyer réponse
  const handleSendResponse = async () => {
    if (!adminResponse.trim()) {
      setMessage("❌ Veuillez rédiger un message");
      return;
    }

    setSendingResponse(true);
    setMessage("⏳ Envoi de la réponse...");

    try {
      const response = await fetch("/api/admin/demandes/envoyer-reponse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: demande.id,
          adminResponse,
          clientEmail,
          clientName,
          requestTitle: demande.title,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("✅ Réponse envoyée au client avec succès !");
        setAdminResponse("");
        setResponseTemplate("");
        router.refresh();
      } else {
        setMessage(`❌ Erreur : ${data.error || "Envoi de la réponse échoué"}`);
      }
    } catch (error: any) {
      setMessage(`❌ Erreur : ${error.message}`);
    }

    setSendingResponse(false);
  };

  // Choisir template
  const selectTemplate = (templateType: string) => {
    const templates: Record<string, string> = {
      devis: `Bonjour ${clientName},

Nous avons le plaisir de vous faire parvenir notre devis pour votre projet "${demande.title}".

Notre équipe a analysé votre demande en détail et nous sommes prêts à vous accompagner dans sa réalisation.

N'hésitez pas si vous avez des questions.

Cordialement,
L'équipe Solution360°`,

      clarification: `Bonjour ${clientName},

Merci pour votre demande concernant "${demande.title}".

Afin de mieux comprendre vos besoins et vous proposer la meilleure solution, nous aurions besoin de quelques précisions :

• [Question 1 ?]
• [Question 2 ?]
• [Question 3 ?]

Ces informations nous permettront d'affiner notre proposition.

Cordialement,
L'équipe Solution360°`,

      livraison: `Bonjour ${clientName},

Excellente nouvelle ! Votre projet "${demande.title}" est terminé et livré.

Vous pouvez maintenant télécharger tous les livrables depuis votre espace client :
https://solution360.app/demandes/${demande.id}

Si vous avez des questions ou besoin d'ajustements, n'hésitez pas à nous contacter.

Merci de votre confiance !
L'équipe Solution360°`,
    };

    const template = templates[templateType] || "";
    setResponseTemplate(templateType);
    setAdminResponse(template);
  };

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    setMessage("");
    const supabase = createClient();

    // Validation règles métier
    if (newStatus === "awaiting_payment" && !demande.final_price) {
      setMessage("❌ Impossible : Vous devez d'abord envoyer un devis (onglet Tarification)");
      setUpdating(false);
      setActiveTab("tarification");
      return;
    }

    const { error } = await supabase
      .from("requests")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", demande.id);

    if (!error) {
      setDemande({ ...demande, status: newStatus });
      setMessage(`✅ Statut → ${formatStatus(newStatus)}`);
      router.refresh();
    } else {
      setMessage(`❌ Erreur: ${error?.message}`);
    }
    setUpdating(false);
  };

  const saveNotes = async () => {
    setUpdating(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("requests")
      .update({ admin_notes: notes, updated_at: new Date().toISOString() })
      .eq("id", demande.id);

    if (!error) {
      setMessage("✅ Notes sauvegardées");
      router.refresh();
    } else {
      setMessage(`❌ Erreur: ${error.message}`);
    }
    setUpdating(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setMessage(`📎 Fichier sélectionné : ${file.name}`);
    }
  };

  const publishDeliverable = async () => {
    if (!selectedFile) {
      setMessage("❌ Veuillez sélectionner un fichier d'abord");
      return;
    }

    setUploading(true);
    setMessage("⏳ Publication en cours...");

    const formData = new FormData();
    formData.append("deliverable", selectedFile);
    formData.append("request_id", demande.id);
    formData.append("user_id", demande.user_id);

    try {
      const response = await fetch(`/api/upload-deliverable`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("✅ Livrable publié ! Le client peut le télécharger.");
        setSelectedFile(null);
        router.refresh();
      } else {
        const data = await response.json();
        setMessage(`❌ Erreur : ${data.error || "Upload échoué"}`);
      }
    } catch (error: any) {
      setMessage(`❌ Erreur : ${error.message}`);
    }

    setUploading(false);
  };

  const formatStatus = (s: string | null) =>
    ({
      pending: "⏳ En attente",
      draft: "🖊️ Brouillon",
      analysis: "🤖 En analyse",
      awaiting_payment: "💳 Attente Paiement",
      in_production: "⚙️ En production",
      delivered: "✅ Livré",
      cancelled: "❌ Annulé",
    }[s || ""] || s || "❓");

  const formatCurrency = (n: number | null) =>
    n
      ? new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XOF",
          maximumFractionDigits: 0,
        }).format(n)
      : "—";

  const tabs = [
    { id: "analyse" as TabType, label: "🤖 Analyse IA", icon: "🤖" },
    { id: "tarification" as TabType, label: "💰 Tarification", icon: "💰" },
    { id: "reponse" as TabType, label: "💬 Réponse", icon: "💬" },
    { id: "statut" as TabType, label: "🎯 Statut", icon: "🎯" },
    { id: "notes" as TabType, label: "📝 Notes", icon: "📝" },
    { id: "livrables" as TabType, label: "📦 Livrables", icon: "📦" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl mb-8">
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href={`/admin/detail/${demande.id}`}
              prefetch={true}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-md transition-all"
            >
              ← Détail complet
            </Link>
            <Link
              href="/admin/demandes"
              prefetch={true}
              className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Tableau Admin
            </Link>
            <div className="flex-1 min-w-0 text-right">
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-gray-900 to-emerald-600 bg-clip-text text-transparent">
                Gérer #{demande.id.slice(-8)}
              </h1>
              <div className="flex items-center gap-4 mt-2 justify-end">
                <span className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold text-lg shadow-lg">
                  {formatStatus(demande.status)}
                </span>
                {demande.final_price && (
                  <span className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(demande.final_price)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mx-auto max-w-2xl p-6 rounded-3xl shadow-xl mb-8 text-center font-bold text-xl ${
              message.includes("✅") || message.includes("📎")
                ? "bg-emerald-100 border-4 border-emerald-400 text-emerald-800"
                : message.includes("⏳")
                ? "bg-blue-100 border-4 border-blue-400 text-blue-800"
                : "bg-red-100 border-4 border-red-400 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        {/* Onglets */}
        <div className="bg-white rounded-3xl shadow-2xl mb-8 overflow-hidden">
          <div className="flex flex-wrap border-b-2 border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[150px] px-6 py-4 font-bold text-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-orange-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenu des onglets */}
          <div className="p-8">
            {/* ONGLET : Analyse IA */}
            {activeTab === "analyse" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border-2 border-blue-200">
                  <h3 className="text-2xl font-black text-blue-900 mb-4">🤖 Analyse Automatique par IA</h3>
                  <p className="text-gray-700 mb-6">
                    L'IA DeepSeek va analyser votre demande et proposer une estimation de prix, une liste de livrables et des questions de clarification.
                  </p>

                  {!aiAnalysis ? (
                    <button
                      onClick={handleAnalyzeWithAI}
                      disabled={analyzing}
                      className="w-full px-8 py-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-xl rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {analyzing ? "⏳ Analyse en cours..." : "🚀 Lancer l'analyse IA"}
                    </button>
                  ) : (
                    <div className="space-y-6 mt-6">
                      <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6">
                        <h4 className="font-black text-green-800 mb-4 text-lg">✅ Analyse terminée</h4>
                        <div className="space-y-4">
                          {aiAnalysis.summary && (
                            <div>
                              <h5 className="font-bold text-gray-800 mb-2">📋 Résumé :</h5>
                              <p className="text-gray-700 leading-relaxed">{aiAnalysis.summary}</p>
                            </div>
                          )}

                          {aiAnalysis.estimated_price_fcfa && (
                            <div>
                              <h5 className="font-bold text-gray-800 mb-2">💰 Prix estimé :</h5>
                              <p className="text-2xl font-black text-green-600">
                                {formatCurrency(aiAnalysis.estimated_price_fcfa)}
                              </p>
                            </div>
                          )}

                          {aiAnalysis.deliverables && aiAnalysis.deliverables.length > 0 && (
                            <div>
                              <h5 className="font-bold text-gray-800 mb-2">📦 Livrables proposés :</h5>
                              <ul className="list-disc list-inside space-y-1 text-gray-700">
                                {aiAnalysis.deliverables.map((del: string, idx: number) => (
                                  <li key={idx}>{del}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {aiAnalysis.clarification_questions && aiAnalysis.clarification_questions.length > 0 && (
                            <div>
                              <h5 className="font-bold text-gray-800 mb-2">❓ Questions de clarification :</h5>
                              <ul className="list-disc list-inside space-y-1 text-gray-700">
                                {aiAnalysis.clarification_questions.map((q: string, idx: number) => (
                                  <li key={idx}>{q}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={handleAnalyzeWithAI}
                          disabled={analyzing}
                          className="mt-6 px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50"
                        >
                          {analyzing ? "⏳ Réanalyse..." : "🔄 Relancer l'analyse"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ONGLET : Tarification */}
            {activeTab === "tarification" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-200">
                  <h3 className="text-2xl font-black text-green-900 mb-6">💰 Tarification et Devis</h3>

                  {/* Estimation IA si disponible */}
                  {aiAnalysis?.estimated_price_fcfa && (
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6 mb-6">
                      <h4 className="font-bold text-blue-800 mb-2">🤖 Estimation IA :</h4>
                      <p className="text-xl font-black text-blue-600">{formatCurrency(aiAnalysis.estimated_price_fcfa)}</p>
                      <p className="text-sm text-gray-600 mt-2">Vous pouvez utiliser cette estimation ou ajuster selon votre expertise.</p>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Prix final (FCFA) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={finalPrice}
                        onChange={(e) => setFinalPrice(e.target.value.replace(/\D/g, ""))}
                        placeholder="Ex: 500000"
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl text-xl font-bold focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-100"
                      />
                      {finalPrice && (
                        <p className="text-sm text-gray-600 mt-2">
                          = {new Intl.NumberFormat("fr-FR").format(parseInt(finalPrice) || 0)} FCFA
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Justification du tarif <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={priceJustification}
                        onChange={(e) => setPriceJustification(e.target.value)}
                        rows={6}
                        placeholder="Expliquez pourquoi ce prix, détaillez les livrables inclus, mentionnez les délais..."
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-100 resize-vertical"
                      />
                    </div>

                    <button
                      onClick={handleSendQuote}
                      disabled={sendingQuote || !finalPrice || !priceJustification.trim()}
                      className="w-full px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-xl rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingQuote ? "⏳ Envoi en cours..." : "📧 Envoyer le devis au client"}
                    </button>

                    {demande.final_price && (
                      <div className="bg-emerald-100 border-2 border-emerald-400 rounded-2xl p-6">
                        <p className="font-bold text-emerald-800 mb-2">✅ Devis déjà envoyé :</p>
                        <p className="text-2xl font-black text-emerald-600">{formatCurrency(demande.final_price)}</p>
                        {demande.price_justification && (
                          <p className="text-sm text-gray-700 mt-2">{demande.price_justification}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET : Réponse */}
            {activeTab === "reponse" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 border-2 border-purple-200">
                  <h3 className="text-2xl font-black text-purple-900 mb-6">💬 Réponse au Client</h3>

                  {/* Templates */}
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <button
                      onClick={() => selectTemplate("devis")}
                      className="px-6 py-4 bg-white border-2 border-purple-300 rounded-xl font-bold text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all"
                    >
                      📄 Devis
                    </button>
                    <button
                      onClick={() => selectTemplate("clarification")}
                      className="px-6 py-4 bg-white border-2 border-purple-300 rounded-xl font-bold text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all"
                    >
                      ❓ Clarification
                    </button>
                    <button
                      onClick={() => selectTemplate("livraison")}
                      className="px-6 py-4 bg-white border-2 border-purple-300 rounded-xl font-bold text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all"
                    >
                      ✅ Livraison
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Message au client <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      rows={10}
                      placeholder="Rédigez votre message au client... Vous pouvez personnaliser les templates ci-dessus."
                      className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100 resize-vertical"
                    />
                  </div>

                  <button
                    onClick={handleSendResponse}
                    disabled={sendingResponse || !adminResponse.trim()}
                    className="w-full px-8 py-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-black text-xl rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingResponse ? "⏳ Envoi en cours..." : "📧 Envoyer la réponse au client"}
                  </button>
                </div>
              </div>
            )}

            {/* ONGLET : Statut */}
            {activeTab === "statut" && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-10 shadow-2xl">
                  <h3 className="text-3xl font-black text-gray-900 mb-10 text-center">🎯 Changer statut</h3>

                  <div className="grid grid-cols-2 gap-6">
                    {[
                      {
                        status: "analysis",
                        label: "🤖 En analyse",
                        color: "from-blue-500 to-indigo-600",
                      },
                      {
                        status: "awaiting_payment",
                        label: "💳 Attente paiement",
                        color: "from-orange-500 to-red-500",
                      },
                      {
                        status: "in_production",
                        label: "⚙️ En production",
                        color: "from-purple-500 to-pink-500",
                      },
                      {
                        status: "delivered",
                        label: "✅ Livré",
                        color: "from-emerald-500 to-teal-600",
                      },
                    ].map(({ status: s, label, color }) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(s)}
                        disabled={updating || demande.status === s}
                        className={`
                          p-8 rounded-3xl font-black text-xl shadow-2xl transition-all hover:shadow-3xl hover:scale-[1.02]
                          ${
                            demande.status === s
                              ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-default shadow-lg"
                              : `bg-gradient-to-r ${color} text-white`
                          }
                          ${updating ? "opacity-50 cursor-not-allowed scale-95" : ""}
                        `}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET : Notes */}
            {activeTab === "notes" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-10 shadow-2xl">
                  <h3 className="text-3xl font-black text-orange-900 mb-8">📝 Notes Admin (Internes)</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-64 p-8 border-2 border-orange-200 rounded-3xl resize-vertical text-xl font-mono leading-relaxed focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all shadow-inner"
                    placeholder="• Date appel client...
• Questions posées...
• Actions à faire...
• Prix final proposé...
• Suivi paiement..."
                  />
                  <button
                    onClick={saveNotes}
                    disabled={updating || !notes.trim()}
                    className="mt-8 w-full px-12 py-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-2xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                  >
                    💾 SAUVEGARDER NOTES
                  </button>
                </div>
              </div>
            )}

            {/* ONGLET : Livrables */}
            {activeTab === "livrables" && (
              <div className="space-y-6">
                {/* Livrables existants */}
                {deliverables.length > 0 && (
                  <div className="bg-blue-50 rounded-3xl p-10 shadow-2xl">
                    <h3 className="text-3xl font-black text-blue-700 mb-6 text-center">
                      📦 Livrables uploadés ({deliverables.length})
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {deliverables.map((del: any) => (
                        <div
                          key={del.id}
                          className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-blue-200 shadow-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-lg font-bold text-gray-900 truncate">{del.title}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(del.created_at).toLocaleDateString("fr-FR")}
                              {del.description && ` • ${del.description}`}
                            </p>
                          </div>
                          {del.file_url && (
                            <a
                              href={del.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="ml-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all"
                            >
                              Télécharger
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload livrable */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-12 shadow-2xl">
                  <h3 className="text-3xl font-black text-emerald-900 mb-10 text-center">📎 Upload livrable final</h3>
                  <div className="max-w-2xl mx-auto">
                    <label className="block cursor-pointer">
                      <div className="border-4 border-dashed border-emerald-300 rounded-3xl p-12 text-center hover:border-emerald-400 transition-all hover:bg-emerald-50 group">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform">
                          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                        </div>
                        <p className="text-2xl font-bold text-emerald-700 mb-2 group-hover:text-emerald-800">
                          {selectedFile ? `📎 ${selectedFile.name}` : "Glisser fichier OU cliquer"}
                        </p>
                        <p className="text-lg text-emerald-600 mb-8">PDF, ZIP, PNG, JPG, MP4 • Max 50MB</p>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.zip,.png,.jpg,.jpeg,.mp4"
                          onChange={handleFileSelect}
                          disabled={uploading}
                        />
                      </div>
                    </label>

                    {selectedFile && (
                      <button
                        onClick={publishDeliverable}
                        disabled={uploading}
                        className="mt-8 w-full px-12 py-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-3xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                      >
                        {uploading ? "⏳ PUBLICATION EN COURS..." : "🚀 PUBLIER LIVRABLE FINAL"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
