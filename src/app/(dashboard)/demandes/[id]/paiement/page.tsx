'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardBody, CardHeader, CardTitle, Button, Input, Alert } from '@/components/ui';
import { ArrowLeft, CreditCard, Smartphone, Loader2 } from 'lucide-react';
import Link from 'next/link';

type RequestRow = {
  id: string;
  user_id: string;
  title: string;
  final_price: number | null;
  status: string | null;
};

type AnalysisRow = {
  estimated_price_fcfa: number | null;
  price_justification: string | null;
};

export default function PaiementPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState<RequestRow | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisRow | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'cinetpay' | null>(null);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        // Charger la demande
        const { data: demande, error: demandeError } = await supabase
          .from('requests')
          .select('id, user_id, title, final_price, status')
          .eq('id', requestId)
          .single();

        if (demandeError || !demande) {
          setError('Demande introuvable');
          setLoading(false);
          return;
        }

        // Vérifier que l'utilisateur est le propriétaire
        if (demande.user_id !== user.id) {
          setError('Accès non autorisé');
          setLoading(false);
          return;
        }

        // Vérifier le statut
        if (demande.status !== 'awaiting_payment') {
          setError('Cette demande n\'est pas en attente de paiement');
          setLoading(false);
          return;
        }

        setRequest(demande);

        // Charger l'analyse pour la justification du prix
        const { data: analyse } = await supabase
          .from('ai_analyses')
          .select('estimated_price_fcfa, price_justification')
          .eq('request_id', requestId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (analyse) {
          setAnalysis(analyse);
        }

        // Charger le profil pour le téléphone
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', user.id)
          .single();

        if (profile?.phone) {
          setPhone(profile.phone);
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement');
        setLoading(false);
      }
    }

    loadData();
  }, [requestId, router]);

  const handleSubmit = async () => {
    if (!paymentMethod) {
      setError('Veuillez sélectionner une méthode de paiement');
      return;
    }

    if (paymentMethod === 'wave' && !phone) {
      setError('Numéro de téléphone requis pour Wave');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          paymentMethod,
          phone: phone || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'initiation du paiement');
      }

      if (data.payment_url) {
        // Rediriger vers la page de paiement
        window.location.href = data.payment_url;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'initiation du paiement');
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'Non défini';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardBody className="p-6">
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
            <Link href={`/demandes/${requestId}`}>
              <Button variant="primary" className="w-full">
                Retour à la demande
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  const finalPrice = request?.final_price || analysis?.estimated_price_fcfa || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/demandes/${requestId}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la demande
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Paiement</h1>
          <p className="text-sm text-gray-600 mt-1">
            Projet : {request?.title}
          </p>
        </div>

        {/* Prix et justification */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-gray-600">Montant à payer</span>
                <span className="text-2xl font-bold text-orange-600">
                  {formatPrice(finalPrice)}
                </span>
              </div>

              {analysis?.price_justification && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Justification du tarif
                  </h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {analysis.price_justification}
                  </p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Méthodes de paiement */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Choisissez votre méthode de paiement</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {/* Wave */}
              <button
                type="button"
                onClick={() => setPaymentMethod('wave')}
                className={`w-full p-4 border-2 rounded-lg transition-all text-left ${paymentMethod === 'wave'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${paymentMethod === 'wave' ? 'bg-orange-500' : 'bg-gray-200'
                    }`}>
                    <Smartphone className={`w-5 h-5 ${paymentMethod === 'wave' ? 'text-white' : 'text-gray-600'
                      }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Wave</h3>
                    <p className="text-xs text-gray-600">Mobile Money (Orange Money, MTN, Moov)</p>
                  </div>
                  {paymentMethod === 'wave' && (
                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </button>

              {/* CinetPay */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cinetpay')}
                className={`w-full p-4 border-2 rounded-lg transition-all text-left ${paymentMethod === 'cinetpay'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${paymentMethod === 'cinetpay' ? 'bg-orange-500' : 'bg-gray-200'
                    }`}>
                    <CreditCard className={`w-5 h-5 ${paymentMethod === 'cinetpay' ? 'text-white' : 'text-gray-600'
                      }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">CinetPay</h3>
                    <p className="text-xs text-gray-600">Mobile Money + Cartes bancaires</p>
                  </div>
                  {paymentMethod === 'cinetpay' && (
                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </button>
            </div>

            {/* Champ téléphone pour Wave */}
            {paymentMethod === 'wave' && (
              <div className="mt-4">
                <Input
                  label="Numéro de téléphone"
                  type="tel"
                  placeholder="+225 07 00 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Le numéro associé à votre compte Wave
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Messages d'erreur/succès */}
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-4">
            {success}
          </Alert>
        )}

        {/* Bouton de soumission */}
        <div className="flex gap-3">
          <Link href={`/demandes/${requestId}`} className="flex-1">
            <Button variant="secondary" className="w-full">
              Annuler
            </Button>
          </Link>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={handleSubmit}
            disabled={submitting || !paymentMethod}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              'Payer maintenant'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
