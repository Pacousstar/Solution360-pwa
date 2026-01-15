import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";

export default async function HomePage() {
  // Vérifier si l'utilisateur est connecté
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si connecté, rediriger vers le dashboard
  if (user) {
    redirect("/demandes");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-sky-50 overflow-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" href="/" />
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 to-sky-500 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-orange-200 shadow-lg mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                🚀 Alimenté par l'IA GPT-4o & DeepSeek
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
              Votre solution digitale,
              <br />
              <span className="bg-gradient-to-r from-orange-500 via-sky-500 to-green-500 bg-clip-text text-transparent">
                en 360°
              </span>
            </h1>

            <p className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed">
              De l'idée au livrable en{" "}
              <span className="font-semibold text-orange-600">3 étapes simples</span>.
              L'IA analyse votre projet, propose un devis transparent, et notre
              équipe produit un résultat premium.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/register"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white rounded-full bg-gradient-to-r from-orange-500 to-sky-500 shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Démarrer gratuitement
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 rounded-full border-2 border-gray-300 bg-white hover:border-orange-400 hover:bg-orange-50 transition-all duration-300"
              >
                Se connecter
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { label: "Projets livrés", value: "150+" },
                { label: "Satisfaction", value: "98%" },
                { label: "Délai moyen", value: "48h" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="text-3xl font-black bg-gradient-to-r from-orange-600 to-sky-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Un processus simple et transparent, de A à Z
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "Soumission rapide",
                desc: "Décrivez votre projet via notre formulaire intelligent assisté par IA. Ajoutez des fichiers en glisser-déposer.",
                icon: "📝",
                color: "from-orange-500 to-red-500",
                gradient: "from-orange-50 to-red-50",
              },
              {
                num: "02",
                title: "Analyse & Devis IA",
                desc: "Notre IA analyse votre besoin, reformule le cahier des charges et propose un tarif transparent en temps réel.",
                icon: "🤖",
                color: "from-sky-500 to-blue-600",
                gradient: "from-sky-50 to-blue-50",
              },
              {
                num: "03",
                title: "Production Premium",
                desc: "Après validation du devis, GPT-4o et notre équipe d'experts produisent un livrable de qualité professionnelle.",
                icon: "🎯",
                color: "from-green-500 to-emerald-600",
                gradient: "from-green-50 to-emerald-50",
              },
            ].map((step, index) => (
              <article
                key={index}
                className="group relative bg-white rounded-3xl p-8 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity -z-10`}
                ></div>

                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} text-white text-3xl shadow-xl`}
                  >
                    {step.icon}
                  </div>
                  <div
                    className={`text-6xl font-black bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-20`}
                  >
                    {step.num}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Pourquoi Solution360° ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une approche innovante qui combine IA et expertise humaine
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "⚡",
                title: "Rapide",
                desc: "Devis en 48h, livraison express possible",
              },
              {
                icon: "💎",
                title: "Qualité Premium",
                desc: "Livrables professionnels, designs soignés",
              },
              {
                icon: "🔒",
                title: "Transparent",
                desc: "Prix clair avant production, sans surprise",
              },
              {
                icon: "🤝",
                title: "Accompagnement",
                desc: "Suivi personnalisé de A à Z",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all text-center"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 via-sky-500 to-green-500 relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6">
            Prêt à transformer votre idée en réalité ?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Rejoignez des centaines de clients satisfaits. Créez votre compte
            gratuitement et soumettez votre premier projet en moins de 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-orange-600 rounded-full bg-white shadow-2xl hover:shadow-white/50 hover:scale-105 transition-all"
            >
              Créer un compte gratuitement
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white rounded-full border-2 border-white hover:bg-white hover:text-orange-600 transition-all"
            >
              J'ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <Logo size="lg" href="/" className="text-white" />
          </div>
          <p className="text-gray-400 mb-6">
            Plateforme de consulting digital alimentée par l'IA
          </p>
          <p className="text-sm text-gray-500">
            © 2026 GSN EXPERTISES GROUP. Tous droits réservés.
          </p>
        </div>
      </footer>
    </main>
  );
}
