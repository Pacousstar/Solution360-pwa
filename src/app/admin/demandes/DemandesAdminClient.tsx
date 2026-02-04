"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle, Input, Select, Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";
import { Search, LayoutGrid, Table2, Download, BarChart3 } from "lucide-react";

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

  // Fonction getStatusColor supprimée - maintenant gérée par le composant Badge

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
      <Card variant="elevated" className="mb-8">
        <CardBody className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Rechercher par titre, client, email, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-5 w-5" />}
              />
            </div>

            {/* Filtre statut */}
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: '📋 Tous les statuts' },
                { value: 'draft', label: '🖊️ Brouillon' },
                { value: 'analysis', label: '🤖 Analyse IA' },
                { value: 'awaiting_payment', label: '💳 Attente Paiement' },
                { value: 'in_production', label: '⚙️ En Production' },
                { value: 'delivered', label: '✅ Livré' },
                { value: 'cancelled', label: '❌ Annulé' },
              ]}
              className="min-w-[200px]"
            />

            {/* Actions */}
            <div className="flex gap-2 items-center">
              <Link href="/admin/analytics">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<BarChart3 className="w-4 h-4" />}
                >
                  Analytics
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch("/api/admin/export-csv");
                    if (response.ok) {
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `demandes-${new Date().toISOString().split("T")[0]}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    }
                  } catch (error) {
                    console.error("Erreur lors de l'export:", error);
                  }
                }}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Export CSV
              </Button>
            </div>

            {/* Toggle vue */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              <Button
                onClick={() => setViewMode("kanban")}
                variant={viewMode === "kanban" ? "primary" : "ghost"}
                size="sm"
                leftIcon={<LayoutGrid className="w-4 h-4" />}
              >
                Kanban
              </Button>
              <Button
                onClick={() => setViewMode("table")}
                variant={viewMode === "table" ? "primary" : "ghost"}
                size="sm"
                leftIcon={<Table2 className="w-4 h-4" />}
              >
                Tableau
              </Button>
            </div>
          </div>

          {/* Compteur résultats */}
          <div className="mt-4 text-sm text-gray-600">
            <span className="font-semibold text-orange-600">
              {filteredDemandes.length}
            </span>{" "}
            résultat(s) trouvé(s)
          </div>
        </CardBody>
      </Card>

      {/* Vue Kanban */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Object.entries(groupedByStatus).map(([status, demandes]) => {
            const statusInfo = formatStatus(status);
            return (
              <div key={status} className="flex flex-col">
                <Card variant="bordered" className="rounded-t-2xl rounded-b-none border-b-4 border-orange-300">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <span className="text-2xl">{statusInfo.emoji}</span>
                        <span>{statusInfo.label}</span>
                      </CardTitle>
                      <Badge variant="default" size="sm">
                        {demandes.length}
                      </Badge>
                    </div>
                  </CardBody>
                </Card>
                <div className="bg-gray-50 rounded-b-2xl p-3 space-y-3 min-h-[200px] flex-1">
                  {demandes.map((demande) => (
                    <DemandeCard
                      key={demande.id}
                      demande={demande}
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
        <Card variant="elevated" className="overflow-hidden">
          <Table striped hover>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Projet</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-right">Prix IA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
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
                    <TableRow key={d.id}>
                      <TableCell>
                        <Badge variant="default" size="sm" className="font-mono">
                          #{d.id?.slice(-6) || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-gray-900">
                          {d.title || "Projet"}
                        </div>
                        <div className="text-gray-500 text-xs max-w-xs truncate mt-1">
                          {(d.description || "Aucune description")
                            .toString()
                            .substring(0, 60)}
                          ...
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge status={d.status as any} size="sm">
                          {statusInfo.emoji} {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-green-600 text-right text-base">
                        {d.ai_analyses?.[0]?.estimated_price ? (
                          `${d.ai_analyses[0].estimated_price.toLocaleString()} FCFA`
                        ) : (
                          <span className="text-gray-400 text-sm font-normal">
                            À analyser
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/detail/${d.id}`} prefetch={true}>
                            <Button variant="secondary" size="sm">
                              Détail
                            </Button>
                          </Link>
                          <Link href={`/admin/gerer/${d.id}`} prefetch={true}>
                            <Button variant="primary" size="sm">
                              Gérer
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="p-16">
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
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
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
    <Card variant="elevated" className="border-2 border-gray-100">
      <CardBody className="p-6">
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
      </CardBody>
    </Card>
  );
}

// ✅ Composant DemandeCard (Kanban)
function DemandeCard({
  demande,
}: {
  demande: Demande;
}) {
  const clientName =
    demande.user?.raw_user_meta_data?.full_name ||
    demande.user?.email ||
    "Client";
  const clientEmail = demande.user?.email || "";
  const price = demande.ai_analyses?.[0]?.estimated_price;

  return (
    <Card variant="bordered" className="hover:shadow-xl transition-all hover:scale-[1.02]">
      <CardBody className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Badge variant="gray" size="sm" className="font-mono text-[10px]">
            #{demande.id.slice(-6)}
          </Badge>
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
          <Link href={`/admin/detail/${demande.id}`} prefetch={true} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              Voir
            </Button>
          </Link>
          <Link href={`/admin/gerer/${demande.id}`} prefetch={true} className="flex-1">
            <Button variant="primary" size="sm" className="w-full">
              Gérer
            </Button>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
