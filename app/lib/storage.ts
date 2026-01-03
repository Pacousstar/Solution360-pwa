import { createSupabaseServerClient } from './supabase-server';

/**
 * Upload un fichier vers Supabase Storage
 */
export async function uploadDeliverableToStorage(
  requestId: string,
  file: File,
  fileType: string
) {
  const supabase = await createSupabaseServerClient();

  try {
    const timestamp = Date.now();
    const fileName = `${requestId}/${timestamp}-${file.name}`;

    const { data, error: uploadError } = await supabase.storage
      .from('deliverables')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('❌ Storage upload error:', uploadError);
      throw new Error('Impossible de télécharger le fichier');
    }

    console.log('✅ Fichier uploadé:', data.path);

    // Générer URL signée (7 jours)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('deliverables')
      .createSignedUrl(data.path, 60 * 60 * 24 * 7);

    if (signedError) {
      console.error('❌ Signed URL error:', signedError);
      throw new Error('Impossible de générer le lien');
    }

    return {
      path: data.path,
      signedUrl: signedData.signedUrl,
      fileName: file.name,
    };
  } catch (error) {
    console.error('❌ Storage upload error:', error);
    throw error;
  }
}

/**
 * Supprime un fichier du Supabase Storage
 */
export async function deleteDeliverableFromStorage(filePath: string) {
  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase.storage
      .from('deliverables')
      .remove([filePath]);

    if (error) {
      console.error('❌ Storage delete error:', error);
      throw new Error('Impossible de supprimer le fichier');
    }

    console.log('✅ Fichier supprimé');
  } catch (error) {
    console.error('❌ Storage delete error:', error);
    throw error;
  }
}
