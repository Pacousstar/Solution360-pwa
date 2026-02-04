"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/Toast";
import { MessageSquare } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  sender_type: "client" | "admin";
  content: string;
  created_at: string;
}

interface UseMessageNotificationsProps {
  requestId: string;
  currentUserId: string;
  messages: Message[];
  enabled?: boolean;
}

/**
 * Hook pour détecter et notifier les nouveaux messages
 */
export function useMessageNotifications({
  requestId,
  currentUserId,
  messages,
  enabled = true,
}: UseMessageNotificationsProps) {
  const { showToast, ToastContainer } = useToast();
  const previousMessagesRef = useRef<Set<string>>(new Set());
  const lastCheckRef = useRef<Date>(new Date());

  useEffect(() => {
    if (!enabled || messages.length === 0) return;

    // Initialiser avec les messages existants
    if (previousMessagesRef.current.size === 0) {
      messages.forEach((msg) => previousMessagesRef.current.add(msg.id));
      return;
    }

    // Détecter les nouveaux messages (pas envoyés par l'utilisateur actuel)
    const newMessages = messages.filter(
      (msg) =>
        !previousMessagesRef.current.has(msg.id) &&
        msg.sender_id !== currentUserId &&
        new Date(msg.created_at) > lastCheckRef.current
    );

    // Afficher une notification pour chaque nouveau message
    newMessages.forEach((msg) => {
      const senderType = msg.sender_type === "admin" ? "Admin" : "Client";
      showToast(
        `💬 Nouveau message de ${senderType}`,
        "info"
      );
    });

    // Mettre à jour les références
    messages.forEach((msg) => previousMessagesRef.current.add(msg.id));
    lastCheckRef.current = new Date();
  }, [messages, currentUserId, enabled, showToast]);

  return { ToastContainer };
}
