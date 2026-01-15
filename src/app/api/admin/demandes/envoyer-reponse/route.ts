import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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

    const { requestId, adminResponse, clientEmail, clientName } = await request.json();

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

    // TODO: Envoyer email
    console.log('📧 Réponse email:', {
      to: clientEmail,
      subject: 'Réponse à votre demande Solution360',
      body: `Bonjour ${clientName},\n\n${adminResponse}\n\nCordialement,\nL'équipe Solution360`
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Erreur envoyer-reponse:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
