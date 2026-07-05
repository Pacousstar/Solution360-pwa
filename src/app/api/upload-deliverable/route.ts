import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { isAdmin } from "@/lib/admin/permissions";
import { uploadDeliverable } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("deliverable") as File;
    const request_id = formData.get("request_id") as string;
    const user_id = formData.get("user_id") as string;

    if (!file || !request_id || !user_id) {
      return NextResponse.json(
        { error: "Fichier, request_id et user_id requis" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const adminStatus = await isAdmin(currentUser.id, currentUser.email || undefined);

    if (!adminStatus) {
      logger.warn("Tentative d'upload par non-admin:", currentUser.email);
      return NextResponse.json(
        { error: "Accès réservé aux admins" },
        { status: 403 }
      );
    }

    const result = await uploadDeliverable(request_id, user_id, currentUser.id, file);

    return NextResponse.json(
      {
        success: true,
        message: "Livrable publié avec succès",
        fileUrl: result.fileUrl,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur interne";
    logger.error("Upload error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
