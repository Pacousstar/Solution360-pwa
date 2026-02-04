"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, CardTitle, Button } from "@/components/ui";
import { BarChart3, TrendingUp, DollarSign, FileText, Users, CreditCard } from "lucide-react";
import Link from "next/link";

interface Stats {
  total: {
    requests: number;
    payments: number;
    revenue: number;
  };
  byStatus: {
    pending: number;
    analysis: number;
    awaiting_payment: number;
    in_production: number;
    delivered: number;
    cancelled: number;
  };
  paymentStatus: {
    pending: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
  monthlyData: Array<{
    month: string;
    requests: number;
    revenue: number;
  }>;
}

interface Props {
  stats: Stats | null;
}

export default function AnalyticsClient({ stats: initialStats }: Props) {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);

  const refreshStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/analytics");
      const data = await response.json();
      if (data.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-sky-50 p-8">
        <Card>
          <CardBody className="p-12 text-center">
            <p className="text-gray-600">Chargement des statistiques...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-sky-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              📊 Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Vue d'ensemble complète de votre activité
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={refreshStats}
              disabled={loading}
            >
              {loading ? "Actualisation..." : "🔄 Actualiser"}
            </Button>
            <Link href="/admin/demandes">
              <Button variant="ghost">← Retour</Button>
            </Link>
          </div>
        </div>

        {/* Stats principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="elevated" className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5" />
              </div>
              <CardTitle className="text-white text-sm mb-1">Total Demandes</CardTitle>
              <p className="text-3xl font-black">{stats.total.requests}</p>
            </CardBody>
          </Card>

          <Card variant="elevated" className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5" />
              </div>
              <CardTitle className="text-white text-sm mb-1">Revenus Totaux</CardTitle>
              <p className="text-3xl font-black">{formatCurrency(stats.total.revenue)} FCFA</p>
            </CardBody>
          </Card>

          <Card variant="elevated" className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5" />
              </div>
              <CardTitle className="text-white text-sm mb-1">Paiements</CardTitle>
              <p className="text-3xl font-black">{stats.total.payments}</p>
            </CardBody>
          </Card>

          <Card variant="elevated" className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 opacity-80" />
                <TrendingUp className="w-5 h-5" />
              </div>
              <CardTitle className="text-white text-sm mb-1">Taux de Conversion</CardTitle>
              <p className="text-3xl font-black">
                {stats.total.requests > 0
                  ? Math.round(
                      (stats.byStatus.delivered / stats.total.requests) * 100
                    )
                  : 0}
                %
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Stats par statut */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="text-lg">📊 Répartition par Statut</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">🖊️ Brouillon</span>
                <span className="font-bold">{stats.byStatus.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">🤖 Analyse</span>
                <span className="font-bold">{stats.byStatus.analysis}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">💳 Attente Paiement</span>
                <span className="font-bold">{stats.byStatus.awaiting_payment}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">⚙️ En Production</span>
                <span className="font-bold">{stats.byStatus.in_production}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">✅ Livré</span>
                <span className="font-bold text-green-600">{stats.byStatus.delivered}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">❌ Annulé</span>
                <span className="font-bold text-red-600">{stats.byStatus.cancelled}</span>
              </div>
            </CardBody>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="text-lg">💳 Statut des Paiements</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">⏳ En attente</span>
                <span className="font-bold">{stats.paymentStatus.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">✅ Confirmés</span>
                <span className="font-bold text-green-600">{stats.paymentStatus.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">❌ Échoués</span>
                <span className="font-bold text-red-600">{stats.paymentStatus.failed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">🚫 Annulés</span>
                <span className="font-bold">{stats.paymentStatus.cancelled}</span>
              </div>
            </CardBody>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="text-lg">📈 Évolution Mensuelle</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {stats.monthlyData.slice(-6).reverse().map((monthData) => (
                  <div key={monthData.month} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{monthData.month}</span>
                      <span className="text-gray-600">
                        {monthData.requests} demande{monthData.requests > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{
                          width: `${
                            stats.monthlyData.length > 0
                              ? (monthData.requests /
                                  Math.max(
                                    ...stats.monthlyData.map((m) => m.requests)
                                  )) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    {monthData.revenue > 0 && (
                      <p className="text-xs text-emerald-600 font-semibold">
                        {formatCurrency(monthData.revenue)} FCFA
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
