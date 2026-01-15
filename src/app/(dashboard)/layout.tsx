import Link from "next/link";
import { logout } from "../(auth)/actions";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/Logo";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ❌ PAS DE REDIRECT ICI (géré par le middleware)
  // Le middleware a déjà vérifié l'authentification

  // ✅ Utilisation de la logique centralisée
  let isAdmin = false;
  if (user) {
    const { isAdmin: checkAdmin } = await import('@/lib/admin/permissions');
    isAdmin = await checkAdmin(user.id, user.email || undefined);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-sky-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <Logo size="sm" href="/" />

          {user && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600">{user.email}</span>
              {isAdmin && (
                <Link
                  href="/admin/demandes"
                  className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100 transition"
                >
                  Admin
                </Link>
              )}
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 hover:bg-gray-50 transition"
                >
                  Déconnexion
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-1 text-sm">
            <Link
              href="/demandes"
              className="rounded-t-lg border-b-2 border-transparent px-4 py-2 text-gray-700 hover:border-orange-400 hover:text-orange-600 transition"
            >
              Mes demandes
            </Link>
            <Link
              href="/nouvelle-demande"
              className="rounded-t-lg border-b-2 border-transparent px-4 py-2 text-gray-700 hover:border-orange-400 hover:text-orange-600 transition"
            >
              Nouvelle demande
            </Link>
            <Link
              href="/profil"
              className="rounded-t-lg border-b-2 border-transparent px-4 py-2 text-gray-700 hover:border-orange-400 hover:text-orange-600 transition"
            >
              Profil
            </Link>
            <Link
              href="/stats"
              className="rounded-t-lg border-b-2 border-transparent px-4 py-2 text-gray-700 hover:border-orange-400 hover:text-orange-600 transition"
            >
              Stats
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white/60 backdrop-blur-sm py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <Logo size="sm" href="/" />
            <p className="text-xs text-gray-500">
              © 2026 GSN EXPERTISES GROUP - Solution360° - Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
