"use client";

import { useState, useTransition } from "react";
import { creerDemande } from "./actions";

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
const phasesIA = [
  { value: "none", label: "Aucune" },
  { value: "deepseek", label: "DeepSeek" },
  { value: "gpt4o", label: "GPT‑4o" },
];

const exemple = {
  titre: "Campagne digitale pour Solution360°",
  type: "Application web / SaaS",
  budget: "1 000 000 – 1 500 000 FCFA",
  description:
    "Je souhaite lancer une campagne digitale pour présenter la plateforme Solution360° aux indépendants et petites entreprises. " +
    "Objectifs : expliquer clairement l’offre, récolter des leads qualifiés et mettre en avant l’IA (DeepSeek + GPT‑4o). " +
    "Livrables attendus : structure de landing page, séquence d’e‑mails, idées de visuels pour réseaux sociaux et script vidéo court. " +
    "Contraintes : ton professionnel mais accessible, branding orange/blanc/bleu déjà défini, budget limité mais impact maximum.",
  complexite: "Moyen",
  urgence: "Urgent",
  ai_phase: "deepseek" as const,
};

export default function NouvelleDemandePage() {
  const [titre, setTitre] = useState("");
  const [type, setType] = useState("");
  const [typeAutre, setTypeAutre] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [complexite, setComplexite] = useState<string | null>(null);
  const [urgence, setUrgence] = useState<string | null>(null);
  const [aiPhase, setAiPhase] = useState<string>("none");

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
    setAiPhase(exemple.ai_phase);
  }

  async function handleSubmit(formData: FormData) {
    formData.set("titre", titre);
    formData.set("type", typeEffectif);
    formData.set("budget", budget);
    formData.set("description", description);
    formData.set("complexite", complexite || "");
    formData.set("urgence", urgence || "");
    formData.set("ai_phase", aiPhase);

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
      setAiPhase("none");
    }
  }

  return (
    <>
      <section className="mb-6">
        <h1 className="text-lg md:text-xl font-semibold text-gray-900">
          Nouvelle demande
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Décrivez votre projet. L’IA vous aidera ensuite à clarifier le besoin
          et à proposer une estimation transparente en FCFA.
        </p>
      </section>

      <section>
        <form
          className="space-y-6 rounded-xl border border-gray-200 bg-white/85 p-5 text-sm shadow-sm"
          action={(formData) => {
            startTransition(() => handleSubmit(formData));
          }}
        >
          {message && (
            <div
              className={[
                "rounded-md px-3 py-2 text-[11px] border",
                isError
                  ? "bg-red-50 text-red-800 border-red-100"
                  : "bg-emerald-50 text-emerald-800 border-emerald-100",
              ].join(" ")}
            >
              {message}
            </div>
          )}

          {/* Titre + exemple */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1.5">
              <label
                htmlFor="titre"
                className="block text-xs font-medium uppercase tracking-wide text-gray-600"
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
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
              />
              <p className="text-[11px] text-gray-500">
                Un titre court et clair pour retrouver facilement votre
                demande.
              </p>
            </div>

            <button
              type="button"
              onClick={remplirExemple}
              className="mt-5 inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-medium text-orange-700 hover:bg-orange-100 transition"
            >
              Exemple de demande
            </button>
          </div>

          {/* Type + budget FCFA */}
          <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
            <div className="space-y-1.5">
              <label
                htmlFor="type"
                className="block text-xs font-medium uppercase tracking-wide text-gray-600"
              >
                Type de projet
              </label>
              <select
                id="type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
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
                  className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
                />
              )}
              <p className="text-[11px] text-gray-500">
                Cela aide l’IA à adapter les questions et l’estimation.
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="budget"
                className="block text-xs font-medium uppercase tracking-wide text-gray-600"
              >
                Budget cible en FCFA (optionnel)
              </label>
              <input
                id="budget"
                name="budget"
                type="text"
                placeholder="Ex. 500 000 – 1 000 000 FCFA"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
              />
              <p className="text-[11px] text-gray-500">
                Donnez une fourchette en FCFA. L’IA restera dans cette zone.
              </p>
            </div>
          </div>

          {/* Complexité / Urgence / Phase IA */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-600">
                Complexité
              </label>
              <select
                value={complexite ?? ""}
                onChange={(e) =>
                  setComplexite(e.target.value || null)
                }
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
              >
                <option value="">Sélectionner</option>
                {niveauxComplexite.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500">
                Complexité globale du projet (fonctionnalités, contraintes).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-600">
                Urgence
              </label>
              <select
                value={urgence ?? ""}
                onChange={(e) => setUrgence(e.target.value || null)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
              >
                <option value="">Sélectionner</option>
                {niveauxUrgence.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500">
                Urgence perçue (délais, contraintes externes).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-600">
                Phase IA initiale
              </label>
              <select
                value={aiPhase}
                onChange={(e) => setAiPhase(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
              >
                {phasesIA.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500">
                IA principale attendue pour l’analyse/production.
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="block text-xs font-medium uppercase tracking-wide text-gray-600"
            >
              Description détaillée
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              placeholder="Expliquez ce que vous voulez obtenir, votre contexte, vos objectifs et vos contraintes."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-300"
            />
            <div className="rounded-md bg-orange-50 px-3 py-2 text-[11px] text-orange-800 border border-orange-100">
              <p className="font-medium mb-1">Astuce IA</p>
              <p>
                Donnez des exemples concrets, votre audience cible, et ce que
                vous considérez comme un livrable &quot;réussi&quot;. Plus vous
                êtes précis, plus l’IA pourra proposer un plan pertinent.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-gray-500">
              Vous pourrez valider ou ajuster le prix en FCFA avant tout
              paiement.
            </p>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-2 text-xs md:text-sm font-medium text-white shadow-sm hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {isPending ? "Envoi en cours..." : "Envoyer pour analyse IA"}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}
