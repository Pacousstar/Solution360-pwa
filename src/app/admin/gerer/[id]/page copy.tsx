import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { uploadDeliverable, listDeliverables } from "@/lib/supabase/storage";

async function updateRequest(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const admin_notes = formData.get("admin_notes") as string | null;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  await supabase
    .from("requests")
    .update({
      status,
      admin_notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  redirect(`/admin/detail/${id}`);
}

async function handleUploadDeliverable(formData: FormData) {
  "use server";

  const requestId = formData.get("request_id") as string;
  const userId = formData.get("user_id") as string;
  const file = formData.get("deliverable") as File;

  if (!file || file.size === 0) {
    throw new Error("Aucun fichier sélectionné");
  }

  try {
    await uploadDeliverable(requestId, userId, file);
    redirect(`/admin/gerer/${requestId}?upload=success`);
  } catch (error: any) {
    console.error("Upload failed:", error);
    redirect(`/admin/gerer/${requestId}?upload=error&message=${encodeURIComponent(error.message)}`);
  }
}

export default async function AdminGererPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ upload?: string; message?: string }>;
}) {
  const { id } = await params;
  const { upload, message } = await searchParams;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminEmails = ["pacous2000@gmail.com", "admin@solution360.app"];
  if (!adminEmails.includes(user.email || "")) redirect("/demandes");

  const { data: demande } = await supabase
    .from("requests")
    .select("*, ai_analyses (*)")
    .eq("id", id)
    .single();

  if (!demande) notFound();

  // Récupérer la liste des livrables existants
  const deliverables = await listDeliverables(id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/admin/demandes"
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold mb-6 hover:gap-3 transition-all"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Retour aux demandes
        </Link>

        {/* Notifications upload */}
        {upload === "success" && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-xl">
            <p className="text-green-700 font-semibold">
              ✅ Livrable uploadé avec succès !
            </p>
          </div>
        )}
        {upload === "error" && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-xl">
            <p className="text-red-700 font-semibold">
              ❌ Erreur : {message || "Upload échoué"}
            </p>
          </div>
        )}

        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gérer la demande
            </h1>
            <p className="text-gray-500">
              ID:{" "}
              <span className="font-mono bg-orange-100 text-orange-700 px-2 py-1 rounded">
                #{demande.id.slice(-6)}
              </span>
            </p>
            <p className="mt-2 text-sm text-gray-600">{demande.title}</p>
          </div>

          {/* Rappel rapide de la demande */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <h2 className="text-sm font-bold text-gray-700 uppercase">
              Résumé
            </h2>
            <p className="text-sm text-gray-700">
              {demande.description || "Aucune description fournie"}
            </p>
            <p className="text-xs text-gray-500">
              Créée le{" "}
              {new Date(demande.created_at).toLocaleString("fr-FR", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            <p className="text-xs text-gray-500">
              Phase IA : {demande.ai_phase || "none"}
            </p>
            {demande.ai_analyses?.[0]?.estimated_price && (
              <p className="text-sm text-green-700 font-semibold">
                Prix IA :{" "}
                {demande.ai_analyses[0].estimated_price.toLocaleString()} FCFA
              </p>
            )}
          </div>

          {/* Liste des livrables existants */}
          {deliverables.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <h3 className="text-sm font-bold text-blue-700 uppercase mb-3">
                📦 Livrables uploadés ({deliverables.length})
              </h3>
              <div className="space-y-2">
                {deliverables.map((del: any) => (
                  <div
                    key={del.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {del.file_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(del.file_size / 1024 / 1024).toFixed(2)} MB •{" "}
                        {new Date(del.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <a
                      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/deliverables/${del.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg font-semibold transition-all"
                    >
                      Télécharger
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulaire de gestion */}
          <form action={updateRequest} className="space-y-6">
            <input type="hidden" name="id" value={demande.id} />

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Modifier le statut
              </label>
              <select
                name="status"
                defaultValue={demande.status}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-gray-800 font-medium"
              >
                <option value="draft">📝 Brouillon</option>
                <option value="analysis">🔍 Analyse</option>
                <option value="awaiting_payment">
                  💳 En attente de paiement
                </option>
                <option value="in_production">⚙️ En production</option>
                <option value="delivered">✅ Livré</option>
                <option value="cancelled">❌ Annulé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Notes internes admin
              </label>
              <textarea
                name="admin_notes"
                defaultValue={demande.admin_notes || ""}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-gray-800 text-sm"
                placeholder="Notes privées pour le suivi interne, contexte client, décisions..."
              />
            </div>

            <div className="flex gap-4">
              <Link
                href={`/admin/detail/${demande.id}`}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-xl font-bold text-center transition-all"
              >
                Annuler
              </Link>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-green-500 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Mettre à jour
              </button>
            </div>
          </form>

          {/* Section upload livrable */}
          <form
            action={handleUploadDeliverable}
            className="p-6 bg-purple-50 rounded-2xl border-2 border-purple-200 space-y-4"
          >
            <h3 className="text-sm font-bold text-purple-700 uppercase">
              📤 Uploader un nouveau livrable
            </h3>
            <input type="hidden" name="request_id" value={demande.id} />
            <input type="hidden" name="user_id" value={demande.user_id} />

            <input
              type="file"
              name="deliverable"
              accept=".pdf,.zip,.png,.jpg,.jpeg,.mp4"
              required
              className="w-full text-sm text-gray-700 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 file:cursor-pointer"
            />
            <p className="text-xs text-gray-600">
              Formats acceptés : PDF, ZIP, PNG, JPG, MP4 • Max 50MB
            </p>

            <button
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Téléverser maintenant
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
