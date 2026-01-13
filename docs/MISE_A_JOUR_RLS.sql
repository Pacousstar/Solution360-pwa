-- ============================================
-- MISE À JOUR DES POLITIQUES RLS
-- Solution360° - Par MonAP
-- ============================================

-- ⚠️ IMPORTANT : Les politiques existantes utilisent encore admin_users
-- Ce script les met à jour pour utiliser user_roles en priorité

-- ============================================
-- ÉTAPE 1 : Vérifier que la fonction is_user_admin() existe
-- ============================================

-- Créer ou remplacer la fonction helper
CREATE OR REPLACE FUNCTION public.is_user_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Priorité 1 : Vérifier user_roles (nouveau système)
  IF EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = user_uuid 
      AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Priorité 2 : Vérifier admin_users (legacy)
  IF EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = user_uuid 
      AND is_admin = true
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Priorité 3 : Vérifier profiles.is_admin (legacy)
  IF EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_uuid 
      AND is_admin = true
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ÉTAPE 2 : Supprimer les anciennes politiques
-- ============================================

-- Supprimer les politiques qui utilisent directement admin_users
DROP POLICY IF EXISTS "Admins can view all requests" ON public.requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON public.requests;
DROP POLICY IF EXISTS "Admins can view all analyses" ON public.ai_analyses;
DROP POLICY IF EXISTS "Admins can view all admin notes" ON public.admin_notes;
DROP POLICY IF EXISTS "Admins can create admin notes" ON public.admin_notes;
DROP POLICY IF EXISTS "Admins can update their own notes" ON public.admin_notes;
DROP POLICY IF EXISTS "Admins can delete their own notes" ON public.admin_notes;
DROP POLICY IF EXISTS "Admins can manage all deliverables" ON public.deliverables;
DROP POLICY IF EXISTS "Admins can view all status history" ON public.status_history;
DROP POLICY IF EXISTS "Admins can create status history" ON public.status_history;

-- ============================================
-- ÉTAPE 3 : Créer les nouvelles politiques avec is_user_admin()
-- ============================================

-- REQUESTS
CREATE POLICY "Admins can view all requests"
ON public.requests
FOR SELECT
USING (
  public.is_user_admin(auth.uid())
);

CREATE POLICY "Admins can update all requests"
ON public.requests
FOR UPDATE
USING (
  public.is_user_admin(auth.uid())
)
WITH CHECK (
  public.is_user_admin(auth.uid())
);

-- AI_ANALYSES
CREATE POLICY "Admins can view all analyses"
ON public.ai_analyses
FOR SELECT
USING (
  public.is_user_admin(auth.uid())
);

CREATE POLICY "Only admins can create analyses"
ON public.ai_analyses
FOR INSERT
WITH CHECK (
  public.is_user_admin(auth.uid())
);

CREATE POLICY "Only admins can update analyses"
ON public.ai_analyses
FOR UPDATE
USING (
  public.is_user_admin(auth.uid())
)
WITH CHECK (
  public.is_user_admin(auth.uid())
);

-- ADMIN_NOTES
CREATE POLICY "Admins can view all admin notes"
ON public.admin_notes
FOR SELECT
USING (
  public.is_user_admin(auth.uid())
);

CREATE POLICY "Only admins can create admin notes"
ON public.admin_notes
FOR INSERT
WITH CHECK (
  public.is_user_admin(auth.uid())
);

CREATE POLICY "Only admins can update admin notes"
ON public.admin_notes
FOR UPDATE
USING (
  public.is_user_admin(auth.uid())
)
WITH CHECK (
  public.is_user_admin(auth.uid())
);

CREATE POLICY "Only admins can delete admin notes"
ON public.admin_notes
FOR DELETE
USING (
  public.is_user_admin(auth.uid())
);

-- DELIVERABLES
CREATE POLICY "Admins can manage all deliverables"
ON public.deliverables
FOR ALL
USING (
  public.is_user_admin(auth.uid())
)
WITH CHECK (
  public.is_user_admin(auth.uid())
);

-- STATUS_HISTORY
CREATE POLICY "Admins can view all status history"
ON public.status_history
FOR SELECT
USING (
  public.is_user_admin(auth.uid())
);

CREATE POLICY "Only admins can create status history"
ON public.status_history
FOR INSERT
WITH CHECK (
  public.is_user_admin(auth.uid())
);

-- ============================================
-- ÉTAPE 4 : Nettoyer les politiques en double
-- ============================================

-- Supprimer les politiques en double sur requests
DROP POLICY IF EXISTS "Users can insert their own requests" ON public.requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON public.requests;
DROP POLICY IF EXISTS "Allow anonymous updates for MVP" ON public.requests;

-- Garder uniquement les politiques propres
-- (Les politiques "Users can..." sont déjà en place)

-- ============================================
-- ÉTAPE 5 : Ajouter les politiques manquantes
-- ============================================

-- PAYMENTS : Politique admin manquante
CREATE POLICY "Admins can view all payments"
ON public.payments
FOR SELECT
USING (
  public.is_user_admin(auth.uid())
);

CREATE POLICY "Only admins can update payments"
ON public.payments
FOR UPDATE
USING (
  public.is_user_admin(auth.uid())
)
WITH CHECK (
  public.is_user_admin(auth.uid())
);

-- SOLUTIONS : Politiques manquantes
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own request solutions"
ON public.solutions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.requests 
    WHERE requests.id = solutions.request_id 
      AND requests.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all solutions"
ON public.solutions
FOR SELECT
USING (
  public.is_user_admin(auth.uid())
);

CREATE POLICY "Only admins can manage solutions"
ON public.solutions
FOR ALL
USING (
  public.is_user_admin(auth.uid())
)
WITH CHECK (
  public.is_user_admin(auth.uid())
);

-- ADMIN_STATS : Politiques manquantes
ALTER TABLE public.admin_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view stats"
ON public.admin_stats
FOR SELECT
USING (
  public.is_user_admin(auth.uid())
);

CREATE POLICY "Only super_admins can update stats"
ON public.admin_stats
FOR ALL
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
      AND role = 'super_admin'
  )
);

-- ============================================
-- ÉTAPE 6 : Vérification finale
-- ============================================

-- Afficher toutes les politiques mises à jour
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual LIKE '%is_user_admin%' THEN '✅ Utilise is_user_admin()'
    WHEN qual LIKE '%admin_users%' THEN '⚠️ Utilise encore admin_users'
    ELSE 'ℹ️ Autre'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('requests', 'ai_analyses', 'admin_notes', 'deliverables', 'payments', 'solutions', 'admin_stats', 'status_history')
ORDER BY tablename, policyname;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Toutes les politiques utilisent maintenant is_user_admin() qui vérifie user_roles en priorité
-- 2. Les fallbacks (admin_users, profiles) restent actifs pour compatibilité
-- 3. Testez chaque table après mise à jour pour vérifier que tout fonctionne
-- 4. Les politiques "Users can..." restent inchangées (elles sont correctes)
