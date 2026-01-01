import { createSupabaseServerClient } from "../../lib/supabase-server";
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

function StatutBadge({ statut }: { statut: string | null }) {
  const s = statut || "analysis";
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-700 border border-orange-200">
      {formatStatus(s)}
    </span>
  );
}

function formatAiPhase(p: string | null) {
  if (!p || p === "none") return null;
  return p === "deepseek" ? "DeepSeek" : p === "gpt4o" ? "GPT‑4o" : p;
}

function formatBudget(b: number | null) {
  if (!b || Number.isNaN(b)) return "-- F CFA";
  return (
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(b) +
    " F CFA"
  );
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(new Date(d));
}

function UrgenceIcon({ urgence }: { urgence: string | null }) {
  if (!urgence) {
    return (
      <span className="font-semibold text-gray-500 flex items-center gap-1 text-sm">
        <span className="text-sm">⊝</span> Aucune
      </span>
    );
  }
  if (urgence === "Urgent") {
    return (
      <span className="font-semibold text-red-600 flex items-center gap-1 text-sm">
        <span className="text-sm">!</span> Urgent
      </span>
    );
  }
  if (urgence === "Normal") {
    return (
      <span className="font-semibold text-gray-600 flex items-center gap-1 text-sm">
        <span className="text-sm">🕒</span> Normal
      </span>
    );
  }
  return <span className="font-medium text-gray-600 text-sm">{urgence}</span>;
}

function ComplexiteColor({ complexite }: { complexite: string | null }) {
  if (!complexite) {
    return (
      <span className="font-medium text-gray-400 italic text-sm">--</span>
    );
  }
  const color =
    complexite === "Simple"
      ? "text-green-600"
      : complexite === "Complexe"
      ? "text-orange-600"
      : "text-gray-600";
  return <span className={`font-medium text-sm ${color}`}>{complexite}</span>;
}
export default async function MesDemandesPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("requests")
    .select(
      "id, user_id, title, description, budget_proposed, status, complexity, urgency, ai_phase, created_at, updated_at"
    )
    .order("created_at", { ascending: false });
  const demandes = (data || []) as RequestRow[];

  return (
    <div className="bg-slate-50 text-gray-900 h-screen flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="bg-white shadow-sm z-10 px-5 pt-12 pb-4 flex justify-between items-center shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-orange-500 font-bold tracking-wider text-xs uppercase">
              Solution360°
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Mes demandes
          </h1>
        </div>
        <div className="relative">
          <button className="bg-gray-100 p-2 rounded-full text-gray-600 hover:bg-gray-200 transition">
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
        </div>
      </header>

      {/* SEARCH BAR */}
      <div className="px-5 py-4 shrink-0 bg-slate-50">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span>{demandes.length} demande(s) au total</span>
          <span className="flex items-center gap-1 text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">
            ✨ Workflow IA
          </span>
        </div>
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
            className="w-full bg-white border-none ring-1 ring-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500 shadow-sm placeholder-gray-400"
            placeholder="Rechercher une demande..."
            type="text"
          />
        </div>
      </div>

      {/* MAIN - LISTE DES DEMANDES */}
      <main className="flex-1 overflow-y-auto px-5 pb-24 space-y-4 scrollbar-hide">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            ⚠ Impossible de charger les demandes depuis Supabase.
          </div>
        ) : demandes.length === 0 ? (
          <div className="rounded-xl bg-white px-6 py-10 text-center shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600">
              Aucune demande pour le moment.
            </p>
          </div>
        ) : (
          demandes.map((d) => (
            <Link
              key={d.id}
              href={`/demandes/${d.id}`}
              className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition hover:shadow-md hover:border-orange-300"
            >
              {/* Header carte : ID + Badge + Date */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">
                      #{d.id.slice(0, 8)}
                    </span>
                    <StatutBadge statut={d.status} />
                  </div>
                  <h3 className="font-bold text-lg leading-tight text-gray-900">
                    {d.title}
                  </h3>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400">
                    {formatDate(d.created_at)}
                  </span>
                </div>
              </div>

              {/* Grid 2x2 : Budget, Urgence, Phase IA, Complexité */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm mb-4 border-t border-b border-gray-50 py-3">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-gray-400 font-semibold mb-0.5">
                    Budget
                  </span>
                  <span className="font-semibold text-gray-800">
                    {formatBudget(d.budget_proposed)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-gray-400 font-semibold mb-0.5">
                    Urgence
                  </span>
                  <UrgenceIcon urgence={d.urgency} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-gray-400 font-semibold mb-0.5">
                    Phase IA
                  </span>
                  {formatAiPhase(d.ai_phase) ? (
                    <span className="font-medium text-blue-600 text-sm">
                      {formatAiPhase(d.ai_phase)}
                    </span>
                  ) : (
                    <span className="font-medium text-gray-400 italic text-sm">
                      --
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-gray-400 font-semibold mb-0.5">
                    Complexité
                  </span>
                  <ComplexiteColor complexite={d.complexity} />
                </div>
              </div>

              {/* Footer cliquable */}
              <div className="text-xs font-medium text-center pt-3 mt-4 border-t border-gray-200 text-orange-600">
                Cliquez pour voir les détails →
              </div>
            </Link>
          ))
        )}
      </main>
      {/* BOTTOM NAV */}
      <nav className="shrink-0 bg-white border-t border-gray-100 pb-5 pt-3 px-6 flex justify-between items-center z-10">
        <Link
          href="/"
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-orange-500 transition"
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
          <span className="text-[10px] font-medium">Accueil</span>
        </Link>

        <Link
          href="/demandes"
          className="flex flex-col items-center gap-1 text-orange-500"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 2a2 2 0 00-2 2v16a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H9zm0 2h6v16H9V4z" />
          </svg>
          <span className="text-[10px] font-medium">Demandes</span>
        </Link>

        <div className="relative -top-6">
          <Link
            href="/nouvelle-demande"
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 shadow-lg shadow-orange-200 flex items-center justify-center transform hover:scale-105 transition"
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

        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-orange-500 transition">
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
          <span className="text-[10px] font-medium">Stats</span>
        </button>

        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-orange-500 transition">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
            N
          </div>
          <span className="text-[10px] font-medium">Profil</span>
        </button>
      </nav>
    </div>
  );
}
