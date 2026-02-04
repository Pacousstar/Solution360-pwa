"use client";

import { Card, CardBody, CardHeader, CardTitle, Badge } from "@/components/ui";
import { CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react";

interface TimelineEvent {
  id: string;
  status: string;
  label: string;
  date: string;
  changed_by?: string;
  change_reason?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface WorkflowTimelineProps {
  currentStatus: string;
  events: TimelineEvent[];
  requestId: string;
}

const statusOrder = [
  "pending",
  "analysis",
  "awaiting_payment",
  "in_production",
  "delivered",
];

const statusLabels: Record<string, { label: string; emoji: string; color: string }> = {
  pending: { label: "En attente", emoji: "⏳", color: "gray" },
  analysis: { label: "En analyse", emoji: "🤖", color: "blue" },
  awaiting_payment: { label: "En attente de paiement", emoji: "💳", color: "orange" },
  in_production: { label: "En production", emoji: "⚙️", color: "purple" },
  delivered: { label: "Livré", emoji: "✅", color: "green" },
  cancelled: { label: "Annulé", emoji: "❌", color: "red" },
};

export default function WorkflowTimeline({
  currentStatus,
  events,
  requestId,
}: WorkflowTimelineProps) {
  // Créer la timeline complète avec tous les statuts
  const allStatuses = statusOrder.filter((s) => s !== "cancelled");
  const timeline = allStatuses.map((status) => {
    const event = events.find((e) => e.status === status);
    const statusInfo = statusLabels[status] || { label: status, emoji: "📌", color: "gray" };
    const isCompleted = statusOrder.indexOf(status) < statusOrder.indexOf(currentStatus);
    const isCurrent = status === currentStatus;

    return {
      status,
      ...statusInfo,
      date: event?.date || null,
      changed_by: event?.changed_by,
      change_reason: event?.change_reason,
      isCompleted,
      isCurrent,
    };
  });

  return (
    <Card variant="bordered" className="bg-gradient-to-br from-gray-50 to-gray-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          Progression du projet
        </CardTitle>
      </CardHeader>
      <CardBody className="p-6">
        <div className="space-y-4">
          {timeline.map((step, index) => {
            const isLast = index === timeline.length - 1;
            const stepColor = step.isCompleted
              ? "text-green-600"
              : step.isCurrent
              ? "text-orange-600"
              : "text-gray-400";

            return (
              <div key={step.status} className="relative">
                {/* Ligne de connexion */}
                {!isLast && (
                  <div
                    className={`absolute left-6 top-12 w-0.5 h-full ${
                      step.isCompleted ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}

                <div className="flex items-start gap-4">
                  {/* Icône de statut */}
                  <div
                    className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      step.isCompleted
                        ? "bg-green-500 border-green-600 text-white"
                        : step.isCurrent
                        ? "bg-orange-500 border-orange-600 text-white animate-pulse"
                        : "bg-gray-200 border-gray-300 text-gray-400"
                    }`}
                  >
                    {step.isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : step.isCurrent ? (
                      <Clock className="w-6 h-6" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-current" />
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{step.emoji}</span>
                      <h4
                        className={`font-bold text-lg ${
                          step.isCompleted
                            ? "text-green-700"
                            : step.isCurrent
                            ? "text-orange-700"
                            : "text-gray-500"
                        }`}
                      >
                        {step.label}
                      </h4>
                      {step.isCurrent && (
                        <Badge variant="default" size="sm" className="bg-orange-500 text-white">
                          En cours
                        </Badge>
                      )}
                    </div>

                    {step.date && (
                      <p className="text-sm text-gray-600 mb-1">
                        {new Date(step.date).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}

                    {step.change_reason && (
                      <p className="text-xs text-gray-500 italic mt-1">
                        {step.change_reason}
                      </p>
                    )}

                    {!step.date && !step.isCompleted && (
                      <p className="text-xs text-gray-400 italic mt-1">
                        En attente...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
