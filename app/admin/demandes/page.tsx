import { createSupabaseServerClient } from "../../lib/supabase-server";
import { mettreAJourDemandeAdmin, lancerAnalyseIA } from "./actions";

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
  user_email?: string | null;
};

function formatStatus(status: string | null) {
  if (!status) return "Inconnu";
  switch (status) {
    case "draft":
      return "Brouillon";
    case "analysis":
      return "Analyse Solution360°";
    case "awaiting_payment":
      return "En attente de paiement";
    case "in_production":
      return "En production";
    case "delivered":
      return "Livré";
    case "cancelled":
      return "Annulé";
    default:
      return status;
  }
}

function StatutBadge({ statut }: { statut: string | null }) {
  const s = statut || "analysis";
  let classes =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium";

  if (s === "delivered") {
    classes += " bg-emerald-50 text-emerald-700 border border-emerald-100";
  } else if (s === "analysis" || s === "in_production") {
    classes += " bg-orange-50 text-orange-700 border border-orange-100";
  } else if (s === "awaiting_payment") {
    classes += " bg-amber-50 text-amber-700 border border-amber-100";
  } else if (s === "cancelled") {
    classes += " bg-red-50 text-red-700 border-red-100";
  } else {
    classes += " bg-sky-50 text-sky-700 border-sky-100";
  }

  return <span className={classes}>{formatStatus(s)}</span>;
}

function Tag({ value, empty }: { value: string | null; empty?: string }) {
  if (!value) {
    return (
      <span className="inline-flex items-center rounded-full border border-dashed border-gray-200 px-2 py-0.5 text-[11px] text-gray-400">
        {empty ?? "Non défini"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700">
      {value}
    </span>
  );
}

function formatAiPhase(phase: string | null) {
  if (!phase || phase === "none") return "Aucune";
  if (phase === "deepseek") return "DeepSeek";
  if (phase === "gpt4o") return "GPT‑4o";
  return phase;
}

function formatBudget(budget: number | null) {
  if (!budget || Number.isNaN(budget)) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(budget);
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}
export default async function AdminDemandesPage() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("requests")
    .select(
      "id, user_id, title, description, budget_proposed, status, complexity, urgency, ai_phase, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  const demandes = (data || []) as RequestRow[];

  // Récupérer les emails des utilisateurs
  const { data: users } = await supabase.auth.admin.listUsers();

  const userEmailMap = new Map<string, string>();
  users?.users.forEach((u) => {
    userEmailMap.set(u.id, u.email || "");
  });

  demandes.forEach((d) => {
    if (d.user_id) {
      d.user_email = userEmailMap.get(d.user_id) || null;
    }
  });

  return (
    <>
      <section className="mb-6">
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">
          Admin — Toutes les demandes
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Vue globale de toutes les demandes utilisateurs. Vous pouvez lancer l'analyse IA et modifier le statut.
        </p>
      </section>

      <section>
        <div className="rounded-xl border border-gray-200 bg-white/85 shadow-sm overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {demandes.length} demande(s) au total
            </p>
            <span className="text-[11px] text-gray-400">Vue admin</span>
          </div>

          {error ? (
            <div className="px-4 py-3 text-[11px] text-red-700 bg-red-50 border-t border-red-100 whitespace-pre-wrap">
              Impossible de charger les demandes.
            </div>
          ) : demandes.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-500">
              Aucune demande pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50/80">
                  <tr className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Utilisateur</th>
                    <th className="px-4 py-2 text-left">Titre</th>
                    <th className="px-4 py-2 text-left">Statut</th>
                    <th className="px-4 py-2 text-left">Complexité</th>
                    <th className="px-4 py-2 text-left">Urgence</th>
                    <th className="px-4 py-2 text-left">Phase IA</th>
                    <th className="px-4 py-2 text-right">Budget</th>
                    <th className="px-4 py-2 text-right">Créée le</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {demandes.map((demande) => (
                    <tr
                      key={demande.id}
                      className="bg-white hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-2 text-[11px] font-mono text-gray-500">
                        {demande.id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-600">
                        {demande.user_email || "—"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {demande.title}
                      </td>
                      <td className="px-4 py-2">
                        <StatutBadge statut={demande.status} />
                      </td>
                      <td className="px-4 py-2">
                        <Tag value={demande.complexity} empty="Complexité ?" />
                      </td>
                      <td className="px-4 py-2">
                        <Tag value={demande.urgency} empty="Urgence ?" />
                      </td>
                      <td className="px-4 py-2">
                        <Tag
                          value={formatAiPhase(demande.ai_phase)}
                          empty="Aucune"
                        />
                      </td>
                      <td className="px-4 py-2 text-right text-sm text-gray-900">
                        {formatBudget(demande.budget_proposed)}
                      </td>
                      <td className="px-4 py-2 text-right text-xs text-gray-500">
                        {formatDate(demande.created_at)}
                      </td>
                      <td className="px-4 py-2 text-right text-[11px]">
                        <div className="flex flex-col gap-1">
                          {/* Bouton Analyser IA (conditionnel ADMIN) */}
                          {demande.status === "analysis" && demande.ai_phase === "none" && (
                            <form action={lancerAnalyseIA}>
                              <input type="hidden" name="request_id" value={demande.id} />
                              <button
                                type="submit"
                                className="w-full rounded-full border border-purple-200 bg-purple-50 px-2 py-1 text-[10px] text-purple-800 hover:bg-purple-100"
                              >
                                🤖 Analyser (DeepSeek)
                              </button>
                            </form>
                          )}

                          {/* Workflow admin */}
                          <div className="flex justify-end gap-1">
                            {/* → En attente paiement */}
                            <form action={mettreAJourDemandeAdmin}>
                              <input type="hidden" name="id" value={demande.id} />
                              <input
                                type="hidden"
                                name="status"
                                value="awaiting_payment"
                              />
                              <button
                                type="submit"
                                className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] text-amber-800 hover:bg-amber-100"
                              >
                                → Devis
                              </button>
                            </form>

                            {/* → Production GPT‑4o */}
                            <form action={mettreAJourDemandeAdmin}>
                              <input type="hidden" name="id" value={demande.id} />
                              <input
                                type="hidden"
                                name="status"
                                value="in_production"
                              />
                              <input
                                type="hidden"
                                name="ai_phase"
                                value="gpt4o"
                              />
                              <button
                                type="submit"
                                className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] text-sky-800 hover:bg-sky-100"
                              >
                                → Production
                              </button>
                            </form>

                            {/* → Livré */}
                            <form action={mettreAJourDemandeAdmin}>
                              <input type="hidden" name="id" value={demande.id} />
                              <input
                                type="hidden"
                                name="status"
                                value="delivered"
                              />
                              <button
                                type="submit"
                                className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] text-emerald-800 hover:bg-emerald-100"
                              >
                                ✓ Livré
                              </button>
                            </form>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
