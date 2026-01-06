"use client";

import Link from "next/link";
import { useMemo } from "react";

type Request = {
  id: string;
  title: string;
  status: string;
  budget_proposed: number | null;
  created_at: string;
};

export default function StatsContent({ demandes }: { demandes: Request[] }) {
  // Calcul des statistiques
  const stats = useMemo(() => {
    const total = demandes.length;
    const enCours = demandes.filter(
      (d) =>
        d.status === "draft" ||
        d.status === "analysis" ||
        d.status === "awaiting_payment" ||
        d.status === "in_production"
    ).length;
    const livrees = demandes.filter((d) => d.status === "delivered").length;
    const annulees = demandes.filter((d) => d.status === "cancelled").length;

    const budgetTotal = demandes.reduce(
      (sum, d) => sum + (d.budget_proposed || 0),
      0
    );
    const budgetMoyen = total > 0 ? budgetTotal / total : 0;

    // Stats par statut
    const parStatut = {
      draft: demandes.filter((d) => d.status === "draft").length,
      analysis: demandes.filter((d) => d.status === "analysis").length,
      awaiting_payment: demandes.filter((d) => d.status === "awaiting_payment")
        .length,
      in_production: demandes.filter((d) => d.status === "in_production").length,
      delivered: livrees,
      cancelled: annulees,
    };

    // Évolution mensuelle (6 derniers mois)
    const derniersMois = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        mois: date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" }),
        count: demandes.filter((d) => {
          const demandeDate = new Date(d.created_at);
          return (
            demandeDate.getMonth() === date.getMonth() &&
            demandeDate.getFullYear() === date.getFullYear()
          );
        }).length,
      };
    }).reverse();

    return {
      total,
      enCours,
      livrees,
      annulees,
      budgetTotal,
      budgetMoyen,
      parStatut,
      derniersMois,
      tauxReussite: total > 0 ? ((livrees / total) * 100).toFixed(1) : "0",
    };
  }, [demandes]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 0,
    }).format(amount) + " F CFA";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/demandes">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg cursor-pointer hover:scale-105 transition-transform">
                  <span className="text-lg font-black text-white">📊</span>
                </div>
              </Link>
              <div>
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                  Statistiques
                </p>
                <h1 className="text-xl font-black text-gray-900">
                  Tableau de bord analytique
                </h1>
              </div>
            </div>
            <Link
              href="/demandes"
              className="text-sm text-gray-600 hover:text-purple-600 transition-colors font-semibold"
            >
              ← Retour
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Vue d'ensemble */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-6">📈 Vue d'ensemble</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">📦</span>
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
                  TOTAL
                </span>
              </div>
              <p className="text-5xl font-black mb-2">{stats.total}</p>
              <p className="text-sm text-blue-100">demande(s) créée(s)</p>
            </div>

            {/* En cours */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">⚙️</span>
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
                  EN COURS
                </span>
              </div>
              <p className="text-5xl font-black mb-2">{stats.enCours}</p>
              <p className="text-sm text-orange-100">projet(s) actif(s)</p>
            </div>

            {/* Livrées */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">✅</span>
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
                  LIVRÉES
                </span>
              </div>
              <p className="text-5xl font-black mb-2">{stats.livrees}</p>
              <p className="text-sm text-green-100">projet(s) terminé(s)</p>
            </div>

            {/* Taux de réussite */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">🎯</span>
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
                  RÉUSSITE
                </span>
              </div>
              <p className="text-5xl font-black mb-2">{stats.tauxReussite}%</p>
              <p className="text-sm text-purple-100">taux de livraison</p>
            </div>
          </div>
        </section>

        {/* Budget */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-6">💰 Budget</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-lg">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                Budget total investi
              </p>
              <p className="text-4xl font-black text-gray-900 mb-2">
                {formatCurrency(stats.budgetTotal)}
              </p>
              <p className="text-sm text-gray-600">
                Sur {stats.total} demande(s)
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-lg">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                Budget moyen par projet
              </p>
              <p className="text-4xl font-black text-gray-900 mb-2">
                {formatCurrency(stats.budgetMoyen)}
              </p>
              <p className="text-sm text-gray-600">
                Moyenne calculée
              </p>
            </div>
          </div>
        </section>

        {/* Répartition par statut */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            📊 Répartition par statut
          </h2>
          <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-lg">
            <div className="space-y-4">
              {Object.entries(stats.parStatut).map(([statut, count]) => {
                const percentage =
                  stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : "0";
                const labels: Record<string, { label: string; color: string }> = {
                  draft: { label: "Brouillon", color: "bg-gray-400" },
                  analysis: { label: "Analyse en cours", color: "bg-blue-500" },
                  awaiting_payment: {
                    label: "En attente de paiement",
                    color: "bg-orange-500",
                  },
                  in_production: { label: "En production", color: "bg-purple-500" },
                  delivered: { label: "Livré", color: "bg-green-500" },
                  cancelled: { label: "Annulé", color: "bg-red-500" },
                };

                return (
                  <div key={statut}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-700">
                        {labels[statut]?.label || statut}
                      </span>
                      <span className="text-sm font-black text-gray-900">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full ${labels[statut]?.color || "bg-gray-400"} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Évolution */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            📈 Évolution (6 derniers mois)
          </h2>
          <div className="bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-lg">
            <div className="flex items-end justify-between gap-4 h-64">
              {stats.derniersMois.map((mois, index) => {
                const maxCount = Math.max(...stats.derniersMois.map((m) => m.count), 1);
                const height = (mois.count / maxCount) * 100;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="flex-1 flex items-end w-full">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-xl hover:from-blue-600 hover:to-purple-600 transition-all relative group"
                        style={{ height: `${height}%` }}
                      >
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-black text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                          {mois.count}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-gray-600 mt-3 text-center">
                      {mois.mois}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
