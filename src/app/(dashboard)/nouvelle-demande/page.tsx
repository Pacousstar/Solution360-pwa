"use client";

import { useState, useTransition } from "react";
import { creerDemande } from "./actions";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Card, CardBody, CardHeader, CardTitle, Input, Select, Textarea, Button, Alert } from "@/components/ui";
import { Zap, Lightbulb, Send } from "lucide-react";

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
              <Logo size="md" href="/" showText={false} />
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
        <Card variant="bordered" className="bg-gradient-to-r from-orange-50 to-sky-50 border-orange-200 mb-8">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-sky-500 shadow-lg flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="mb-2">
                  💡 Comment ça marche ?
                </CardTitle>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Décrivez votre projet ci-dessous. <strong>Solution360°</strong> analysera
                  votre demande et vous proposera une estimation transparente en FCFA
                  adaptée à vos besoins.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Message de feedback */}
        {message && (
          <Alert
            variant={isError ? 'error' : 'success'}
            className="mb-6"
          >
            {message}
          </Alert>
        )}

        {/* Formulaire */}
        <Card variant="elevated" className="overflow-hidden">
          <form
            action={(formData) => {
              startTransition(() => handleSubmit(formData));
            }}
          >
            <CardBody className="p-8 space-y-8">
              {/* Titre + Bouton exemple */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div className="flex-1 w-full">
                  <Input
                    id="titre"
                    name="titre"
                    type="text"
                    label="Titre du projet"
                    placeholder="Ex. Landing page pour Solution360°"
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    helperText="Un titre court et clair pour retrouver facilement votre demande."
                    required
                  />
                </div>

                <Button
                  type="button"
                  onClick={remplirExemple}
                  variant="outline"
                  size="md"
                  leftIcon={<Zap className="w-4 h-4" />}
                  className="whitespace-nowrap"
                >
                  Exemple
                </Button>
              </div>

              {/* Type + Budget */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Select
                    id="type"
                    name="type"
                    label="Type de projet"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    options={[
                      { value: '', label: 'Sélectionner un type' },
                      ...typesProjet.map((t) => ({ value: t, label: t })),
                    ]}
                    helperText="Cela aide Solution360° à adapter les questions et l'estimation."
                    required
                  />
                  {type === "Autre" && (
                    <Input
                      type="text"
                      placeholder="Précisez votre type de projet"
                      value={typeAutre}
                      onChange={(e) => setTypeAutre(e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>

                <Input
                  id="budget"
                  name="budget"
                  type="text"
                  label="Budget cible en FCFA (optionnel)"
                  placeholder="Ex. 500 000 – 1 000 000 FCFA"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  helperText="Donnez une fourchette en FCFA. Solution360° restera dans cette zone."
                />
              </div>

              {/* Complexité / Urgence */}
              <div className="grid md:grid-cols-2 gap-6">
                <Select
                  label="Complexité"
                  value={complexite ?? ""}
                  onChange={(e) => setComplexite(e.target.value || null)}
                  options={[
                    { value: '', label: 'Sélectionner' },
                    ...niveauxComplexite.map((c) => ({ value: c, label: c })),
                  ]}
                  helperText="Complexité globale du projet (fonctionnalités, contraintes)."
                />

                <Select
                  label="Urgence"
                  value={urgence ?? ""}
                  onChange={(e) => setUrgence(e.target.value || null)}
                  options={[
                    { value: '', label: 'Sélectionner' },
                    ...niveauxUrgence.map((u) => ({ value: u, label: u })),
                  ]}
                  helperText="Urgence perçue (délais, contraintes externes)."
                />
              </div>
              {/* Description */}
              <div>
                <Textarea
                  id="description"
                  name="description"
                  label="Description détaillée"
                  rows={6}
                  placeholder="Expliquez ce que vous voulez obtenir, votre contexte, vos objectifs et vos contraintes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />

                {/* Astuce Solution360° */}
                <Card variant="bordered" className="bg-gradient-to-r from-orange-50 to-sky-50 border-orange-200 mt-4">
                  <CardBody className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-sky-500 flex-shrink-0">
                        <Lightbulb className="w-4 h-4 text-white" />
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
                  </CardBody>
                </Card>
              </div>
            </CardBody>

            {/* Footer avec CTA */}
            <div className="bg-gradient-to-r from-orange-50 to-sky-50 px-8 py-6 border-t-2 border-orange-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-gray-600">
                  💳 Vous pourrez valider ou ajuster le prix en FCFA avant tout
                  paiement.
                </p>
                <Button
                  type="submit"
                  disabled={isPending}
                  isLoading={isPending}
                  variant="primary"
                  size="lg"
                  leftIcon={!isPending ? <Send className="w-5 h-5" /> : undefined}
                  className="w-full sm:w-auto"
                >
                  {isPending ? 'Envoi en cours...' : 'Envoyer pour analyse'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
}
