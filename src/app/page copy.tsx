import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
    <main className="min-h-screen flex bg-gradient-to-br from-orange-50 via-white to-sky-50">
      {/* Colonne principale (contenu) */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-5xl px-6 pt-12 pb-20">
          {/* Hero compact */}
          <section className="mb-10">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.22em] mb-3 text-center md:text-left">
              Bienvenue sur Solution360°
            </p>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="md:max-w-xl">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
                  Votre solution, en{" "}
                  <span className="text-orange-500 font-bold">360°</span>
                </h1>

                <p className="mt-3 text-sm md:text-[15px] text-gray-600 leading-relaxed">
                  Soumettez votre projet, laissez l&apos;IA analyser, et recevez
                  une proposition professionnelle claire avant de valider le
                  paiement et la production.
                </p>
              </div>

              <div className="flex gap-3 md:justify-end">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-xs md:text-sm font-medium text-white shadow-sm hover:bg-orange-600 transition-all hover:shadow-md"
                >
                  Commencer maintenant
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-2.5 text-xs md:text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
                >
                  Se connecter
                </Link>
              </div>
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
                  num: "1",
                  title: "Soumission",
                  desc: "Formulaire guidé, drag & drop, et aide IA pour bien cadrer votre demande.",
                  color: "orange",
                },
                {
                  num: "2",
                  title: "Analyse & Prix",
                  desc: "L'IA reformule, clarifie et propose un tarif transparent que vous validez.",
                  color: "sky",
                },
                {
                  num: "3",
                  title: "Production & Livrable",
                  desc: "Après validation, GPT-4o et l'équipe produisent un livrable premium à votre image.",
                  color: "green",
                },
              ].map((step) => (
                <article
                  key={step.num}
                  className="group rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm p-5 text-sm leading-relaxed shadow-sm hover:shadow-md transition-all"
                >
                  <div
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-3 text-white font-bold text-sm ${
                      step.color === "orange"
                        ? "bg-orange-500"
                        : step.color === "sky"
                        ? "bg-sky-500"
                        : "bg-green-500"
                    }`}
                  >
                    {step.num}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[13px] text-gray-600 leading-relaxed">
                    {step.desc}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* CTA final */}
          <section className="text-center border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Prêt à transformer votre idée en réalité ?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Créez un compte gratuitement et soumettez votre premier projet en
              moins de 5 minutes.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-sky-500 px-6 py-3 text-sm font-medium text-white shadow-lg hover:shadow-xl transition-all"
            >
              Créer un compte gratuitement
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
