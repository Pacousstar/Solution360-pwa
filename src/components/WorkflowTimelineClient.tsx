"use client";

import { useState, useEffect } from "react";
import WorkflowTimeline from "./WorkflowTimeline";

interface WorkflowTimelineClientProps {
  requestId: string;
  currentStatus: string;
}

export default function WorkflowTimelineClient({
  requestId,
  currentStatus,
}: WorkflowTimelineClientProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`/api/admin/status-history?request_id=${requestId}`);
        const data = await response.json();

        if (data.ok && data.history) {
          setEvents(
            data.history.map((h: any) => ({
              id: h.id,
              status: h.status,
              label: h.status,
              date: h.date,
              changed_by: h.changed_by,
              change_reason: h.change_reason,
              isCompleted: true,
              isCurrent: h.status === currentStatus,
            }))
          );
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'historique:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [requestId, currentStatus]);

  if (loading) {
    return null;
  }

  return <WorkflowTimeline currentStatus={currentStatus} events={events} requestId={requestId} />;
}
