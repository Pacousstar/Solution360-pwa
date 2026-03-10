"use client";

import { Card, CardBody, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import { Lightbulb, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

interface WorkflowStep {
  id: string;
  label: string;
  description: string;
  action?: {
    label: string;
    href: string;
    tab?: string;
  };
  requirements?: string[];
  completed: boolean;
  current: boolean;
}

interface WorkflowGuideProps {
  currentStatus: string;
  requestId: string;
  hasFinalPrice: boolean;
  hasPriceJustification: boolean;
  hasDeliverables: boolean;
  hasPayment: boolean;
  isAdmin: boolean;
}

export default function WorkflowGuide({
  currentStatus,
  requestId,
  hasFinalPrice,
  hasPriceJustification,
  hasDeliverables,
  hasPayment,
  isAdmin,
}: WorkflowGuideProps) {
  // Définir les étapes selon le rôle
  const adminSteps: WorkflowStep[] = [
    {
      id: "analysis",
      label: "Analyser la demande",
      description: "Lancez l'analyse IA pour obtenir une estimation automatique",
      action: {
        label: "Analyser avec IA",
        href: `/admin/gerer/${requestId}`,
        tab: "analyse",
      },
      requirements: [],
      completed: currentStatus !== "pending",
      current: currentStatus === "pending" || currentStatus === "analysis",
    },
    {
      id: "pricing",
      label: "Définir le prix final",
      description: "Saisissez le prix final et la justification du tarif",
      action: {
        label: "Aller à la tarification",
        href: `/admin/gerer/${requestId}`,
        tab: "tarification",
      },
      requirements: [
        hasFinalPrice ? "✅ Prix final défini" : "❌ Prix final requis",
        hasPriceJustification
          ? "✅ Justification fournie"
          : "❌ Justification requise",
      ],
      completed: hasFinalPrice && hasPriceJustification,
      current: currentStatus === "analysis" && (!hasFinalPrice || !hasPriceJustification),
    },
    {
      id: "send_quote",
      label: "Envoyer le devis",
      description: "Envoyez le devis au client pour validation",
      action: {
        label: "Envoyer le devis",
        href: `/admin/gerer/${requestId}`,
        tab: "tarification",
      },
      requirements: [
        hasFinalPrice ? "✅ Prix final défini" : "❌ Prix final requis",
        hasPriceJustification
          ? "✅ Justification fournie"
          : "❌ Justification requise",
      ],
      completed: currentStatus === "awaiting_payment",
      current: currentStatus === "analysis" && hasFinalPrice && hasPriceJustification,
    },
    {
      id: "wait_payment",
      label: "Attendre le paiement",
      description: "Le client doit procéder au paiement",
      requirements: [hasPayment ? "✅ Paiement reçu" : "⏳ En attente du paiement"],
      completed: hasPayment && currentStatus === "in_production",
      current: currentStatus === "awaiting_payment",
    },
    {
      id: "production",
      label: "Traiter le projet",
      description: "Travaillez sur le projet et préparez les livrables",
      requirements: [],
      completed: currentStatus === "delivered",
      current: currentStatus === "in_production",
    },
    {
      id: "deliverables",
      label: "Uploader les livrables",
      description: "Téléversez tous les fichiers finaux",
      action: {
        label: "Uploader les livrables",
        href: `/admin/gerer/${requestId}`,
        tab: "livrables",
      },
      requirements: [
        hasDeliverables
          ? `✅ ${hasDeliverables ? "Livrable(s) uploadé(s)" : "Aucun livrable"}`
          : "❌ Au moins un livrable requis",
      ],
      completed: hasDeliverables && currentStatus === "delivered",
      current: currentStatus === "in_production" && !hasDeliverables,
    },
    {
      id: "delivery",
      label: "Marquer comme livré",
      description: "Finalisez la demande en marquant comme livré",
      action: {
        label: "Marquer comme livré",
        href: `/admin/gerer/${requestId}`,
        tab: "statut",
      },
      requirements: [
        hasDeliverables
          ? "✅ Livrables uploadés"
          : "❌ Livrables requis",
        currentStatus === "in_production"
          ? "✅ Statut correct"
          : "❌ Doit être en production",
      ],
      completed: currentStatus === "delivered",
      current:
        currentStatus === "in_production" &&
        hasDeliverables,
    },
  ];

  const clientSteps: WorkflowStep[] = [
    {
      id: "submit",
      label: "Demande soumise",
      description: "Votre demande a été reçue et est en cours d'analyse",
      completed: currentStatus !== "pending",
      current: currentStatus === "pending",
    },
    {
      id: "quote",
      label: "Devis reçu",
      description: "Un devis vous a été envoyé",
      action: {
        label: "Voir le devis",
        href: `/demandes/${requestId}`,
      },
      requirements: [
        hasFinalPrice ? "✅ Devis disponible" : "⏳ Devis en préparation",
      ],
      completed: hasFinalPrice,
      current: currentStatus === "analysis" && !hasFinalPrice,
    },
    {
      id: "payment",
      label: "Paiement",
      description: "Procédez au paiement pour lancer la production",
      action: {
        label: "Payer maintenant",
        href: `/demandes/${requestId}/paiement`,
      },
      requirements: [
        hasPayment ? "✅ Paiement effectué" : "❌ Paiement requis",
      ],
      completed: hasPayment,
      current: currentStatus === "awaiting_payment",
    },
    {
      id: "production",
      label: "En production",
      description: "Votre projet est en cours de réalisation",
      completed: currentStatus === "delivered",
      current: currentStatus === "in_production",
    },
    {
      id: "delivery",
      label: "Livraison",
      description: "Votre projet est terminé et livré",
      action: {
        label: "Télécharger les livrables",
        href: `/demandes/${requestId}`,
      },
      requirements: [
        hasDeliverables
          ? "✅ Livrables disponibles"
          : "⏳ Livrables en préparation",
      ],
      completed: currentStatus === "delivered",
      current: currentStatus === "delivered",
    },
  ];

  const steps = isAdmin ? adminSteps : clientSteps;
  const currentStep = steps.find((s) => s.current) || steps[0];
  const nextSteps = steps.filter((s) => !s.completed && !s.current).slice(0, 2);

  if (!currentStep && steps.every((s) => s.completed)) {
    return null; // Tout est terminé
  }

  return (
    <Card variant="bordered" className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          Guide du workflow
        </CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        {/* Étape actuelle */}
        {currentStep && (
          <div className="bg-white rounded-xl p-4 border-2 border-blue-300">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="default" size="sm" className="bg-blue-500 text-white">
                    Étape actuelle
                  </Badge>
                  <h4 className="font-bold text-gray-900">{currentStep.label}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">{currentStep.description}</p>

                {currentStep.requirements && currentStep.requirements.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {currentStep.requirements.map((req, idx) => (
                      <p key={idx} className="text-xs text-gray-700">
                        {req}
                      </p>
                    ))}
                  </div>
                )}

                {currentStep.action && (
                  <Link href={currentStep.action.href}>
                    <Button
                      variant="primary"
                      size="sm"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      {currentStep.action.label}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Prochaines étapes */}
        {nextSteps.length > 0 && (
          <div>
            <h5 className="text-sm font-semibold text-gray-700 mb-2">
              Prochaines étapes
            </h5>
            <div className="space-y-2">
              {nextSteps.map((step) => (
                <div
                  key={step.id}
                  className="bg-white/60 rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-600">{step.description}</p>
                    </div>
                    {step.action && (
                      <Link href={step.action.href}>
                        <Button variant="ghost" size="sm">
                          →
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
