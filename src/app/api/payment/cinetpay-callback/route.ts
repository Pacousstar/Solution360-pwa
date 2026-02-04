import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { sendEmail, getPaymentConfirmationEmailTemplate } from '@/lib/emails';

/**
 * Webhook CinetPay pour confirmer les paiements
 * POST /api/payment/cinetpay-callback
 * 
 * Body (exemple CinetPay):
 * - cpm_trans_id: string
 * - cpm_site_id: string
 * - signature: string
 * - transaction_id: string
 * - status: 'ACCEPTED' | 'REFUSED' | 'CANCELLED'
 * - amount: number
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transaction_id, cpm_trans_id, status, amount } = body;

    logger.log('📥 Webhook CinetPay reçu:', { transaction_id, cpm_trans_id, status });

    // TODO: Vérifier la signature CinetPay
    // const signature = body.signature;
    // if (!verifyCinetPaySignature(body, signature)) {
    //   return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    // }

    if (!transaction_id && !cpm_trans_id) {
      return NextResponse.json(
        { error: 'ID transaction manquant' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Trouver le paiement par provider_id
    const providerId = transaction_id || cpm_trans_id;
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, requests(id, title, user_id, final_price)')
      .or(`payment_provider_id.eq.${providerId},request_id.eq.${body.request_id || ''}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (paymentError || !payment) {
      logger.error('❌ Paiement introuvable:', paymentError);
      return NextResponse.json(
        { error: 'Paiement introuvable' },
        { status: 404 }
      );
    }

    // Mapper le statut CinetPay
    const newStatus = 
      status === 'ACCEPTED' ? 'completed' :
      status === 'REFUSED' ? 'failed' :
      status === 'CANCELLED' ? 'cancelled' : 'pending';

    // Mettre à jour le statut du paiement
    const updateData: any = {
      status: newStatus,
      provider_response: {
        ...(payment.provider_response || {}),
        cinetpay_callback: body,
      },
    };

    if (newStatus === 'completed') {
      updateData.completed_at = new Date().toISOString();
      updateData.payment_provider_id = providerId;
    }

    const { error: updateError } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', payment.id);

    if (updateError) {
      logger.error('❌ Erreur mise à jour paiement:', updateError);
      return NextResponse.json(
        { error: 'Erreur mise à jour' },
        { status: 500 }
      );
    }

    // Si paiement confirmé, mettre à jour le statut de la demande
    if (newStatus === 'completed' && payment.requests) {
      const request = payment.requests as any;
      
      // Mettre à jour le statut de la demande
      await supabase
        .from('requests')
        .update({ status: 'in_production' })
        .eq('id', payment.request_id);

      // Récupérer les infos utilisateur pour l'email
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const adminSupabase = createAdminClient();
      const { data: userData } = await adminSupabase.auth.admin.getUserById(request.user_id);
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', request.user_id)
        .single();

      const clientName = profile?.full_name || userData?.user?.email?.split('@')[0] || 'Client';
      const clientEmail = profile?.email || userData?.user?.email || '';

      // Envoyer email de confirmation
      if (clientEmail) {
        const emailHtml = getPaymentConfirmationEmailTemplate({
          clientName,
          requestTitle: request.title || 'Votre projet',
          amount: payment.amount,
          requestId: payment.request_id,
        });

        await sendEmail({
          to: clientEmail,
          subject: '✅ Paiement confirmé - Solution360°',
          html: emailHtml,
        });
      }

      logger.log('✅ Paiement confirmé et demande mise à jour:', {
        paymentId: payment.id,
        requestId: payment.request_id,
      });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    logger.error('❌ Erreur webhook CinetPay:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
