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

    const { requestId, oldStatus, newStatus, changeReason, changedBy, clientEmail } = await request.json();

    // Mettre à jour le statut
    const { error: updateError } = await supabase
      .from('requests')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // Historique (le trigger PostgreSQL le fera aussi, mais on peut le faire manuellement)
    await supabase.from('status_history').insert({
      request_id: requestId,
      old_status: oldStatus,
      new_status: newStatus,
      change_reason: changeReason,
      changed_by: changedBy
    });

    // Note admin
    await supabase.from('admin_notes').insert({
      request_id: requestId,
      admin_user_id: user.id,
      note_type: 'internal',
      content: `Statut changé : ${oldStatus} → ${newStatus}. Raison : ${changeReason}`
    });

    // TODO: Notification email
    console.log('📧 Notification changement statut:', {
      to: clientEmail,
      statut: newStatus,
      raison: changeReason
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Erreur changer-statut:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
