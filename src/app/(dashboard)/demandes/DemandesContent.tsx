"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

type Props = {
  demandes: RequestRow[];
  userFullName: string;
};

// Fonction pour générer le numéro de demande basé sur les initiales
function generateRequestNumber(fullName: string, index: number): string {
  const names = fullName.trim().split(" ");
  const initials = names
    .map((n) => n[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2); // Max 2 initiales
  const number = String(index + 1).padStart(3, "0");
  return `${initials}${number}`;
}

function formatStatus(s: string | null) {
  if (!s) return "Inconnu";
  const map: Record<string, string> = {
    draft: "Brouillon",
    analysis: "Analyse en cours",
    awaiting_payment: "En attente de paiement",
    in_production: "En production",
    delivered: "Livré",
    cancelled: "Annulé",
  };
  return map[s] || s;
}

function getStatusColor(s: string | null): string {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700 border-gray-200",
    analysis: "bg-blue-100 text-blue-700 border-blue-200",
    awaiting_payment: "bg-orange-100 text-orange-700 border-orange-200",
    in_production: "bg-purple-100 text-purple-700 border-purple-200",
    delivered: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };
  return colors[s || "draft"] || "bg-gray-100 text-gray-700 border-gray-200";
}

function formatBudget(b: number | null) {
  if (!b || Number.isNaN(b)) return "Non spécifié";
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(b) + " F CFA";
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(d));
}

export default function DemandesContent({ demandes, userFullName }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "in_progress" | "completed">(
    "all"
  );

  // Filtrage et recherche
  const filteredDemandes = useMemo(() => {
    let filtered = demandes;

    // Filtrer par statut
    if (filterStatus === "in_progress") {
      filtered = filtered.filter(
        (d) =>
          d.status === "draft" ||
          d.status === "analysis" ||
          d.status === "awaiting_payment" ||
          d.status === "in_production"
      );
    } else if (filterStatus === "completed") {
      filtered = filtered.filter(
        (d) => d.status === "delivered" || d.status === "cancelled"
      );
    }

    // Recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.description.toLowerCase().includes(query) ||
          generateRequestNumber(userFullName, demandes.indexOf(d))
            .toLowerCase()
            .includes(query)
      );
    }

    return filtered;
  }, [demandes, searchQuery, filterStatus, userFullName]);

  // Statistiques
  const stats = {
    total: demandes.length,
    inProgress: demandes.filter(
      (d) =>
        d.status === "draft" ||
        d.status === "analysis" ||
        d.status === "awaiting_payment" ||
        d.status === "in_production"
    ).length,
    completed: demandes.filter((d) => d.status === "delivered").length,
  };

  // Déconnexion
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-sky-500 shadow-lg cursor-pointer hover:scale-105 transition-transform">
                  <span className="text-lg font-black text-white">S360</span>
                </div>
              </Link>
              <div>
                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                  Solution360°
                </p>
                <h1 className="text-xl font-black text-gray-900">
                  Tableau de bord
                </h1>
              </div>
            </div>

            {/* Notifications + Workflow IA */}
            <div className="flex items-center gap-3">
              {/* Workflow IA - Indicateur d'activité */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                <span className="text-xs font-bold text-purple-700">
                  ✨ Workflow IA actif
                </span>
              </div>

              {/* Cloche notifications */}
              <button className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {stats.inProgress > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                    {stats.inProgress}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                Total
              </p>
              <p className="text-3xl font-black text-blue-700">{stats.total}</p>
              <p className="text-xs text-blue-600 mt-1">demande(s)</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">
                En cours
              </p>
              <p className="text-3xl font-black text-orange-700">
                {stats.inProgress}
              </p>
              <p className="text-xs text-orange-600 mt-1">active(s)</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">
                Terminées
              </p>
              <p className="text-3xl font-black text-green-700">
                {stats.completed}
              </p>
              <p className="text-xs text-green-600 mt-1">livrée(s)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation + Recherche */}
      <section className="bg-white border-b border-gray-200 sticky top-[76px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Boutons de navigation */}
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/demandes"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all"
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Mes demandes
            </Link>

            <Link
              href="/nouvelle-demande"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 border-2 border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-200 hover:border-gray-300 transition-all"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nouvelle demande
            </Link>
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filterStatus === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tout ({stats.total})
            </button>
            <button
              onClick={() => setFilterStatus("in_progress")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filterStatus === "in_progress"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              En cours ({stats.inProgress})
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filterStatus === "completed"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Terminées ({stats.completed})
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par titre, numéro ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Liste des demandes */}
      <main className="flex-1 bg-gradient-to-br from-slate-50 via-orange-50/30 to-sky-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {filteredDemandes.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Aucune demande trouvée
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {searchQuery
                  ? "Essayez avec d'autres mots-clés"
                  : "Créez votre première demande pour commencer"}
              </p>
              {!searchQuery && (
                <Link
                  href="/nouvelle-demande"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-sky-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Créer une demande
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredDemandes.map((d, index) => {
                const requestNumber = generateRequestNumber(
                  userFullName,
                  demandes.indexOf(d)
                );
                return (
                  <Link
                    key={d.id}
                    href={`/demandes/${d.id}`}
                    className="block bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-xl hover:border-orange-300 hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-sky-500 text-white text-xs font-black">
                            #{requestNumber}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                              d.status
                            )}`}
                          >
                            {formatStatus(d.status)}
                          </span>
                        </div>
                        <h3 className="font-black text-xl leading-tight text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-2">
                          {d.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {d.description}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-xs text-gray-400 mb-1">Créée le</p>
                        <p className="text-sm font-semibold text-gray-700">
                          {formatDate(d.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                          Budget
                        </p>
                        <p className="font-bold text-gray-900">
                          {formatBudget(d.budget_proposed)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                          Urgence
                        </p>
                        <p className="font-semibold text-gray-700">
                          {d.urgency || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                          Complexité
                        </p>
                        <p className="font-semibold text-gray-700">
                          {d.complexity || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                          Phase IA
                        </p>
                        <p className="font-semibold text-blue-600">
                          {d.ai_phase === "deepseek"
                            ? "DeepSeek"
                            : d.ai_phase === "gpt4o"
                            ? "GPT-4o"
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      {/* Bottom Navigation - ✅ CORRIGÉE */}
      <nav className="bg-white border-t border-gray-200 sticky bottom-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-around items-center py-3">
            {/* Accueil */}
            <Link
              href="/"
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-orange-500 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="text-[10px] font-semibold">Accueil</span>
            </Link>

            {/* Mes Demandes */}
            <Link
              href="/demandes"
              className="flex flex-col items-center gap-1 text-orange-500"
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 2a2 2 0 00-2 2v16a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H9zm0 2h6v16H9V4z" />
              </svg>
              <span className="text-[10px] font-semibold">Demandes</span>
            </Link>

            {/* Nouvelle Demande (bouton central) */}
            <div className="relative -top-6">
              <Link
                href="/nouvelle-demande"
                className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-sky-500 text-white shadow-2xl hover:shadow-orange-500/50 hover:scale-110 transition-all"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </Link>
            </div>

            {/* Stats */}
            <Link
              href="/stats"
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-orange-500 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="text-[10px] font-semibold">Stats</span>
            </Link>

            {/* ✅ PROFIL 360° - CORRIGÉ : Link au lieu de button */}
            <Link
              href="/profil"
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-orange-500 transition-colors"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-sky-500 text-[10px] font-black text-white">
                360°
              </div>
              <span className="text-[10px] font-semibold">Profil</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
