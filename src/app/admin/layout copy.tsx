import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/admin/permissions";

async function logout() {
  "use server";
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

  await supabase.auth.signOut();
  redirect("/login");
}

// Dans /src/app/admin/layout.tsx
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // ✅ CORRECTION: getAll doit être async
        async getAll() {
          return cookieStore.getAll();
        },
        // ✅ CORRECTION: setAll doit être async avec gestion différée
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignoré car setAll peut être appelé depuis Server Component
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Récupérer le rôle et permissions
  const roleData = await getUserRole(user.id);
  const isAdmin =
    roleData?.role === "admin" || roleData?.role === "super_admin";
  const isSuperAdmin = roleData?.role === "super_admin";

  // Fallback sur emails (legacy)
  const adminEmails = ["pacous2000@gmail.com", "admin@solution360.app"];
  if (!isAdmin && !adminEmails.includes(user.email || "")) {
    redirect("/demandes");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-sky-50">
      {/* Header Admin */}
      <header className="sticky top-0 z-50 border-b border-orange-200 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo + Titre */}
            <div className="flex items-center gap-4">
              <Link href="/admin/demandes">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-sky-500 shadow-lg cursor-pointer hover:scale-105 transition-transform">
                  <span className="text-lg font-black text-white">S360</span>
                </div>
              </Link>
              <div>
                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                  Administration
                </p>
                <h1 className="text-xl font-black text-gray-900">
                  Solution360° Dashboard
                </h1>
              </div>
            </div>

            {/* User + Déconnexion */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-xs text-gray-500">
                  {isSuperAdmin ? "🔐 Super Admin" : "👤 Admin"}
                </p>
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Admin */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            <Link
              href="/admin/demandes"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-t-xl border-b-4 border-transparent px-4 py-3 text-sm font-semibold text-gray-700 hover:border-orange-400 hover:text-orange-600 transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Demandes
            </Link>

            {isSuperAdmin && (
              <Link
                href="/admin/finance"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-t-xl border-b-4 border-transparent px-4 py-3 text-sm font-semibold text-gray-700 hover:border-green-400 hover:text-green-600 transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Finance
              </Link>
            )}

            <Link
              href="/demandes"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-t-xl border-b-4 border-transparent px-4 py-3 text-sm font-semibold text-gray-700 hover:border-sky-400 hover:text-sky-600 transition-all"
            >
              <svg
                className="w-4 h-4"
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
              Retour utilisateur
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
