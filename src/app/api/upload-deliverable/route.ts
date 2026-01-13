import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { isAdmin } from "@/lib/admin/permissions";

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

    // Vérifier la taille (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 50MB)" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Vérifier que l'utilisateur est admin
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin (logique centralisée)
    const adminStatus = await isAdmin(currentUser.id, currentUser.email || undefined);

    if (!adminStatus) {
      logger.warn("❌ Tentative d'upload par non-admin:", currentUser.email);
      return NextResponse.json(
        { error: "Accès réservé aux admins" },
        { status: 403 }
      );
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `${user_id}/${request_id}/${timestamp}-${sanitizedFileName}`;

    // Convertir le fichier en ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("deliverables")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      logger.error("Erreur upload Supabase:", uploadError);
      return NextResponse.json(
        { error: "Erreur lors de l'upload du fichier. Veuillez réessayer." },
        { status: 500 }
      );
    }

    // Construire l'URL publique du fichier
    const { data: publicUrlData } = supabase.storage
      .from("deliverables")
      .getPublicUrl(filePath);

    const fileUrl = publicUrlData.publicUrl;

    // Insérer dans la table deliverables (adapté à votre structure)
    const { error: dbError } = await supabase.from("deliverables").insert({
      request_id,
      title: file.name, // ✅ Nom du fichier comme titre
      description: `Livrable final uploadé le ${new Date().toLocaleDateString("fr-FR")}`,
      file_url: fileUrl, // ✅ URL publique
      file_type: file.type, // ✅ Type MIME
      uploaded_by: currentUser.id,
    });

    if (dbError) {
      logger.error("Erreur insertion DB:", dbError);
      // Supprimer le fichier uploadé si l'insertion échoue
      await supabase.storage.from("deliverables").remove([filePath]);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement. Le fichier a été supprimé." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Livrable publié avec succès",
        fileUrl,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur serveur interne. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
