// lib/payments.ts
export interface PaymentResponse {
    success: boolean;
    url?: string;
    error?: string;
  }
  
  // 1️⃣ WAVE API (recommandé)
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
      return {
        success: true,
        url: data.checkout_url
      } as PaymentResponse;
    } catch (error) {
      return {
        success: false,
        error: 'Erreur Wave'
      } as PaymentResponse;
    }
  }
  
  // 2️⃣ CinetPay
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
          customer_phone: '+22507000000', // À récupérer
          customer_email: email,
          description: `Solution360 - ${requestId}`,
          notify_url: `${process.env.NEXT_PUBLIC_URL}/api/payment/cinetpay-callback`
        })
      });
  
      const data = await response.json();
      return {
        success: true,
        url: data.data.payment_url
      } as PaymentResponse;
    } catch (error) {
      return {
        success: false,
        error: 'Erreur CinetPay'
      } as PaymentResponse;
    }
  }
  