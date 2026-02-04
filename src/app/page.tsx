import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import { Card, CardBody, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { ArrowRight, CheckCircle, Sparkles, Zap, Shield, Users, Clock, Star, TrendingUp, Award } from "lucide-react";

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
    <main className="min-h-screen bg-gradient-to-br from-orange-100 via-orange-200/80 to-orange-100 overflow-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-100/95 via-orange-200/95 to-orange-100/95 backdrop-blur-xl border-b border-orange-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Logo size="md" href="/" />
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  Se connecter
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Commencer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient avec dominance orange */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-200 via-orange-300/60 to-orange-200/70"></div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            {/* Badge */}
            <Badge variant="default" size="lg" className="mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-600"></span>
              </span>
              Alimenté par l'IA GPT-4o & DeepSeek
            </Badge>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-tight">
              <span className="text-orange-600">
                Votre solution digitale
              </span>
              <br />
              <span className="text-green-500">
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
              <Link href="/register">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="group"
                >
                  Démarrer gratuitement
                </Button>
              </Link>

              <Link href="/login">
                <Button variant="outline" size="lg">
                  Se connecter
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { label: "Projets livrés", value: "150+", icon: Award, color: "orange" },
                { label: "Satisfaction", value: "98%", icon: Star, color: "yellow" },
                { label: "Délai moyen", value: "48h", icon: Clock, color: "green" },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={index}
                    variant="bordered"
                    className="border-orange-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 text-center group"
                  >
                    <CardBody className="p-8">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${
                        stat.color === 'orange' ? 'from-orange-500 to-orange-600' :
                        stat.color === 'yellow' ? 'from-yellow-400 to-yellow-500' :
                        'from-green-500 to-green-600'
                      } text-white mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <div className="text-4xl font-black bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm font-semibold text-gray-700">
                        {stat.label}
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-100/90 to-orange-200/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge variant="default" size="lg" className="mb-4">
              PROCESSUS SIMPLE
            </Badge>
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
                bgGradient: "from-orange-100 to-orange-200",
              },
              {
                num: "02",
                title: "Analyse & Devis IA",
                desc: "Notre IA analyse votre besoin, reformule le cahier des charges et propose un tarif transparent en temps réel.",
                icon: "🤖",
                gradient: "from-orange-600 to-red-500",
                bgGradient: "from-orange-200 to-red-100",
              },
              {
                num: "03",
                title: "Production Premium",
                desc: "Après validation du devis, GPT-4o et notre équipe d'experts produisent un livrable de qualité professionnelle.",
                icon: "🎯",
                gradient: "from-orange-500 to-green-500",
                bgGradient: "from-orange-100 to-green-100",
              },
            ].map((step, index) => (
              <Card
                key={index}
                variant="elevated"
                className="group relative border-2 border-orange-200 hover:-translate-y-2 transition-all duration-300"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${step.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity -z-10`}
                ></div>

                <CardBody className="p-8">
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
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-200 to-orange-300/70">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge variant="default" size="lg" className="mb-4">
              AVANTAGES
            </Badge>
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
                icon: Zap,
                title: "Rapide",
                desc: "Devis en 48h, livraison express possible",
                gradient: "from-orange-500 to-yellow-500",
              },
              {
                icon: Award,
                title: "Qualité Premium",
                desc: "Livrables professionnels, designs soignés",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Shield,
                title: "Transparent",
                desc: "Prix clair avant production, sans surprise",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: Users,
                title: "Accompagnement",
                desc: "Suivi personnalisé de A à Z",
                gradient: "from-green-500 to-emerald-500",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  variant="bordered"
                  className="bg-gradient-to-br from-orange-100 to-orange-200/70 border-2 border-orange-300 hover:border-orange-400 hover:scale-105 hover:shadow-xl transition-all duration-300 text-center group"
                >
                  <CardBody className="p-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-black text-gray-900 mb-3">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-200/90 to-orange-300/70">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="default" size="lg" className="mb-4">
              TÉMOIGNAGES
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Ce que disent nos clients
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des centaines de projets réussis, des clients satisfaits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Marie K.",
                role: "Entrepreneuse",
                content: "Solution360° a transformé mon idée en un site web professionnel en moins d'une semaine. L'IA a parfaitement compris mes besoins !",
                rating: 5,
              },
              {
                name: "Jean-Paul D.",
                role: "Directeur Marketing",
                content: "Service exceptionnel ! Le devis était transparent, la livraison rapide, et le résultat dépasse mes attentes. Je recommande vivement.",
                rating: 5,
              },
              {
                name: "Aminata S.",
                role: "Fondatrice Startup",
                content: "L'accompagnement de A à Z est remarquable. L'équipe est réactive et les livrables sont de qualité premium. Un investissement qui vaut le coup !",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card
                key={index}
                variant="elevated"
                className="hover:shadow-xl transition-all duration-300"
              >
                <CardBody className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
            <TrendingUp className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-green-400 mb-6">
            Prêt à transformer votre idée en réalité ?
          </h2>
          <p className="text-xl sm:text-2xl text-white/90 mb-10 leading-relaxed">
            Rejoignez des centaines de clients satisfaits. Créez votre compte
            gratuitement et soumettez votre premier projet en moins de 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button
                variant="outline"
                size="lg"
                className="bg-green-500 text-white border-green-500 hover:bg-green-600 hover:border-green-600 hover:scale-105 transition-transform shadow-xl"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Créer un compte gratuitement
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-green-400 text-white hover:bg-green-400 hover:text-white transition-all"
              >
                J'ai déjà un compte
              </Button>
            </Link>
          </div>
          <p className="text-white/80 text-sm mt-8">
            ✨ Sans engagement • Essai gratuit • Support 24/7
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Logo size="lg" href="/" />
              <p className="text-gray-400 mt-4 max-w-md leading-relaxed">
                Plateforme de consulting digital alimentée par l'IA. 
                Transformez vos idées en solutions professionnelles en 360°.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <Badge variant="default" size="sm" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  IA Avancée
                </Badge>
                <Badge variant="default" size="sm" className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Qualité Premium
                </Badge>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-white mb-4">Navigation</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Se connecter
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Créer un compte
                  </Link>
                </li>
                <li>
                  <Link href="/termes" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Termes et conditions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-white mb-4">Contact</h3>
              <ul className="space-y-3 text-gray-400">
                <li>support@solution360.app</li>
                <li>+225 XX XX XX XX</li>
                <li>Abidjan, Côte d'Ivoire</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500 text-center md:text-left">
                © 2026 GSN EXPERTISES GROUP. Tous droits réservés.
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span>Fait avec ❤️ en Afrique</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
