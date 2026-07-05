export interface PaymentResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export function isPaymentConfigured(): { wave: boolean; cinetpay: boolean } {
  return {
    wave: !!process.env.WAVE_API_TOKEN,
    cinetpay: !!process.env.CINETPAY_API_KEY && !!process.env.CINETPAY_SITE_ID,
  };
}

export async function createWavePayment(amount: number, requestId: string, phone: string) {
  try {
    const response = await fetch('https://api.waveapi.io/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WAVE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount,
        currency: 'XOF',
        customer_phone: phone,
        description: `Solution360 - Demande ${requestId}`,
        callback_url: `${process.env.NEXT_PUBLIC_URL}/api/payment/wave-callback`
      })
    });

    const data = await response.json();
    return { success: true, url: data.checkout_url } as PaymentResponse;
  } catch {
    return { success: false, error: 'Erreur Wave' } as PaymentResponse;
  }
}

export async function createCinetPay(amount: number, requestId: string, customerName: string, email: string) {
  try {
    const response = await fetch('https://api.cinetpay.com/v1/payment/initiate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CINETPAY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apikey: process.env.CINETPAY_SITE_ID,
        amount,
        currency: 'XOF',
        customer_name: customerName,
        customer_surname: 'Client',
        customer_phone: '+22507000000',
        customer_email: email,
        description: `Solution360 - ${requestId}`,
        notify_url: `${process.env.NEXT_PUBLIC_URL}/api/payment/cinetpay-callback`
      })
    });

    const data = await response.json();
    return { success: true, url: data.data.payment_url } as PaymentResponse;
  } catch {
    return { success: false, error: 'Erreur CinetPay' } as PaymentResponse;
  }
}

export async function simulatePayment(requestId: string, userId: string, amount: number) {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  await supabase.from('payments').insert({
    request_id: requestId,
    user_id: userId,
    amount,
    currency: 'XOF',
    payment_method: 'simulation',
    status: 'confirmed',
    provider_response: { simulated: true },
  });

  await supabase
    .from('requests')
    .update({ status: 'in_production', updated_at: new Date().toISOString() })
    .eq('id', requestId);

  await supabase.from('status_history').insert({
    request_id: requestId,
    old_status: 'awaiting_payment',
    new_status: 'in_production',
    change_reason: 'Paiement simulé (mode test)',
    changed_by: userId,
  });

  const { data: demande } = await supabase
    .from('requests')
    .select('title, user_id')
    .eq('id', requestId)
    .single();

  if (demande) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    if (profile?.email) {
      const { sendEmail, getPaymentConfirmationEmailTemplate } = await import('@/lib/emails');
      const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://solution360.app';
      const emailHtml = getPaymentConfirmationEmailTemplate({
        clientName: profile.full_name || 'Client',
        requestTitle: demande.title || 'Votre projet',
        amount: amount,
        requestId,
        baseUrl,
      });
      await sendEmail({ to: profile.email, subject: 'Confirmation de paiement (simulation)', html: emailHtml });
    }
  }

  return { success: true, message: 'Paiement simulé avec succès' };
}
  