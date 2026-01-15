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
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Logo size="md" href="/" />
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center px-6 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-sm font-semibold text-white shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all"
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient avec dominance orange */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-50/30"></div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 shadow-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
              </span>
              <span className="text-xs font-semibold text-orange-800 uppercase tracking-wider">
                🚀 Alimenté par l'IA GPT-4o & DeepSeek
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
              Votre solution digitale
              <br />
              <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent">
                en 360°
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-gray-600 mb-12 leading-relaxed">
              De l'idée au livrable en{" "}
              <span className="font-bold text-orange-600">3 étapes simples</span>.
              <br />
              L'IA analyse votre projet, propose un devis transparent, et notre équipe produit un résultat premium.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link
                href="/register"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300"
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
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 rounded-xl border-2 border-gray-300 bg-white hover:border-orange-400 hover:bg-orange-50 transition-all duration-300"
              >
                Se connecter
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { label: "Projets livrés", value: "150+", icon: "🎯" },
                { label: "Satisfaction", value: "98%", icon: "⭐" },
                { label: "Délai moyen", value: "48h", icon: "⚡" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 border border-orange-100 shadow-lg hover:shadow-xl hover:border-orange-200 transition-all"
                >
                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <div className="text-4xl font-black bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-orange-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-4">
              PROCESSUS SIMPLE
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6">
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
                gradient: "from-orange-500 to-orange-600",
                bgGradient: "from-orange-50 to-orange-100",
              },
              {
                num: "02",
                title: "Analyse & Devis IA",
                desc: "Notre IA analyse votre besoin, reformule le cahier des charges et propose un tarif transparent en temps réel.",
                icon: "🤖",
                gradient: "from-orange-600 to-red-500",
                bgGradient: "from-orange-100 to-red-50",
              },
              {
                num: "03",
                title: "Production Premium",
                desc: "Après validation du devis, GPT-4o et notre équipe d'experts produisent un livrable de qualité professionnelle.",
                icon: "🎯",
                gradient: "from-orange-500 to-green-500",
                bgGradient: "from-orange-50 to-green-50",
              },
            ].map((step, index) => (
              <article
                key={index}
                className="group relative bg-white rounded-3xl p-8 border-2 border-orange-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${step.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity -z-10`}
                ></div>

                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${step.gradient} text-white text-4xl shadow-xl`}
                  >
                    {step.icon}
                  </div>
                  <div
                    className={`text-7xl font-black bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent opacity-20`}
                  >
                    {step.num}
                  </div>
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-4">
              AVANTAGES
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6">
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
                color: "orange",
              },
              {
                icon: "💎",
                title: "Qualité Premium",
                desc: "Livrables professionnels, designs soignés",
                color: "orange",
              },
              {
                icon: "🔒",
                title: "Transparent",
                desc: "Prix clair avant production, sans surprise",
                color: "orange",
              },
              {
                icon: "🤝",
                title: "Accompagnement",
                desc: "Suivi personnalisé de A à Z",
                color: "orange",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 border-2 border-orange-100 shadow-xl hover:shadow-2xl hover:scale-105 hover:border-orange-200 transition-all text-center"
              >
                <div className="text-6xl mb-6">{feature.icon}</div>
                <h4 className="text-xl font-black text-gray-900 mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">
            Prêt à transformer votre idée en réalité ?
          </h2>
          <p className="text-xl sm:text-2xl text-white/90 mb-10 leading-relaxed">
            Rejoignez des centaines de clients satisfaits. Créez votre compte
            gratuitement et soumettez votre premier projet en moins de 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-orange-600 rounded-xl bg-white shadow-2xl hover:shadow-white/50 hover:scale-105 transition-all"
            >
              Créer un compte gratuitement
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white rounded-xl border-2 border-white hover:bg-white hover:text-orange-600 transition-all"
            >
              J'ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div className="mb-8 md:mb-0">
              <Logo size="lg" href="/" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link href="/termes" className="text-gray-400 hover:text-orange-400 transition-colors">
                Termes et conditions
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/login" className="text-gray-400 hover:text-orange-400 transition-colors">
                Se connecter
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/register" className="text-gray-400 hover:text-orange-400 transition-colors">
                Créer un compte
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 mb-2">
              Plateforme de consulting digital alimentée par l'IA
            </p>
            <p className="text-sm text-gray-500">
              © 2026 GSN EXPERTISES GROUP. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
