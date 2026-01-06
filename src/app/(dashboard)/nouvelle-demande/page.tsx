"use client";

import { useState, useTransition } from "react";
import { creerDemande } from "./actions";
import Link from "next/link";

const typesProjet = [
  "Site web",
  "Application web / SaaS",
  "Campagne politique",
  "Audit / Conseil",
  "Automatisation / IA",
  "Autre",
];

const niveauxComplexite = ["Simple", "Moyen", "Complexe"] as const;
const niveauxUrgence = ["Normal", "Urgent", "Critique"] as const;

const exemple = {
  titre: "Campagne digitale pour Solution360°",
  type: "Application web / SaaS",
  budget: "1 000 000 – 1 500 000 FCFA",
  description:
    "Je souhaite lancer une campagne digitale pour présenter la plateforme Solution360° aux indépendants et petites entreprises. " +
    "Objectifs : expliquer clairement l'offre, récolter des leads qualifiés et mettre en avant l'IA (DeepSeek + GPT‑4o). " +
    "Livrables attendus : structure de landing page, séquence d'e‑mails, idées de visuels pour réseaux sociaux et script vidéo court. " +
    "Contraintes : ton professionnel mais accessible, branding orange/blanc/bleu déjà défini, budget limité mais impact maximum.",
  complexite: "Moyen",
  urgence: "Urgent",
};

export default function NouvelleDemandePage() {
  const [titre, setTitre] = useState("");
  const [type, setType] = useState("");
  const [typeAutre, setTypeAutre] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [complexite, setComplexite] = useState<string | null>(null);
  const [urgence, setUrgence] = useState<string | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const typeEffectif =
    type === "Autre" && typeAutre.trim() ? typeAutre.trim() : type;

  function remplirExemple() {
    setTitre(exemple.titre);
    setType(exemple.type);
    setTypeAutre("");
    setBudget(exemple.budget);
    setDescription(exemple.description);
    setComplexite(exemple.complexite);
    setUrgence(exemple.urgence);
  }

  async function handleSubmit(formData: FormData) {
    formData.set("titre", titre);
    formData.set("type", typeEffectif);
    formData.set("budget", budget);
    formData.set("description", description);
    formData.set("complexite", complexite || "");
    formData.set("urgence", urgence || "");
    formData.set("ai_phase", "none"); // ✅ Retiré du formulaire

    const res = await creerDemande(formData);
    setIsError(!res.ok);
    setMessage(res.message);

    if (res.ok) {
      setTitre("");
      setType("");
      setTypeAutre("");
      setBudget("");
      setDescription("");
      setComplexite(null);
      setUrgence(null);
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-sky-50/30">
      {/* Header moderne */}
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/demandes">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-sky-500 shadow-lg cursor-pointer hover:scale-105 transition-transform">
                  <span className="text-lg font-black text-white">S360</span>
                </div>
              </Link>
              <div>
                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                  Nouvelle demande
                </p>
                <h1 className="text-xl font-black text-gray-900">
                  Décrivez votre projet
                </h1>
              </div>
            </div>
            <Link
              href="/demandes"
              className="text-sm text-gray-600 hover:text-orange-600 transition-colors font-semibold"
            >
              ← Retour
            </Link>
          </div>
        </div>
      </header>

      {/* Intro */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-orange-50 to-sky-50 rounded-2xl border-2 border-orange-200 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-sky-500 shadow-lg flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-black text-gray-900 mb-2">
                💡 Comment ça marche ?
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                Décrivez votre projet ci-dessous. <strong>Solution360°</strong> analysera
                votre demande et vous proposera une estimation transparente en FCFA
                adaptée à vos besoins.
              </p>
            </div>
          </div>
        </div>

        {/* Message de feedback */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border-2 font-semibold ${
              isError
                ? "bg-red-50 border-red-300 text-red-800"
                : "bg-green-50 border-green-300 text-green-800"
            }`}
          >
            {message}
          </div>
        )}

        {/* Formulaire */}
        <form
          className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden"
          action={(formData) => {
            startTransition(() => handleSubmit(formData));
          }}
        >
          <div className="p-8 space-y-8">
            {/* Titre + Bouton exemple */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div className="flex-1 w-full space-y-2">
                <label
                  htmlFor="titre"
                  className="block text-sm font-bold text-gray-700"
                >
                  Titre du projet
                </label>
                <input
                  id="titre"
                  name="titre"
                  type="text"
                  placeholder="Ex. Landing page pour Solution360°"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <p className="text-xs text-gray-500">
                  Un titre court et clair pour retrouver facilement votre demande.
                </p>
              </div>

              <button
                type="button"
                onClick={remplirExemple}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-100 to-sky-100 border-2 border-orange-200 text-orange-700 font-bold text-sm hover:from-orange-200 hover:to-sky-200 transition-all whitespace-nowrap"
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Exemple
              </button>
            </div>

            {/* Type + Budget */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="type"
                  className="block text-sm font-bold text-gray-700"
                >
                  Type de projet
                </label>
                <select
                  id="type"
                  name="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                >
                  <option value="">Sélectionner un type</option>
                  {typesProjet.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {type === "Autre" && (
                  <input
                    type="text"
                    placeholder="Précisez votre type de projet"
                    value={typeAutre}
                    onChange={(e) => setTypeAutre(e.target.value)}
                    className="mt-2 w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                )}
                <p className="text-xs text-gray-500">
                  Cela aide <strong>Solution360°</strong> à adapter les questions et l'estimation.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="budget"
                  className="block text-sm font-bold text-gray-700"
                >
                  Budget cible en FCFA <span className="text-gray-400">(optionnel)</span>
                </label>
                <input
                  id="budget"
                  name="budget"
                  type="text"
                  placeholder="Ex. 500 000 – 1 000 000 FCFA"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <p className="text-xs text-gray-500">
                  Donnez une fourchette en FCFA. <strong>Solution360°</strong> restera dans cette zone.
                </p>
              </div>
            </div>

            {/* Complexité / Urgence (Phase IA retirée) */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Complexité
                </label>
                <select
                  value={complexite ?? ""}
                  onChange={(e) => setComplexite(e.target.value || null)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                >
                  <option value="">Sélectionner</option>
                  {niveauxComplexite.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Complexité globale du projet (fonctionnalités, contraintes).
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">
                  Urgence
                </label>
                <select
                  value={urgence ?? ""}
                  onChange={(e) => setUrgence(e.target.value || null)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                >
                  <option value="">Sélectionner</option>
                  {niveauxUrgence.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Urgence perçue (délais, contraintes externes).
                </p>
              </div>
            </div>
            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-bold text-gray-700"
              >
                Description détaillée
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                placeholder="Expliquez ce que vous voulez obtenir, votre contexte, vos objectifs et vos contraintes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all resize-none"
              />

              {/* Astuce Solution360° */}
              <div className="rounded-xl bg-gradient-to-r from-orange-50 to-sky-50 border-2 border-orange-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-sky-500 flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-orange-800 mb-1">
                      💡 Astuce Solution360°
                    </p>
                    <p className="text-xs text-orange-700 leading-relaxed">
                      Donnez des exemples concrets, votre audience cible, et ce que
                      vous considérez comme un livrable &quot;réussi&quot;. Plus vous
                      êtes précis, plus <strong>Solution360°</strong> pourra proposer un
                      plan pertinent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer avec CTA */}
          <div className="bg-gradient-to-r from-orange-50 to-sky-50 px-8 py-6 border-t-2 border-orange-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-600">
                💳 Vous pourrez valider ou ajuster le prix en FCFA avant tout
                paiement.
              </p>
              <button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-sky-500 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isPending ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Envoyer pour analyse
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
