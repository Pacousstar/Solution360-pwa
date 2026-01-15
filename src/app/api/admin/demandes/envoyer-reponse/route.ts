import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendEmail, getResponseEmailTemplate } from '@/lib/emails';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile || !profile.is_admin) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    const { requestId, adminResponse, clientEmail, clientName, requestTitle } = await request.json();

    // Mettre à jour la demande
    const { error: updateError } = await supabase
      .from('requests')
      .update({
        admin_response: adminResponse,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // Ajouter note visible par le client
    await supabase.from('admin_notes').insert({
      request_id: requestId,
      admin_user_id: user.id,
      note_type: 'client_visible',
      content: adminResponse
    });

    // Récupérer le titre de la demande si pas fourni
    let title = requestTitle;
    if (!title) {
      const { data: demande } = await supabase
        .from('requests')
        .select('title')
        .eq('id', requestId)
        .single();
      title = demande?.title || 'Votre demande';
    }

    // Envoyer email au client
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://solution360.app';
    const emailHtml = getResponseEmailTemplate({
      clientName,
      adminResponse,
      requestTitle: title,
      requestId,
      baseUrl,
    });

    const emailResult = await sendEmail({
      to: clientEmail,
      subject: 'Réponse à votre demande Solution360°',
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.error('⚠️ Erreur lors de l\'envoi de l\'email:', emailResult.error);
      // Ne pas bloquer la réponse si l'email échoue
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Erreur envoyer-reponse:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
