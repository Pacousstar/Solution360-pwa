"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardBody, CardHeader, CardTitle, Button, Input, Alert } from "@/components/ui";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { useMessageNotifications } from "@/hooks/useMessageNotifications";
import { createClient } from "@/lib/supabase/client";

// Fonction simple pour formater la date relative
function formatRelativeTime(date: string): string {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);

  if (diffInSeconds < 60) return "à l'instant";
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `il y a ${hours} heure${hours > 1 ? "s" : ""}`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `il y a ${days} jour${days > 1 ? "s" : ""}`;
  }

  // Pour les dates plus anciennes, afficher la date complète
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(messageDate);
}

interface Message {
  id: string;
  request_id: string;
  sender_id: string;
  sender_type: "client" | "admin";
  content: string;
  is_read: boolean;
  created_at: string;
  sender_email?: string;
  sender_name?: string;
}

interface MessageThreadProps {
  requestId: string;
  currentUserId: string;
  isAdmin: boolean;
}

export default function MessageThread({
  requestId,
  currentUserId,
  isAdmin,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger les messages
  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/messages/get?request_id=${requestId}`);
      const data = await response.json();

      if (data.ok) {
        setMessages(data.messages || []);
        setError(null);

        // Marquer les nouveaux messages comme lus
        const unreadMessages = data.messages.filter(
          (m: Message) => !m.is_read && m.sender_id !== currentUserId
        );

        if (unreadMessages.length > 0) {
          await fetch("/api/messages/mark-read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              request_id: requestId,
            }),
          });
        }
      } else {
        setError(data.error || "Erreur lors du chargement des messages");
      }
    } catch (err: any) {
      setError("Erreur de connexion");
      console.error("Erreur lors du chargement des messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // Envoyer un message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: requestId,
          content: newMessage.trim(),
        }),
      });

      const data = await response.json();

      if (data.ok) {
        setNewMessage("");
        await loadMessages(); // Recharger les messages
      } else {
        setError(data.error || "Erreur lors de l'envoi du message");
      }
    } catch (err: any) {
      setError("Erreur de connexion lors de l'envoi");
      console.error("Erreur lors de l'envoi du message:", err);
    } finally {
      setSending(false);
    }
  };

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Charger les messages au montage et configurer le Realtime
  useEffect(() => {
    loadMessages();

    const supabase = createClient();
    const channel = supabase
      .channel(`room:${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `request_id=eq.${requestId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;

          // Si c'est notre propre message, il est déjà géré par handleSendMessage (ou sera rechargé)
          // Mais pour plus de fluidité, on recharge tout pour avoir les infos sender
          await loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  // Notifications pour nouveaux messages
  const { ToastContainer } = useMessageNotifications({
    requestId,
    currentUserId,
    messages,
    enabled: true,
  });

  if (loading) {
    return (
      <Card>
        <CardBody className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
          <p className="mt-4 text-gray-600">Chargement des messages...</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <ToastContainer />
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              Messagerie
            </CardTitle>
          </div>
        </CardHeader>

        <CardBody className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Zone de messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucun message pour le moment.</p>
                <p className="text-sm mt-2">Soyez le premier à envoyer un message !</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.sender_id === currentUserId;
                const isFromAdmin = message.sender_type === "admin";

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${isOwnMessage
                        ? isFromAdmin
                          ? "bg-orange-500 text-white"
                          : "bg-green-500 text-white"
                        : "bg-white border border-gray-200 text-gray-900"
                        }`}
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <span
                          className={`text-xs font-semibold ${isOwnMessage ? "text-white/90" : "text-gray-600"
                            }`}
                        >
                          {message.sender_name || "Utilisateur"}
                          {isFromAdmin && " (Admin)"}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <div
                        className={`text-xs mt-2 ${isOwnMessage ? "text-white/70" : "text-gray-400"
                          }`}
                      >
                        {formatRelativeTime(message.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="border-t bg-white p-4">
            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Tapez votre message..."
                className="flex-1"
                disabled={sending}
              />
              <Button
                variant="primary"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                rightIcon={sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              >
                {sending ? "Envoi..." : "Envoyer"}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
