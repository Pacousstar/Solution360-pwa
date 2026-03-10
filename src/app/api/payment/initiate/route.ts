import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin/permissions';
import { checkRateLimit } from '@/lib/security';
import { createWavePayment, createCinetPay } from '@/lib/payments';
import { logger } from '@/lib/logger';

/**
 * Route API pour initier un paiement
 * POST /api/payment/initiate
 * 
 * Body:
 * - requestId: string (UUID)
 * - paymentMethod: 'wave' | 'cinetpay'
 * - phone?: string (pour Wave)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Rate limiting basé sur l'ID utilisateur
    if (!checkRateLimit(`payment:${user.id}`, 3, 60000)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer plus tard.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { requestId, paymentMethod, phone } = body;

    // Validation
    if (!requestId || typeof requestId !== 'string') {
      return NextResponse.json(
        { error: 'requestId requis' },
        { status: 400 }
      );
    }

    if (!paymentMethod || !['wave', 'cinetpay'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Méthode de paiement invalide. Utilisez "wave" ou "cinetpay"' },
        { status: 400 }
      );
    }

    // Récupérer la demande
    const { data: demande, error: demandeError } = await supabase
      .from('requests')
      .select('id, user_id, title, final_price, status')
      .eq('id', requestId)
      .single();

    if (demandeError || !demande) {
      logger.error('Erreur récupération demande:', demandeError);
      return NextResponse.json(
        { error: 'Demande introuvable' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (demande.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    // Vérifier que le statut est awaiting_payment
    if (demande.status !== 'awaiting_payment') {
      return NextResponse.json(
        { error: 'Cette demande n\'est pas en attente de paiement' },
        { status: 400 }
      );
    }

    // Vérifier que final_price existe
    if (!demande.final_price || demande.final_price <= 0) {
      return NextResponse.json(
        { error: 'Prix final non défini' },
        { status: 400 }
      );
    }

    // Récupérer le profil utilisateur pour email/nom
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .single();

    const userEmail = user.email || profile?.email || '';
    const userName = profile?.full_name || userEmail.split('@')[0] || 'Client';
    const userPhone = phone || profile?.phone || '';

    // Vérifier téléphone pour Wave
    if (paymentMethod === 'wave' && !userPhone) {
      return NextResponse.json(
        { error: 'Numéro de téléphone requis pour Wave' },
        { status: 400 }
      );
    }

    // Créer l'enregistrement de paiement dans la base
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        request_id: requestId,
        user_id: user.id,
        amount: demande.final_price,
        currency: 'XOF',
        payment_method: paymentMethod,
        status: 'pending',
      })
      .select()
      .single();

    if (paymentError || !payment) {
      logger.error('Erreur création paiement:', paymentError);
      return NextResponse.json(
        { error: 'Erreur lors de la création du paiement' },
        { status: 500 }
      );
    }

    // Créer le paiement selon le provider
    let paymentUrl: string;
    let providerId: string | undefined;

    if (paymentMethod === 'wave') {
      const wavePayment = await createWavePayment(
        demande.final_price,
        requestId,
        userPhone
      );

      if (!wavePayment.success || !wavePayment.url) {
        // Mettre à jour le statut du paiement en failed
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('id', payment.id);

        return NextResponse.json(
          { error: wavePayment.error || 'Erreur lors de la création du paiement Wave' },
          { status: 500 }
        );
      }

      paymentUrl = wavePayment.url;
      // TODO: Extraire provider_id de la réponse Wave si disponible

    } else if (paymentMethod === 'cinetpay') {
      const cinetPayment = await createCinetPay(
        demande.final_price,
        requestId,
        userName,
        userEmail
      );

      if (!cinetPayment.success || !cinetPayment.url) {
        // Mettre à jour le statut du paiement en failed
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('id', payment.id);

        return NextResponse.json(
          { error: cinetPayment.error || 'Erreur lors de la création du paiement CinetPay' },
          { status: 500 }
        );
      }

      paymentUrl = cinetPayment.url;
      // TODO: Extraire provider_id de la réponse CinetPay si disponible
    } else {
      return NextResponse.json(
        { error: 'Méthode de paiement non supportée' },
        { status: 400 }
      );
    }

    // Mettre à jour le paiement avec l'URL et la réponse du provider
    await supabase
      .from('payments')
      .update({
        provider_response: { payment_url: paymentUrl },
        payment_provider_id: providerId,
      })
      .eq('id', payment.id);

    logger.log('✅ Paiement initié avec succès:', { paymentId: payment.id, method: paymentMethod });

    return NextResponse.json({
      success: true,
      payment_url: paymentUrl,
      payment_id: payment.id,
    });

  } catch (error: any) {
    logger.error('❌ Erreur initiate payment:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
