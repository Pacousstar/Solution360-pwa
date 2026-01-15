"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Demande {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  user_id: string;
  budget_proposed?: number;
  user?: {
    email: string;
    raw_user_meta_data?: {
      full_name?: string;
      phone?: string;
      company?: string;
    };
  };
  ai_analyses?: Array<{
    estimated_price?: number;
    analysis_summary?: string;
  }>;
}

interface Stats {
  total_requests: number;
  draft_count: number;
  analysis_count: number;
  awaiting_payment_count: number;
  in_production_count: number;
  delivered_count: number;
  cancelled_count: number;
  total_revenue: number;
  avg_revenue: number;
}

interface Props {
  initialDemandes: Demande[];
  stats: Stats | null;
  userEmail: string;
  isSuperAdmin: boolean;
}

export default function DemandesAdminClient({
  initialDemandes,
  stats,
  userEmail,
  isSuperAdmin,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("kanban");

  // ✅ Filtrage des demandes
  const filteredDemandes = useMemo(() => {
    return initialDemandes.filter((d) => {
      const matchSearch =
        searchTerm === "" ||
        d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.user?.raw_user_meta_data?.full_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        d.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "all" || d.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [initialDemandes, searchTerm, statusFilter]);

  // ✅ Grouper par statut pour Kanban
  const groupedByStatus = useMemo(() => {
    const groups: Record<string, Demande[]> = {
      draft: [],
      analysis: [],
      awaiting_payment: [],
      in_production: [],
      delivered: [],
      cancelled: [],
    };

    filteredDemandes.forEach((d) => {
      const status = d.status || "draft";
      if (groups[status]) {
        groups[status].push(d);
      }
    });

    return groups;
  }, [filteredDemandes]);

  const formatStatus = (status: string) => {
    const statusMap: Record<string, { label: string; emoji: string }> = {
      draft: { label: "Brouillon", emoji: "🖊️" },
      analysis: { label: "Analyse IA", emoji: "🤖" },
      awaiting_payment: { label: "Attente Paiement", emoji: "💳" },
      in_production: { label: "En Production", emoji: "⚙️" },
      delivered: { label: "Livré", emoji: "✅" },
      cancelled: { label: "Annulé", emoji: "❌" },
    };
    return statusMap[status] || { label: status, emoji: "❓" };
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-700 border-gray-300",
      analysis: "bg-orange-100 text-orange-700 border-orange-300",
      awaiting_payment: "bg-yellow-100 text-yellow-700 border-yellow-300",
      in_production: "bg-blue-100 text-blue-700 border-blue-300",
      delivered: "bg-green-100 text-green-700 border-green-300",
      cancelled: "bg-red-100 text-red-700 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  return (
    <div>
      {/* Stats KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Demandes"
          value={stats?.total_requests || 0}
          icon="📊"
          color="from-orange-500 to-orange-600"
        />
        <StatCard
          title="En Production"
          value={stats?.in_production_count || 0}
          icon="⚙️"
          color="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Livrées"
          value={stats?.delivered_count || 0}
          icon="✅"
          color="from-green-500 to-green-600"
        />
        <StatCard
          title="CA Total"
          value={`${((stats?.total_revenue || 0) / 1000).toFixed(0)}K`}
          icon="💰"
          color="from-emerald-500 to-emerald-600"
          subtitle="FCFA"
        />
      </div>

      {/* Barre de recherche + filtres */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1 relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
              placeholder="Rechercher par titre, client, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          {/* Filtre statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all bg-white font-semibold"
          >
            <option value="all">📋 Tous les statuts</option>
            <option value="draft">🖊️ Brouillon</option>
            <option value="analysis">🤖 Analyse IA</option>
            <option value="awaiting_payment">💳 Attente Paiement</option>
            <option value="in_production">⚙️ En Production</option>
            <option value="delivered">✅ Livré</option>
            <option value="cancelled">❌ Annulé</option>
          </select>

          {/* Toggle vue */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-orange-600 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📋 Kanban
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                viewMode === "table"
                  ? "bg-white text-orange-600 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📊 Tableau
            </button>
          </div>
        </div>

        {/* Compteur résultats */}
        <div className="mt-4 text-sm text-gray-600">
          <span className="font-semibold text-orange-600">
            {filteredDemandes.length}
          </span>{" "}
          résultat(s) trouvé(s)
        </div>
      </div>

      {/* Vue Kanban */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Object.entries(groupedByStatus).map(([status, demandes]) => {
            const statusInfo = formatStatus(status);
            return (
              <div key={status} className="flex flex-col">
                <div className="bg-white rounded-t-2xl p-4 border-b-4 border-orange-300 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-gray-900 flex items-center gap-2">
                      <span className="text-2xl">{statusInfo.emoji}</span>
                      <span className="text-sm">{statusInfo.label}</span>
                    </h3>
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                      {demandes.length}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-b-2xl p-3 space-y-3 min-h-[200px] flex-1">
                  {demandes.map((demande) => (
                    <DemandeCard
                      key={demande.id}
                      demande={demande}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                  {demandes.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-8">
                      Aucune demande
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vue Tableau */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-orange-100 to-sky-100">
                <tr className="border-b-2 border-orange-300">
                  <th className="p-4 text-left font-bold text-gray-800">ID</th>
                  <th className="p-4 text-left font-bold text-gray-800">
                    Client
                  </th>
                  <th className="p-4 text-left font-bold text-gray-800">
                    Projet
                  </th>
                  <th className="p-4 text-center font-bold text-gray-800">
                    Statut
                  </th>
                  <th className="p-4 text-right font-bold text-gray-800">
                    Prix IA
                  </th>
                  <th className="p-4 text-right font-bold text-gray-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDemandes.length > 0 ? (
                  filteredDemandes.map((d) => {
                    const statusInfo = formatStatus(d.status);
                    const clientName =
                      d.user?.raw_user_meta_data?.full_name ||
                      d.user?.email ||
                      "Client";
                    const clientEmail = d.user?.email || "";
                    const clientPhone =
                      d.user?.raw_user_meta_data?.phone || "";

                    return (
                      <tr
                        key={d.id}
                        className="border-b border-gray-100 hover:bg-orange-50 transition-all duration-200"
                      >
                        <td className="p-4">
                          <span className="font-mono text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-lg font-semibold">
                            #{d.id?.slice(-6) || "N/A"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-gray-900">
                              {clientName}
                            </p>
                            <p className="text-xs text-gray-600">
                              {clientEmail}
                            </p>
                            {clientPhone && (
                              <p className="text-xs text-gray-500">
                                📞 {clientPhone}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-gray-900">
                            {d.title || "Projet"}
                          </div>
                          <div className="text-gray-500 text-xs max-w-xs truncate mt-1">
                            {(d.description || "Aucune description")
                              .toString()
                              .substring(0, 60)}
                            ...
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(
                              d.status
                            )}`}
                          >
                            {statusInfo.emoji} {statusInfo.label}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-green-600 text-right text-base">
                          {d.ai_analyses?.[0]?.estimated_price ? (
                            `${d.ai_analyses[0].estimated_price.toLocaleString()} FCFA`
                          ) : (
                            <span className="text-gray-400 text-sm font-normal">
                              À analyser
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/detail/${d.id}`}
                              prefetch={true}
                              className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 text-xs"
                            >
                              Détail
                            </Link>
                            <Link
                              href={`/admin/gerer/${d.id}`}
                              prefetch={true}
                              className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 text-xs"
                            >
                              Gérer
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-16">
                      <div className="flex flex-col items-center gap-4 text-center">
                        <div className="w-24 h-24 bg-orange-100 rounded-3xl flex items-center justify-center text-5xl shadow-lg">
                          📭
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            Aucune demande
                          </h3>
                          <p className="text-gray-500">
                            Les demandes clients apparaîtront ici
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Composant StatCard
function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl shadow-md`}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black text-gray-900 mb-1">{value}</p>
      <p className="text-sm font-semibold text-gray-600">
        {title}
        {subtitle && <span className="text-xs ml-1">({subtitle})</span>}
      </p>
    </div>
  );
}

// ✅ Composant DemandeCard (Kanban) - VERSION 1 CORRIGÉE
function DemandeCard({
  demande,
  getStatusColor,
}: {
  demande: Demande;
  getStatusColor: (status: string) => string;
}) {
  const clientName =
    demande.user?.raw_user_meta_data?.full_name ||
    demande.user?.email ||
    "Client";
  const clientEmail = demande.user?.email || "";
  const price = demande.ai_analyses?.[0]?.estimated_price;

  return (
    <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all hover:scale-[1.02] border-2 border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <span className="font-mono text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold">
          #{demande.id.slice(-6)}
        </span>
        {price && (
          <span className="text-xs font-bold text-green-600">
            {(price / 1000).toFixed(0)}K
          </span>
        )}
      </div>

      <h4 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">
        {demande.title}
      </h4>

      <div className="text-xs text-gray-600 mb-3">
        <p className="font-semibold">{clientName}</p>
        <p className="text-[10px] truncate">{clientEmail}</p>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/admin/detail/${demande.id}`}
          prefetch={true}
          className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold text-center hover:bg-blue-600 transition-colors"
        >
          Voir
        </Link>
        <Link
          href={`/admin/gerer/${demande.id}`}
          prefetch={true}
          className="flex-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-bold text-center hover:bg-orange-600 transition-colors"
        >
          Gérer
        </Link>
      </div>
    </div>
  );
}
