import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { getUserRole, isSuperAdmin } from "@/lib/admin/permissions";
import FinanceClient from "./FinanceClient";

export default async function FinancePage() {
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

  if (!user) {
    redirect("/login");
  }

  // ✅ Vérifier super-admin
  const roleData = await getUserRole(user.id);
  const isSuperAdminUser = roleData?.role === "super_admin";

  // Fallback email
  if (!isSuperAdminUser && user.email !== "pacous2000@gmail.com") {
    redirect("/admin/demandes");
  }

  // ✅ Récupérer toutes les demandes avec prix
  const { data: requests } = await supabase
    .from("requests")
    .select(`
      id,
      title,
      status,
      created_at,
      user_id,
      user:user_id (
        email,
        raw_user_meta_data
      ),
      ai_analyses (
        estimated_price
      )
    `)
    .order("created_at", { ascending: false });

  // ✅ Calculer les stats financières
  const transactions = (requests || [])
    .filter((r: any) => r.ai_analyses?.[0]?.estimated_price)
    .map((r: any) => ({
      id: r.id,
      title: r.title,
      amount: r.ai_analyses[0].estimated_price,
      status: r.status,
      date: r.created_at,
      clientName:
        r.user?.raw_user_meta_data?.full_name ||
        r.user?.email ||
        "Client",
      clientEmail: r.user?.email || "",
    }));

  // Stats globales
  const totalRevenue = transactions.reduce(
    (sum: number, t: any) => sum + (t.amount || 0),
    0
  );
  const paidRevenue = transactions
    .filter((t: any) => ["delivered", "in_production"].includes(t.status))
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  const pendingRevenue = transactions
    .filter((t: any) => t.status === "awaiting_payment")
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

  // Stats par mois
  const revenueByMonth = transactions.reduce((acc: any, t: any) => {
    const month = new Date(t.date).toLocaleString("fr-FR", {
      year: "numeric",
      month: "short",
    });
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += t.amount;
    return acc;
  }, {});

  const monthlyData = Object.entries(revenueByMonth).map(([month, amount]) => ({
    month,
    amount: amount as number,
  }));

  return (
    <FinanceClient
      transactions={transactions}
      totalRevenue={totalRevenue}
      paidRevenue={paidRevenue}
      pendingRevenue={pendingRevenue}
      monthlyData={monthlyData}
      userEmail={user.email || ""}
    />
  );
}
