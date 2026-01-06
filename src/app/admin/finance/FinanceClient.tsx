"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Transaction {
  id: string;
  title: string;
  amount: number;
  status: string;
  date: string;
  clientName: string;
  clientEmail: string;
}

interface MonthlyData {
  month: string;
  amount: number;
}

interface Props {
  transactions: Transaction[];
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  monthlyData: MonthlyData[];
  userEmail: string;
}

export default function FinanceClient({
  transactions,
  totalRevenue,
  paidRevenue,
  pendingRevenue,
  monthlyData,
  userEmail,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");

  // ✅ Filtrage et tri
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter((t) => {
      const matchSearch =
        searchTerm === "" ||
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === "all" || t.status === statusFilter;

      return matchSearch && matchStatus;
    });

    // Tri
    filtered.sort((a, b) => {
      if (sortBy === "amount") {
        return b.amount - a.amount;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return filtered;
  }, [transactions, searchTerm, statusFilter, sortBy]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Titre",
      "Client",
      "Email",
      "Montant (FCFA)",
      "Statut",
      "Date",
    ];
    const rows = filteredTransactions.map((t) => [
      t.id.slice(-6),
      t.title,
      t.clientName,
      t.clientEmail,
      t.amount,
      t.status,
      new Date(t.date).toLocaleDateString("fr-FR"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `solution360-finance-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; color: string; emoji: string }
    > = {
      delivered: {
        label: "Livré",
        color: "bg-green-100 text-green-700 border-green-300",
        emoji: "✅",
      },
      in_production: {
        label: "Production",
        color: "bg-blue-100 text-blue-700 border-blue-300",
        emoji: "⚙️",
      },
      awaiting_payment: {
        label: "Attente Paiement",
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
        emoji: "💳",
      },
      analysis: {
        label: "Analyse",
        color: "bg-orange-100 text-orange-700 border-orange-300",
        emoji: "🤖",
      },
      draft: {
        label: "Brouillon",
        color: "bg-gray-100 text-gray-700 border-gray-300",
        emoji: "🖊️",
      },
      cancelled: {
        label: "Annulé",
        color: "bg-red-100 text-red-700 border-red-300",
        emoji: "❌",
      },
    };
    return (
      statusMap[status] || {
        label: status,
        color: "bg-gray-100 text-gray-700",
        emoji: "❓",
      }
    );
  };

  return (
    <div>
      {/* Header avec badge super-admin */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-8 shadow-2xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center text-4xl shadow-xl">
              💰
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">
                Finance Dashboard
              </h1>
              <p className="text-emerald-100 text-sm mt-1">
                🔐 Accès Super-Admin • {userEmail}
              </p>
            </div>
          </div>
          <p className="text-white/90 text-lg">
            Gestion financière complète de Solution360°
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPICard
          title="Chiffre d'Affaires Total"
          value={formatCurrency(totalRevenue)}
          subtitle="FCFA"
          icon="💵"
          color="from-emerald-500 to-green-600"
          trend="+12%"
        />
        <KPICard
          title="Revenus Encaissés"
          value={formatCurrency(paidRevenue)}
          subtitle="FCFA"
          icon="✅"
          color="from-blue-500 to-blue-600"
          trend="+8%"
        />
        <KPICard
          title="En Attente"
          value={formatCurrency(pendingRevenue)}
          subtitle="FCFA"
          icon="⏳"
          color="from-yellow-500 to-orange-600"
          trend="5 demandes"
        />
      </div>

      {/* Graphique mensuel simple */}
      <div className="bg-white rounded-3xl p-8 shadow-xl mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-900">
            📊 Évolution Mensuelle
          </h2>
          <span className="text-sm text-gray-500">
            {monthlyData.length} mois
          </span>
        </div>
        <div className="space-y-4">
          {monthlyData.slice(-6).map((data, index) => {
            const maxAmount = Math.max(...monthlyData.map((d) => d.amount));
            const percentage = (data.amount / maxAmount) * 100;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-700">
                    {data.month}
                  </span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(data.amount)} FCFA
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtres et recherche */}
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
              placeholder="Rechercher une transaction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 transition-all"
            />
          </div>

          {/* Filtre statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none bg-white font-semibold"
          >
            <option value="all">Tous les statuts</option>
            <option value="delivered">✅ Livré</option>
            <option value="in_production">⚙️ Production</option>
            <option value="awaiting_payment">💳 Attente Paiement</option>
          </select>

          {/* Tri */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "amount")}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none bg-white font-semibold"
          >
            <option value="date">📅 Trier par date</option>
            <option value="amount">💰 Trier par montant</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={exportToCSV}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 whitespace-nowrap"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export CSV
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <span className="font-semibold text-emerald-600">
            {filteredTransactions.length}
          </span>{" "}
          transaction(s)
        </div>
      </div>

      {/* Tableau des transactions */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-emerald-100 to-green-100">
              <tr className="border-b-2 border-emerald-300">
                <th className="p-4 text-left font-bold text-gray-800">ID</th>
                <th className="p-4 text-left font-bold text-gray-800">
                  Projet
                </th>
                <th className="p-4 text-left font-bold text-gray-800">
                  Client
                </th>
                <th className="p-4 text-right font-bold text-gray-800">
                  Montant
                </th>
                <th className="p-4 text-center font-bold text-gray-800">
                  Statut
                </th>
                <th className="p-4 text-center font-bold text-gray-800">
                  Date
                </th>
                <th className="p-4 text-right font-bold text-gray-800">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => {
                  const statusInfo = getStatusInfo(t.status);
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-gray-100 hover:bg-emerald-50 transition-all"
                    >
                      <td className="p-4">
                        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-lg font-bold">
                          #{t.id.slice(-6)}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-gray-900">
                        {t.title}
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {t.clientName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {t.clientEmail}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-black text-lg text-emerald-600">
                          {formatCurrency(t.amount)}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          FCFA
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${statusInfo.color}`}
                        >
                          {statusInfo.emoji} {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-4 text-center text-gray-600">
                        {new Date(t.date).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/detail/${t.id}`}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all text-xs"
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-16 text-center">
                    <div className="text-gray-400">
                      <p className="text-2xl mb-2">📭</p>
                      <p>Aucune transaction trouvée</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ✅ Composant KPICard
function KPICard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  color: string;
  trend?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-gray-100 hover:shadow-2xl transition-all">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-3xl shadow-lg`}
        >
          {icon}
        </div>
        {trend && (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-black text-gray-900 mb-1">
        {value}
        {subtitle && (
          <span className="text-sm font-semibold text-gray-500 ml-2">
            {subtitle}
          </span>
        )}
      </p>
      <p className="text-sm font-semibold text-gray-600">{title}</p>
    </div>
  );
}
