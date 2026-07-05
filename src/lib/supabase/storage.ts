import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";

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

export async function uploadDeliverable(
  requestId: string,
  userId: string,
  adminId: string,
  file: File
) {
  const supabase = await getSupabaseClient();

  const maxSize = 50 * 1024 * 1024;
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

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${userId}/${requestId}/${timestamp}_${safeName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("deliverables")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    logger.error("Storage upload error:", uploadError);
    throw new Error("Impossible de télécharger le fichier");
  }

  const { data: publicUrlData } = supabase.storage
    .from("deliverables")
    .getPublicUrl(filePath);

  const fileUrl = publicUrlData.publicUrl;

  const { error: dbError } = await supabase.from("deliverables").insert({
    request_id: requestId,
    title: file.name,
    description: `Livrable uploadé le ${new Date().toLocaleDateString("fr-FR")}`,
    file_url: fileUrl,
    file_path: uploadData.path,
    file_type: file.type,
    uploaded_by: adminId,
  });

  if (dbError) {
    await supabase.storage.from("deliverables").remove([filePath]);
    logger.error("DB insert error:", dbError);
    throw new Error("Erreur lors de l'enregistrement en base");
  }

  return { path: uploadData.path, fileUrl, fileName: safeName };
}

export async function deleteDeliverable(id: string) {
  const supabase = await getSupabaseClient();

  const { data: row } = await supabase
    .from("deliverables")
    .select("file_path")
    .eq("id", id)
    .single();

  const { error: dbError } = await supabase
    .from("deliverables")
    .delete()
    .eq("id", id);

  if (dbError) {
    logger.error("DB delete error:", dbError);
    throw new Error("Impossible de supprimer l'entrée en base");
  }

  if (row?.file_path) {
    const { error: storageError } = await supabase.storage
      .from("deliverables")
      .remove([row.file_path]);

    if (storageError) {
      logger.error("Storage delete error:", storageError);
    }
  }

  logger.log("Fichier supprimé:", id);
}

export async function listDeliverables(requestId: string) {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("deliverables")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("List deliverables error:", error);
    throw error;
  }

  return data || [];
}
