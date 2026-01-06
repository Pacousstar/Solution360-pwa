import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Crée un client Supabase serveur pour les opérations storage
 */
async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

/**
 * Upload un fichier livrable vers Supabase Storage avec validation sécurité
 * @param requestId - ID de la demande
 * @param userId - ID du propriétaire de la demande
 * @param file - Fichier à uploader
 * @returns Données du fichier uploadé + URL signée
 */
export async function uploadDeliverable(
  requestId: string,
  userId: string,
  file: File
) {
  const supabase = await getSupabaseClient();

  // ✅ VALIDATION SÉCURITÉ
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
    "image/png",
    "image/jpeg",
    "video/mp4",
  ];

  if (file.size > maxSize) {
    throw new Error("Fichier trop volumineux (max 50MB)");
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `Type de fichier non autorisé. Formats acceptés : PDF, ZIP, PNG, JPG, MP4`
    );
  }

  // ✅ NOM SÉCURISÉ (évite injection path traversal)
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${userId}/${requestId}/${timestamp}_${safeName}`;

  // ✅ UPLOAD VERS BUCKET
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("deliverables")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("❌ Storage upload error:", uploadError);
    throw new Error("Impossible de télécharger le fichier");
  }

  console.log("✅ Fichier uploadé:", uploadData.path);

  // ✅ GÉNÉRER URL SIGNÉE (7 jours de validité)
  const { data: signedData, error: signedError } = await supabase.storage
    .from("deliverables")
    .createSignedUrl(uploadData.path, 60 * 60 * 24 * 7);

  if (signedError) {
    console.error("❌ Signed URL error:", signedError);
    throw new Error("Impossible de générer le lien de téléchargement");
  }

  // ✅ ENREGISTRER EN BASE DE DONNÉES
  const { error: dbError } = await supabase.from("deliverables").insert({
    request_id: requestId,
    file_name: safeName,
    file_path: uploadData.path,
    file_size: file.size,
    mime_type: file.type,
    uploaded_by: (await supabase.auth.getUser()).data.user?.id,
  });

  if (dbError) {
    console.error("❌ DB insert error:", dbError);
    // Rollback : supprimer le fichier uploadé
    await supabase.storage.from("deliverables").remove([uploadData.path]);
    throw new Error("Erreur lors de l'enregistrement en base");
  }

  return {
    path: uploadData.path,
    signedUrl: signedData.signedUrl,
    fileName: safeName,
  };
}

/**
 * Supprime un fichier du storage et de la base
 * @param filePath - Chemin du fichier dans le bucket
 */
export async function deleteDeliverable(filePath: string) {
  const supabase = await getSupabaseClient();

  try {
    // Supprimer de la DB
    const { error: dbError } = await supabase
      .from("deliverables")
      .delete()
      .eq("file_path", filePath);

    if (dbError) {
      console.error("❌ DB delete error:", dbError);
    }

    // Supprimer du storage
    const { error: storageError } = await supabase.storage
      .from("deliverables")
      .remove([filePath]);

    if (storageError) {
      console.error("❌ Storage delete error:", storageError);
      throw new Error("Impossible de supprimer le fichier");
    }

    console.log("✅ Fichier supprimé:", filePath);
  } catch (error) {
    console.error("❌ Delete error:", error);
    throw error;
  }
}

/**
 * Liste tous les livrables d'une demande
 * @param requestId - ID de la demande
 */
export async function listDeliverables(requestId: string) {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("deliverables")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ List deliverables error:", error);
    throw error;
  }

  return data || [];
}
