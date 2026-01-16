import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendEmail, getQuoteEmailTemplate } from '@/lib/emails';

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

    // 3. Récupérer les données
    const { requestId, finalPrice, priceJustification, clientEmail, clientName, requestTitle } = await request.json();

    // 4. Mettre à jour la demande
    const { error: updateError } = await supabase
      .from('requests')
      .update({
        final_price: finalPrice,
        price_justification: priceJustification,
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
      content: `Devis envoyé : ${finalPrice.toLocaleString()} FCFA - ${priceJustification.substring(0, 100)}...`
    });

    // 7. Envoyer l'email au client
    let baseUrl = process.env.NEXT_PUBLIC_URL || 'https://solution360.app';
    // Ajouter https:// si manquant
    if (baseUrl && !baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`;
    }
    const emailHtml = getQuoteEmailTemplate({
      clientName,
      requestTitle,
      finalPrice,
      priceJustification,
      requestId,
      baseUrl,
    });

    const emailResult = await sendEmail({
      to: clientEmail,
      subject: `Devis pour votre projet : ${requestTitle}`,
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.error('⚠️ Erreur lors de l\'envoi de l\'email:', emailResult.error);
      // Ne pas bloquer la réponse si l'email échoue
    }

    return NextResponse.json({ 
      success: true,
      message: 'Devis envoyé avec succès'
    });

  } catch (error: any) {
    console.error('Erreur envoyer-devis:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur serveur' 
    }, { status: 500 });
  }
}
