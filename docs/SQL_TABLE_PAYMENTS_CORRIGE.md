# 💳 CRÉATION TABLE PAYMENTS (VERSION CORRIGÉE)
**Solution360° - Par MonAP**

---

## 📋 SCRIPT SQL COMPLET

Exécutez ce script dans le **SQL Editor** de Supabase pour créer la table `payments` et ses politiques RLS.

**⚠️ IMPORTANT :** Assurez-vous que la fonction `public.is_user_admin()` existe avant d'exécuter ce script.
Si elle n'existe pas, exécutez d'abord le script de la table `messages` qui la crée.

```sql
-- Créer la table payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF',
  payment_method VARCHAR(50) NOT NULL, -- 'wave', 'cinetpay', 'stripe'
  payment_provider_id VARCHAR(255), -- ID transaction chez le provider
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  provider_response JSONB, -- Réponse complète du provider
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_payments_request_id ON public.payments(request_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_provider_id ON public.payments(payment_provider_id);

-- Activer RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Politique : Clients voient leurs propres paiements
CREATE POLICY "Clients can view own payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

-- Politique : Clients peuvent créer leurs propres paiements
CREATE POLICY "Clients can create own payments"
ON public.payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Politique : Clients peuvent mettre à jour leurs propres paiements
CREATE POLICY "Clients can update own payments"
ON public.payments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Politique : Admins voient tous les paiements
CREATE POLICY "Admins can view all payments"
ON public.payments FOR SELECT
USING (public.is_user_admin(auth.uid()));

-- Politique : Admins peuvent mettre à jour tous les paiements
CREATE POLICY "Admins can update all payments"
ON public.payments FOR UPDATE
USING (public.is_user_admin(auth.uid()))
WITH CHECK (public.is_user_admin(auth.uid()));

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();

-- Commentaires pour documentation
COMMENT ON TABLE public.payments IS 'Table des paiements pour les demandes Solution360°';
COMMENT ON COLUMN public.payments.payment_method IS 'Méthode de paiement: wave, cinetpay, stripe';
COMMENT ON COLUMN public.payments.status IS 'Statut: pending, completed, failed, cancelled';
COMMENT ON COLUMN public.payments.provider_response IS 'Réponse JSON complète du provider de paiement';
```

---

## ✅ VÉRIFICATION

Après exécution, vérifiez que la table existe :

```sql
-- Vérifier la structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'payments'
ORDER BY ordinal_position;

-- Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'payments';

-- Vérifier les index
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'payments';
```

---

## 📝 NOTES IMPORTANTES

1. **RLS activé** : Les utilisateurs ne peuvent voir que leurs propres paiements
2. **Admins** : Peuvent voir tous les paiements via la fonction `is_user_admin()`
3. **Cascade** : Si une demande est supprimée, ses paiements le sont aussi
4. **Index** : Optimisés pour les requêtes fréquentes (request_id, user_id, status)
5. **Fonction is_user_admin** : Utilise `user_roles` et `admin_users.user_id` (pas `email`)

---

## 🔄 ORDRE D'EXÉCUTION RECOMMANDÉ

1. **D'abord** : Exécuter le script `SQL_TABLE_MESSAGES.md` (crée la fonction `is_user_admin`)
2. **Ensuite** : Exécuter ce script pour créer la table `payments`

---

**Signé : MonAP - Chef de Projet Solution360°**  
*Date : 2026*
