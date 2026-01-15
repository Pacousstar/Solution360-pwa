import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Vérifier l'authentification
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Récupérer le profil
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Si admin, rediriger vers admin
  if (profile?.is_admin) {
    redirect('/admin/demandes');
  }

  // Récupérer les statistiques réelles de l'utilisateur
  const { data: userRequests } = await supabase
    .from('requests')
    .select('id, status')
    .eq('user_id', user.id);

  const totalRequests = userRequests?.length || 0;
  const inProgressCount = userRequests?.filter(r => 
    ['analysis', 'awaiting_payment', 'in_production'].includes(r.status)
  ).length || 0;
  const deliveredCount = userRequests?.filter(r => 
    r.status === 'delivered'
  ).length || 0;

  const stats = [
    {
      label: "Demandes totales",
      value: totalRequests.toString(),
      detail: totalRequests > 0 ? "Toutes vos demandes" : "Aucune demande",
    },
    {
      label: "En cours",
      value: inProgressCount.toString(),
      detail: "Analyse IA ou production",
    },
    {
      label: "Livrées",
      value: deliveredCount.toString(),
      detail: "Livrables envoyés",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero compact */}
        <section className="mb-8">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.22em] mb-3 text-center md:text-left">
            Bienvenue {profile?.full_name || user.email}
          </p>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="md:max-w-xl">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
                Votre solution, en{" "}
                <span className="text-orange-500 font-bold">360°</span>
              </h1>

              <p className="mt-3 text-sm md:text-[15px] text-gray-600 leading-relaxed">
                Soumettez votre projet, laissez l&apos;IA analyser, et recevez une
                proposition professionnelle claire avant de valider le paiement et
                la production.
              </p>
            </div>

            <div className="flex md:justify-end">
              <Link
                href="/nouvelle-demande"
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-2 text-xs md:text-sm font-medium text-white shadow-sm hover:bg-orange-600 transition"
              >
                Commencer une nouvelle demande
              </Link>
            </div>
          </div>
        </section>

        {/* Statistiques principales */}
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Vue d'ensemble
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-gray-200 bg-white/80 p-4 text-sm shadow-sm"
              >
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  {s.label}
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {s.value}
                </p>
                <p className="mt-1 text-[12px] text-gray-500">{s.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="pb-10">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
            Comment ça marche ?
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "1. Soumission",
                desc: "Formulaire guidé, drag & drop, et aide IA pour bien cadrer votre demande.",
              },
              {
                title: "2. Analyse & Prix",
                desc: "DeepSeek reformule, clarifie et propose un tarif transparent que vous validez.",
              },
              {
                title: "3. Production & Livrable",
                desc: "Après validation, GPT‑4o et l'équipe produisent un livrable premium à votre image.",
              },
            ].map((step) => (
              <article
                key={step.title}
                className="rounded-xl border border-gray-200 bg-white/70 p-4 text-sm leading-relaxed shadow-sm"
              >
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-[13px] text-gray-600">{step.desc}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
