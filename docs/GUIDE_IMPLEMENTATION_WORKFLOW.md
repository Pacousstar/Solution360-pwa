# 📋 GUIDE D'IMPLÉMENTATION - WORKFLOW SOLUTION360°
**Document de synthèse : Ce qui est fait et ce qui reste à faire**

---

## ✅ CE QUI VIENT D'ÊTRE IMPLÉMENTÉ

### **1. SYSTÈME D'ONGLETS ADMIN** ✅ (100%)

La page `/admin/gerer/[id]` dispose maintenant d'un système d'onglets complet :

#### **✅ Onglet "Analyse IA" 🤖**
- Bouton "Lancer l'analyse IA" fonctionnel
- Appel à `/api/analyze-request` (DeepSeek)
- Affichage des résultats :
  - Résumé du besoin
  - Prix estimé en FCFA
  - Liste des livrables proposés
  - Questions de clarification
- Possibilité de relancer l'analyse

#### **✅ Onglet "Tarification" 💰**
- Formulaire pour saisir le prix final (FCFA)
- Champ pour la justification du tarif
- Affichage de l'estimation IA comme référence (si disponible)
- Bouton "Envoyer le devis au client" fonctionnel
- Appel à `/api/admin/demandes/envoyer-devis`
- Validation : prix obligatoire avant `awaiting_payment`
- Changement automatique du statut → `awaiting_payment`

#### **✅ Onglet "Réponse" 💬**
- 3 templates de messages :
  - **"Devis"** : Message de bienvenue avec détails
  - **"Clarification"** : Questions pour préciser le besoin
  - **"Livraison"** : Message de livraison
- Éditeur de message personnalisé
- Bouton "Envoyer la réponse au client" fonctionnel
- Appel à `/api/admin/demandes/envoyer-reponse`

#### **✅ Onglet "Statut" 🎯**
- 4 boutons pour changer le statut :
  - En analyse (`analysis`)
  - Attente paiement (`awaiting_payment`)
  - En production (`in_production`)
  - Livré (`delivered`)
- Validation des règles métier :
  - Impossible de passer à `awaiting_payment` sans prix final

#### **✅ Onglet "Notes" 📝**
- Textarea pour notes admin internes
- Sauvegarde temps réel
- Persistence dans `requests.admin_notes`

#### **✅ Onglet "Livrables" 📦**
- Liste des livrables uploadés
- Upload drag & drop
- Formats acceptés : PDF, ZIP, PNG, JPG, MP4
- Stockage Supabase Storage

---

## ❌ CE QUI RESTE À FAIRE

### **PRIORITÉ 1 - CRITIQUE** 🔴

#### **1. SYSTÈME DE PAIEMENT CLIENT** ❌

**À faire :**
1. **Créer page client de paiement** `/demandes/[id]/paiement`
   - Modal ou page dédiée
   - Sélection mode de paiement :
     - Wave (Mobile Money)
     - CinetPay (Mobile Money + Carte)
     - Stripe (Cartes internationales - optionnel)
   - Affichage du montant et justification
   - Redirection vers page de paiement

2. **Créer route API paiement** `/api/payment/initiate`
   - Récupérer infos client (email, téléphone, nom)
   - Créer transaction dans table `payments` (à créer)
   - Appeler Wave/CinetPay selon choix
   - Retourner URL de paiement

3. **Créer routes webhook** :
   - `/api/payment/wave-callback` (POST)
   - `/api/payment/cinetpay-callback` (POST)
   - `/api/payment/stripe-callback` (POST - optionnel)
   - Actions :
     - Vérifier signature webhook
     - Mettre à jour statut paiement
     - Changer statut demande → `in_production`
     - Envoyer email de confirmation

4. **Modifier page client** `/demandes/[id]/page.tsx`
   - Remplacer bouton "Valider ce devis et passer au paiement" par lien fonctionnel
   - Afficher prix final et justification si statut = `awaiting_payment`
   - Afficher bouton "Payer maintenant" cliquable

#### **2. NOTIFICATIONS EMAIL** ❌

**À faire :**
1. **Configurer Resend** :
   - Créer compte sur https://resend.com
   - Obtenir API Key
   - Vérifier domaine d'envoi
   - Ajouter `RESEND_API_KEY` dans `.env.local` et Vercel

2. **Créer service email** `/lib/emails.ts`
   - Fonction `sendEmail(to, subject, html)`
   - Utiliser Resend API

3. **Créer templates d'emails** :
   - `templates/email-devis.html` : Devis envoyé au client
   - `templates/email-reponse.html` : Réponse admin au client
   - `templates/email-paiement-confirme.html` : Paiement confirmé (client + admin)
   - `templates/email-livraison.html` : Livraison effectuée

4. **Intégrer envoi emails dans workflow** :
   - Dans `/api/admin/demandes/envoyer-devis` : Envoyer email devis
   - Dans `/api/admin/demandes/envoyer-reponse` : Envoyer email réponse
   - Dans webhooks paiement : Envoyer email confirmation
   - Dans changement statut → `delivered` : Envoyer email livraison

---

### **PRIORITÉ 2 - IMPORTANT** 🟠

#### **3. TABLE `payments` (Base de données)** ❌

**À créer dans Supabase :**

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF',
  payment_method VARCHAR(50) NOT NULL, -- 'wave', 'cinetpay', 'stripe'
  payment_provider_id VARCHAR(255), -- ID transaction chez le provider
  status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'failed', 'cancelled'
  provider_response JSONB, -- Réponse complète du provider
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_payments_request_id ON payments(request_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Clients voient leurs propres paiements
CREATE POLICY "Clients can view own payments"
ON payments FOR SELECT
USING (auth.uid() = user_id);

-- Admins voient tous les paiements
CREATE POLICY "Admins can view all payments"
ON payments FOR SELECT
USING (public.is_user_admin(auth.uid()));
```

#### **4. VALIDATION RÈGLES MÉTIER** ⚠️ (Partiellement fait)

**À compléter :**
- ✅ Impossible de passer à `awaiting_payment` sans prix final (fait dans `updateStatus`)
- ❌ Impossible de passer à `in_production` sans paiement confirmé
- ❌ Impossible de passer à `delivered` sans livrables uploadés
- ❌ Vérifier que `final_price` existe avant d'afficher bouton paiement côté client

#### **5. AFFICHAGE PRIX FINAL CÔTÉ CLIENT** ❌

**À modifier dans `/demandes/[id]/page.tsx` :**
- Afficher `request.final_price` si statut = `awaiting_payment`
- Afficher `request.price_justification` si disponible
- Afficher bouton "Payer maintenant" cliquable

---

### **PRIORITÉ 3 - AMÉLIORATION** 🟡

#### **6. NOTIFICATIONS WHATSAPP** ❌ (Optionnel)

**À faire si besoin :**
- Configurer WhatsApp Business API
- Créer service `/lib/whatsapp.ts`
- Envoyer notifications courtes pour événements clés

#### **7. TABLE `status_history`** ⚠️ (Déjà référencée mais à vérifier)

**À vérifier si existe :**
- Si oui : S'assurer que tous les changements de statut sont enregistrés
- Si non : Créer table et triggers

#### **8. SYSTÈME DE RÉVISIONS** ❌ (Si plan Pro)

**À faire :**
- Nouveau statut `revision_requested`
- Interface pour demander révisions
- Limiter aux clients ayant payé (plan Pro)

---

## 📝 GUIDE PAS À PAS POUR L'IMPLÉMENTATION

### **ÉTAPE 1 : SYSTÈME DE PAIEMENT**

#### **1.1 Créer compte Wave** (Si pas déjà fait)

1. Aller sur https://www.wave.com/sn/merchant/
2. Créer compte marchand
3. Remplir informations entreprise
4. Obtenir **API Token** dans paramètres développeur
5. Ajouter `WAVE_API_TOKEN` dans `.env.local` et Vercel

#### **1.2 Créer compte CinetPay** (Si pas déjà fait)

1. Aller sur https://cinetpay.com/
2. Créer compte marchand
3. Compléter dossier (documents entreprise)
4. Obtenir **API Key** et **Site ID**
5. Ajouter `CINETPAY_API_KEY` et `CINETPAY_SITE_ID` dans `.env.local` et Vercel

#### **1.3 Créer table `payments` dans Supabase**

1. Aller dans Supabase Dashboard → SQL Editor
2. Exécuter le script SQL ci-dessus
3. Vérifier RLS activé

#### **1.4 Créer route API `/api/payment/initiate`**

Fichier : `src/app/api/payment/initiate/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { createWavePayment, createCinetPay } from '@/lib/payments';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { requestId, paymentMethod, phone } = await request.json();

    // Récupérer la demande
    const { data: demande } = await supabase
      .from('requests')
      .select('*, user:user_id(*)')
      .eq('id', requestId)
      .single();

    if (!demande || !demande.final_price) {
      return NextResponse.json({ error: 'Devis non disponible' }, { status: 400 });
    }

    if (demande.status !== 'awaiting_payment') {
      return NextResponse.json({ error: 'Demande non en attente de paiement' }, { status: 400 });
    }

    // Créer transaction
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        request_id: requestId,
        user_id: user.id,
        amount: demande.final_price,
        currency: 'XOF',
        payment_method: paymentMethod,
        status: 'pending'
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Créer paiement selon provider
    let paymentUrl: string;
    
    if (paymentMethod === 'wave') {
      const wavePayment = await createWavePayment(
        demande.final_price,
        requestId,
        phone || user.phone || ''
      );
      if (!wavePayment.success || !wavePayment.url) {
        throw new Error(wavePayment.error || 'Erreur Wave');
      }
      paymentUrl = wavePayment.url;
    } else if (paymentMethod === 'cinetpay') {
      const cinetPayment = await createCinetPay(
        demande.final_price,
        requestId,
        demande.user?.raw_user_meta_data?.full_name || user.email?.split('@')[0] || 'Client',
        demande.user?.email || user.email || ''
      );
      if (!cinetPayment.success || !cinetPayment.url) {
        throw new Error(cinetPayment.error || 'Erreur CinetPay');
      }
      paymentUrl = cinetPayment.url;
    } else {
      throw new Error('Méthode de paiement non supportée');
    }

    // Mettre à jour payment avec provider_id
    await supabase
      .from('payments')
      .update({ provider_response: { payment_url: paymentUrl } })
      .eq('id', payment.id);

    return NextResponse.json({ 
      success: true, 
      payment_url: paymentUrl,
      payment_id: payment.id 
    });

  } catch (error: any) {
    console.error('Erreur initiate payment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

#### **1.5 Créer route webhook Wave `/api/payment/wave-callback`**

Fichier : `src/app/api/payment/wave-callback/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transaction_id, status, request_id } = body;

    // Vérifier signature Wave (si disponible)
    // TODO: Implémenter vérification signature

    const supabase = await createClient();

    if (status === 'completed' || status === 'success') {
      // Mettre à jour payment
      await supabase
        .from('payments')
        .update({ 
          status: 'completed',
          payment_provider_id: transaction_id,
          completed_at: new Date().toISOString()
        })
        .eq('request_id', request_id)
        .eq('status', 'pending');

      // Changer statut demande
      await supabase
        .from('requests')
        .update({ status: 'in_production', updated_at: new Date().toISOString() })
        .eq('id', request_id);

      // TODO: Envoyer email confirmation
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur wave callback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

#### **1.6 Créer route webhook CinetPay `/api/payment/cinetpay-callback`**

Similaire à Wave mais avec format CinetPay.

#### **1.7 Modifier page client `/demandes/[id]/page.tsx`**

Ajouter composant client pour le paiement :

```typescript
'use client';

function PaymentButton({ requestId, finalPrice }: { requestId: string, finalPrice: number }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!selectedMethod) {
      alert('Veuillez sélectionner un mode de paiement');
      return;
    }

    if (selectedMethod === 'wave' && !phone) {
      alert('Veuillez entrer votre numéro de téléphone');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          paymentMethod: selectedMethod,
          phone
        })
      });

      const data = await response.json();

      if (data.success && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        alert(data.error || 'Erreur lors de la création du paiement');
      }
    } catch (error) {
      alert('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Modal avec sélection mode de paiement
    // Bouton "Payer maintenant"
  );
}
```

---

### **ÉTAPE 2 : NOTIFICATIONS EMAIL**

#### **2.1 Configurer Resend**

1. Aller sur https://resend.com/
2. Créer compte
3. Vérifier domaine (ou utiliser domaine Resend pour tests)
4. Obtenir **API Key**
5. Ajouter `RESEND_API_KEY` dans `.env.local` et Vercel

#### **2.2 Installer Resend**

```bash
npm install resend
```

#### **2.3 Créer service email `/lib/emails.ts`**

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Solution360° <noreply@solution360.app>', // À changer selon votre domaine
      to,
      subject,
      html
    });

    if (error) {
      console.error('Erreur Resend:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erreur sendEmail:', error);
    return { success: false, error };
  }
}
```

#### **2.4 Créer templates d'emails**

Créer dossier `src/templates/` avec les templates HTML.

#### **2.5 Intégrer dans les routes API**

Modifier `/api/admin/demandes/envoyer-devis`, `/api/admin/demandes/envoyer-reponse`, etc.

---

## ✅ RÉSUMÉ

### **CE QUI EST FAIT (100%) :**
- ✅ Système d'onglets admin complet
- ✅ Onglet "Analyse IA" fonctionnel
- ✅ Onglet "Tarification" fonctionnel
- ✅ Onglet "Réponse" fonctionnel
- ✅ Validation règles métier (prix obligatoire)
- ✅ Upload livrables fonctionnel

### **CE QUI RESTE À FAIRE (Priorité) :**
- ❌ Système de paiement client (critique)
- ❌ Notifications email (important)
- ❌ Table `payments` dans Supabase (important)
- ❌ Webhooks paiement (critique)
- ❌ Affichage prix final côté client (important)

### **TEMPS ESTIMÉ :**
- **Paiement** : 4-6h
- **Emails** : 2-3h
- **Total** : 6-9h

---

**Document créé par MonAP - Chef de Projet Solution360°**  
*Dernière mise à jour : 2026-01-01*

