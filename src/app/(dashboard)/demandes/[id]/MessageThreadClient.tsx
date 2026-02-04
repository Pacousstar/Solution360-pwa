"use client";

import { useEffect, useState } from "react";
import MessageThread from "@/components/MessageThread";
import { createClient } from "@/lib/supabase/client";

interface MessageThreadClientProps {
  requestId: string;
}

export default function MessageThreadClient({ requestId }: MessageThreadClientProps) {
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
      setLoading(false);
    };
    getCurrentUser();
  }, []);

  if (loading) {
    return null;
  }

  if (!currentUserId) {
    return null;
  }

  return (
    <div className="h-[600px]">
      <MessageThread
        requestId={requestId}
        currentUserId={currentUserId}
        isAdmin={false}
      />
    </div>
  );
}
