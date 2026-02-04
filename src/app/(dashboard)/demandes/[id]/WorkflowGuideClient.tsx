"use client";

import { useState, useEffect } from "react";
import WorkflowGuide from "@/components/WorkflowGuide";

interface WorkflowGuideClientProps {
  requestId: string;
  currentStatus: string;
  hasFinalPrice: boolean;
  hasPriceJustification: boolean;
  hasDeliverables: number;
}

export default function WorkflowGuideClient({
  requestId,
  currentStatus,
  hasFinalPrice,
  hasPriceJustification,
  hasDeliverables,
}: WorkflowGuideClientProps) {
  const [hasPayment, setHasPayment] = useState(false);

  useEffect(() => {
    const checkPayment = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: payments } = await supabase
          .from("payments")
          .select("id, status")
          .eq("request_id", requestId)
          .eq("status", "completed")
          .limit(1);

        setHasPayment((payments?.length || 0) > 0);
      } catch (error) {
        console.error("Erreur lors de la vérification du paiement:", error);
      }
    };

    checkPayment();
  }, [requestId]);

  return (
    <WorkflowGuide
      currentStatus={currentStatus}
      requestId={requestId}
      hasFinalPrice={hasFinalPrice}
      hasPriceJustification={hasPriceJustification}
      hasDeliverables={hasDeliverables > 0}
      hasPayment={hasPayment}
      isAdmin={false}
    />
  );
}
