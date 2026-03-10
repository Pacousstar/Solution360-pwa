import { createClient } from "@/lib/supabase/server";
import Navbar from "./Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ Logique Admin
  let isAdmin = false;
  if (user) {
    const { isAdmin: checkAdmin } = await import('@/lib/admin/permissions');
    isAdmin = await checkAdmin(user.id, user.email || undefined);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-sky-50">
      {/* Navbar Responsive */}
      <Navbar userEmail={user?.email} isAdmin={isAdmin} />

      {/* Main content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* Footer minimaliste */}
      <footer className="border-t border-gray-100 bg-white/40 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Solution360° — Partenaire de votre croissance
          </p>
          <p className="text-[9px] text-gray-300 mt-1">
            © 2026 GSN EXPERTISES GROUP — Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  );
}
