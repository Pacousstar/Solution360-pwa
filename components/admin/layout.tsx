import Link from "next/link";
import { logout } from "../(auth)/actions";
import { createSupabaseServerClient } from "../lib/supabase-server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Vérifier admin
  const { data: adminCheck } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  if (!adminCheck) {
    redirect("/demandes");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-purple-50">
      {/* Header Admin */}
      <header className="sticky top-0 z-10 border-b border-red-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-purple-500">
              <span className="text-sm font-bold text-white">ADM</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              Solution360° — Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">{user.email}</span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 transition"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Navigation Admin */}
      <nav className="border-b border-gray-200 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-1 text-sm">
            <Link
              href="/admin/demandes"
              className="rounded-t-lg border-b-2 border-transparent px-4 py-2 text-gray-700 hover:border-red-400 hover:text-red-600 transition"
            >
              Toutes les demandes
            </Link>
            <Link
              href="/demandes"
              className="rounded-t-lg border-b-2 border-transparent px-4 py-2 text-gray-700 hover:border-orange-400 hover:text-orange-600 transition"
            >
              ← Retour utilisateur
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
