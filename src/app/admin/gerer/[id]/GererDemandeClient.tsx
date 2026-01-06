"use client";

import { useState } from "react";
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

export default function GererDemandeClient({
  demande: initialDemande,
  deliverables: initialDeliverables,
  uploadStatus,
  statusUpdate,
  uploadMessage,
}: GererDemandeClientProps) {
  const router = useRouter();
  const [demande, setDemande] = useState(initialDemande);
  const [notes, setNotes] = useState(demande.admin_notes || "");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deliverables, setDeliverables] = useState(initialDeliverables);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Afficher messages depuis URL
  useState(() => {
    if (uploadStatus === "success") {
      setMessage("✅ Livrable uploadé avec succès !");
    } else if (uploadStatus === "error") {
      setMessage(`❌ Erreur : ${uploadMessage || "Upload échoué"}`);
    } else if (statusUpdate === "updated") {
      setMessage("✅ Statut mis à jour avec succès !");
    }
  });

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    setMessage("");
    const supabase = createClient();

    const { error } = await supabase
      .from("requests")
      .update({ status: newStatus })
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
      .update({ admin_notes: notes })
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
      draft: "🖊️ Brouillon",
      analysis: "🤖 IA Analysis",
      awaiting_payment: "💳 Attente Paiement",
      in_production: "⚙️ Production",
      delivered: "✅ Livré",
      cancelled: "❌ Annulé",
    }[s || ""] || s || "❓");

  const formatCurrency = (n: number | null) =>
    n
      ? new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XOF",
        }).format(n)
      : "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl mb-8">
          <div className="flex flex-wrap items-center gap-6">
            <Link
              href={`/admin/detail/${demande.id}`}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-md"
            >
              ← Détail complet
            </Link>
            <Link
              href="/admin/demandes"
              className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl"
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
                <span className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(demande.budget_proposed)}
                </span>
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Statut */}
          <div>
            <div className="bg-white rounded-3xl p-10 shadow-2xl">
              <h3 className="text-3xl font-black text-gray-900 mb-10 text-center">
                🎯 Changer statut
              </h3>

              <div className="grid grid-cols-2 gap-6">
                {[
                  {
                    status: "analysis",
                    label: "🤖 Lancer IA Analysis",
                    color: "from-blue-500 to-indigo-600",
                  },
                  {
                    status: "awaiting_payment",
                    label: "💳 Demander paiement client",
                    color: "from-orange-500 to-red-500",
                  },
                  {
                    status: "in_production",
                    label: "⚙️ Passer en production",
                    color: "from-purple-500 to-pink-500",
                  },
                  {
                    status: "delivered",
                    label: "✅ Marquer comme livré",
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

          {/* Notes */}
          <div>
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-10 shadow-2xl">
              <h3 className="text-3xl font-black text-orange-900 mb-8">
                📝 Notes Admin
              </h3>
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
        </div>

        {/* ✅ Livrables existants (adapté à votre structure) */}
        {deliverables.length > 0 && (
          <div className="mt-12 bg-blue-50 rounded-3xl p-10 shadow-2xl">
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
                    <p className="text-lg font-bold text-gray-900 truncate">
                      {del.title}
                    </p>
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
        <div className="mt-12">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-12 shadow-2xl">
            <h3 className="text-3xl font-black text-emerald-900 mb-10 text-center">
              📎 Upload livrable final
            </h3>
            <div className="max-w-2xl mx-auto">
              <label className="block cursor-pointer">
                <div className="border-4 border-dashed border-emerald-300 rounded-3xl p-12 text-center hover:border-emerald-400 transition-all hover:bg-emerald-50 group">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform">
                    <svg
                      className="w-12 h-12 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-emerald-700 mb-2 group-hover:text-emerald-800">
                    {selectedFile
                      ? `📎 ${selectedFile.name}`
                      : "Glisser fichier OU cliquer"}
                  </p>
                  <p className="text-lg text-emerald-600 mb-8">
                    PDF, ZIP, PNG, JPG, MP4 • Max 50MB
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.zip,.png,.jpg,.jpeg,.mp4"
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                </div>
              </label>

              {/* ✅ BOUTON PUBLIER */}
              {selectedFile && (
                <button
                  onClick={publishDeliverable}
                  disabled={uploading}
                  className="mt-8 w-full px-12 py-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-3xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                >
                  {uploading
                    ? "⏳ PUBLICATION EN COURS..."
                    : "🚀 PUBLIER LIVRABLE FINAL"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
