import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin/permissions";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const request_id = searchParams.get("request_id");

    if (!request_id) {
      return NextResponse.json(
        { error: "request_id est requis" },
        { status: 400 }
      );
    }

    // Vérifier que la demande existe
    const { data: demande, error: demandeError } = await supabase
      .from("requests")
      .select("id, user_id")
      .eq("id", request_id)
      .single();

    if (demandeError || !demande) {
      return NextResponse.json(
        { error: "Demande non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier les permissions
    const isUserAdmin = await isAdmin(user.id);
    if (!isUserAdmin && demande.user_id !== user.id) {
      return NextResponse.json(
        { error: "Vous n'avez pas accès à cette demande" },
        { status: 403 }
      );
    }

    // Récupérer les messages
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("request_id", request_id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      logger.error("Erreur lors de la récupération des messages", {
        error: messagesError,
        request_id,
      });
      return NextResponse.json(
        { error: "Erreur lors de la récupération des messages" },
        { status: 500 }
      );
    }

    // Récupérer les informations des expéditeurs
    const senderIds = [...new Set(messages?.map((m) => m.sender_id) || [])];
    const { data: users } = await supabase.auth.admin.listUsers();

    const messagesWithSenders = messages?.map((message) => {
      const sender = users?.users.find((u: any) => u.id === message.sender_id);
      return {
        ...message,
        sender_email: sender?.email || "",
        sender_name:
          sender?.user_metadata?.full_name ||
          sender?.email?.split("@")[0] ||
          "Utilisateur",
      };
    });

    return NextResponse.json({
      ok: true,
      messages: messagesWithSenders || [],
    });
  } catch (error: any) {
    logger.error("Erreur serveur lors de la récupération des messages", {
      error: error.message,
    });
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
