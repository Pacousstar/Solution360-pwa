import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin/permissions';
import { isValidUUID, isValidStatus, validateTextLength, sanitizeString, checkRateLimit } from '@/lib/security';
import { logger } from '@/lib/logger';
import { sendEmail, getDeliveryEmailTemplate } from '@/lib/emails';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier les permissions admin (fonction centralisée)
    const adminStatus = await isAdmin(user.id, user.email || undefined);
    if (!adminStatus) {
      logger.warn(`Tentative d'accès non autorisé: ${user.email}`);
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitKey = `changer-statut:${user.id}`;
    if (!checkRateLimit(rateLimitKey, 20, 60000)) { // 20 requêtes par minute
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez patienter.' },
        { status: 429 }
      );
    }

    const { requestId, oldStatus, newStatus, changeReason, changedBy, clientEmail } = await request.json();

    // Validation de sécurité
    if (!isValidUUID(requestId)) {
      return NextResponse.json({ error: 'requestId invalide' }, { status: 400 });
    }

    if (!isValidStatus(newStatus)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    if (!validateTextLength(changeReason || '', 0, 500)) {
      return NextResponse.json({ error: 'Raison trop longue (max 500 caractères)' }, { status: 400 });
    }

    // Sanitization
    const sanitizedReason = sanitizeString(changeReason || '');

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
      change_reason: sanitizedReason,
      changed_by: user.id // Utiliser user.id au lieu de changedBy pour sécurité
    });

    // Note admin
    await supabase.from('admin_notes').insert({
      request_id: requestId,
      admin_user_id: user.id,
      note_type: 'internal',
      content: `Statut changé : ${oldStatus} → ${newStatus}. Raison : ${sanitizedReason}`
    });

    // Notification email si statut = delivered
    if (newStatus === 'delivered') {
      // Récupérer les infos de la demande pour l'email
      const { data: demande } = await supabase
        .from('requests')
        .select('id, title, user_id')
        .eq('id', requestId)
        .single();

      if (demande) {
        // Récupérer les infos utilisateur
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', demande.user_id)
          .single();

        const { data: userData } = await supabase.auth.admin.getUserById(demande.user_id);

        const clientName = profile?.full_name || userData?.user?.email?.split('@')[0] || 'Client';
        const clientEmailToSend = profile?.email || userData?.user?.email || clientEmail;

        if (clientEmailToSend) {
          let baseUrl = process.env.NEXT_PUBLIC_URL || 'https://solution360.app';
          if (baseUrl && !baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`;
          }

          const emailHtml = getDeliveryEmailTemplate({
            clientName,
            requestTitle: demande.title || 'Votre projet',
            requestId: demande.id,
            baseUrl,
          });

          const emailResult = await sendEmail({
            to: clientEmailToSend,
            subject: '🎉 Votre projet est livré ! - Solution360°',
            html: emailHtml,
          });

          if (!emailResult.success) {
            logger.error('⚠️ Erreur lors de l\'envoi de l\'email de livraison:', emailResult.error);
          } else {
            logger.log('✅ Email de livraison envoyé:', { to: clientEmailToSend, requestId });
          }
        }
      }
    } else {
      logger.log('📧 Notification changement statut:', {
        to: clientEmail,
        statut: newStatus,
        raison: sanitizedReason
      });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    logger.error('Erreur changer-statut:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur. Veuillez réessayer.' 
    }, { status: 500 });
  }
}
