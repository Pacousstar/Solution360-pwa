import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { request_ids } = body;

    if (!request_ids || !Array.isArray(request_ids)) {
      return NextResponse.json(
        { error: "request_ids est requis (tableau)" },
        { status: 400 }
      );
    }

    if (request_ids.length === 0) {
      return NextResponse.json({
        ok: true,
        counts: {},
      });
    }

    // Récupérer le nombre de messages non lus pour chaque demande
    // (messages envoyés par d'autres utilisateurs, non lus)
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("request_id")
      .in("request_id", request_ids)
      .eq("is_read", false)
      .neq("sender_id", user.id);

    if (messagesError) {
      logger.error("Erreur lors de la récupération des messages non lus", {
        error: messagesError,
      });
      return NextResponse.json(
        { error: "Erreur lors de la récupération" },
        { status: 500 }
      );
    }

    // Compter par request_id
    const counts: Record<string, number> = {};
    request_ids.forEach((id: string) => {
      counts[id] = 0;
    });

    messages?.forEach((message) => {
      if (counts[message.request_id] !== undefined) {
        counts[message.request_id]++;
      }
    });

    return NextResponse.json({
      ok: true,
      counts,
    });
  } catch (error: any) {
    logger.error("Erreur serveur lors du comptage des messages non lus", {
      error: error.message,
    });
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
