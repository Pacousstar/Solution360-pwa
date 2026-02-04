import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendEmail, getQuoteEmailTemplate } from '@/lib/emails';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // 2. Vérifier les permissions admin (utiliser la fonction centralisée)
    const { isAdmin } = await import('@/lib/admin/permissions');
    const adminStatus = await isAdmin(user.id, user.email || undefined);

    if (!adminStatus) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 });
    }

    // 3. Récupérer et valider les données
    const { requestId, finalPrice, priceJustification, clientEmail, clientName, requestTitle } = await request.json();

    // Validation de sécurité
    const { isValidUUID, isValidPrice, isValidEmail, validateTextLength, sanitizeString, checkRateLimit } = await import('@/lib/security');
    
    // Rate limiting
    const rateLimitKey = `envoyer-devis:${user.id}`;
    if (!checkRateLimit(rateLimitKey, 10, 60000)) { // 10 requêtes par minute
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez patienter.' },
        { status: 429 }
      );
    }

    // Validation
    if (!isValidUUID(requestId)) {
      return NextResponse.json({ error: 'requestId invalide' }, { status: 400 });
    }

    if (!isValidPrice(finalPrice)) {
      return NextResponse.json({ error: 'Prix invalide (0-100000000 FCFA)' }, { status: 400 });
    }

    if (!isValidEmail(clientEmail)) {
      return NextResponse.json({ error: 'Email client invalide' }, { status: 400 });
    }

    if (!validateTextLength(priceJustification || '', 10, 2000)) {
      return NextResponse.json({ error: 'Justification invalide (10-2000 caractères)' }, { status: 400 });
    }

    // Sanitization
    const sanitizedJustification = sanitizeString(priceJustification);
    const sanitizedClientName = sanitizeString(clientName || '');
    const sanitizedTitle = sanitizeString(requestTitle || '');

    // 4. Mettre à jour la demande
    const { error: updateError } = await supabase
      .from('requests')
      .update({
        final_price: finalPrice,
        price_justification: sanitizedJustification,
        status: 'awaiting_payment',
        quote_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // 5. Créer entrée dans l'historique
    await supabase.from('status_history').insert({
      request_id: requestId,
      old_status: 'analysis',
      new_status: 'awaiting_payment',
      change_reason: `Devis envoyé : ${finalPrice.toLocaleString()} FCFA`,
      changed_by: user.id
    });

    // 6. Ajouter note admin
    await supabase.from('admin_notes').insert({
      request_id: requestId,
      admin_user_id: user.id,
      note_type: 'internal',
      content: `Devis envoyé : ${finalPrice.toLocaleString()} FCFA - ${sanitizedJustification.substring(0, 100)}...`
    });

    // 7. Envoyer l'email au client
    let baseUrl = process.env.NEXT_PUBLIC_URL || 'https://solution360.app';
    // Ajouter https:// si manquant
    if (baseUrl && !baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`;
    }
    const emailHtml = getQuoteEmailTemplate({
      clientName: sanitizedClientName,
      requestTitle: sanitizedTitle,
      finalPrice,
      priceJustification: sanitizedJustification,
      requestId,
      baseUrl,
    });

    const emailResult = await sendEmail({
      to: clientEmail,
      subject: `Devis pour votre projet : ${requestTitle}`,
      html: emailHtml,
    });

    if (!emailResult.success) {
      logger.error('⚠️ Erreur lors de l\'envoi de l\'email:', emailResult.error);
      // Ne pas bloquer la réponse si l'email échoue
    }

    return NextResponse.json({ 
      success: true,
      message: 'Devis envoyé avec succès'
    });

  } catch (error: any) {
    logger.error('Erreur envoyer-devis:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur. Veuillez réessayer.' 
    }, { status: 500 });
  }
}
