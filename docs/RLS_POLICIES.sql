-- ============================================
-- POLITIQUES RLS (ROW LEVEL SECURITY)
-- Solution360° - Par MonAP
-- ============================================

-- ⚠️ IMPORTANT : Activer RLS sur toutes les tables avant d'exécuter ces politiques
-- ⚠️ Exécuter ce script dans l'éditeur SQL de Supabase

-- ============================================
-- FONCTION HELPER : Vérifier si un utilisateur est admin
-- ============================================

CREATE OR REPLACE FUNCTION public.is_user_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = user_uuid 
      AND role IN ('admin', 'super_admin')
  ) OR EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = user_uuid 
      AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TABLE : requests
-- ============================================

-- Activer RLS
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Politique : Les clients voient uniquement leurs propres demandes
CREATE POLICY "Clients can view own requests"
ON public.requests
FOR SELECT
USING (
  auth.uid() = user_id
);

-- Politique : Les admins voient toutes les demandes
CREATE POLICY "Admins can view all requests"
ON public.requests
FOR SELECT
USING (
  public.is_user_admin(auth.uid())
);

-- Politique : Les clients peuvent créer leurs propres demandes
CREATE POLICY "Clients can create own requests"
ON public.requests
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- Politique : Les clients peuvent mettre à jour leurs propres demandes (statut draft uniquement)
CREATE POLICY "Clients can update own draft requests"
ON public.requests
FOR UPDATE
USING (
  auth.uid() = user_id 
  AND status = 'draft'
)
WITH CHECK (
  auth.uid() = user_id
);

-- Politique : Les admins peuvent mettre à jour toutes les demandes
CREATE POLICY "Admins can update all requests"
ON public.requests
FOR UPDATE
USING (
  public.is_user_admin(auth.uid())
)
WITH CHECK (
  public.is_user_admin(auth.uid())
);

-- ============================================
-- TABLE : ai_analyses
-- ============================================

-- Activer RLS
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;

-- Politique : Les clients voient les analyses de leurs propres demandes
CREATE POLICY "Clients can view own request analyses"
ON public.ai_analyses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.requests 
    WHERE requests.id = ai_analyses.request_id 
      AND requests.user_id = auth.uid()
  )
);

-- Politique : Les admins voient toutes les analyses
CREATE POLICY "Admins can view all analyses"
ON public.ai_analyses
FOR SELECT
USING (
  public.is_user_admin(auth.uid())
);

-- Politique : Seuls les admins peuvent créer des analyses
CREATE POLICY "Only admins can create analyses"
ON public.ai_analyses
FOR INSERT
WITH CHECK (
  public.is_user_admin(auth.uid())
);

-- Politique : Seuls les admins peuvent mettre à jour les analyses
CREATE POLICY "Only admins can update analyses"
ON public.ai_analyses
FOR UPDATE
USING (
  public.is_user_admin(auth.uid())
)
WITH CHECK (
  public.is_user_admin(auth.uid())
);

-- ============================================
-- TABLE : admin_users
-- ============================================

-- Activer RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs voient uniquement leur propre entrée
CREATE POLICY "Users can view own admin entry"
ON public.admin_users
FOR SELECT
USING (
  auth.uid() = user_id
);

-- Politique : Seuls les super_admins peuvent gérer admin_users
CREATE POLICY "Only super_admins can manage admin_users"
ON public.admin_users
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
-- TABLE : user_roles
-- ============================================

-- Activer RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs voient uniquement leur propre rôle
CREATE POLICY "Users can view own role"
ON public.user_roles
FOR SELECT
USING (
  auth.uid() = user_id
);

-- Politique : Seuls les super_admins peuvent gérer user_roles
CREATE POLICY "Only super_admins can manage user_roles"
ON public.user_roles
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
-- TABLE : admin_notes
-- ============================================

-- Activer RLS
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

-- Politique : Les admins voient toutes les notes
CREATE POLICY "Admins can view all admin notes"
ON public.admin_notes
FOR SELECT
USING (
  public.is_user_admin(auth.uid())
);

-- Politique : Les clients voient uniquement les notes visibles (note_type = 'client_visible')
CREATE POLICY "Clients can view visible notes"
ON public.admin_notes
FOR SELECT
USING (
  note_type = 'client_visible'
  AND EXISTS (
    SELECT 1 
    FROM public.requests 
    WHERE requests.id = admin_notes.request_id 
      AND requests.user_id = auth.uid()
  )
);

-- Politique : Seuls les admins peuvent créer des notes
CREATE POLICY "Only admins can create admin notes"
ON public.admin_notes
FOR INSERT
WITH CHECK (
  public.is_user_admin(auth.uid())
);

-- Politique : Seuls les admins peuvent mettre à jour les notes
CREATE POLICY "Only admins can update admin notes"
ON public.admin_notes
FOR UPDATE
USING (
  public.is_user_admin(auth.uid())
)
WITH CHECK (
  public.is_user_admin(auth.uid())
);

-- ============================================
-- TABLE : deliverables
-- ============================================

-- Activer RLS
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

-- Politique : Les clients voient les livrables de leurs propres demandes
CREATE POLICY "Clients can view own request deliverables"
ON public.deliverables
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.requests 
    WHERE requests.id = deliverables.request_id 
      AND requests.user_id = auth.uid()
  )
);

-- Politique : Les admins voient tous les livrables
CREATE POLICY "Admins can view all deliverables"
ON public.deliverables
FOR SELECT
USING (
  public.is_user_admin(auth.uid())
);

-- Politique : Seuls les admins peuvent créer des livrables
CREATE POLICY "Only admins can create deliverables"
ON public.deliverables
FOR INSERT
WITH CHECK (
  public.is_user_admin(auth.uid())
);

-- Politique : Seuls les admins peuvent mettre à jour les livrables
CREATE POLICY "Only admins can update deliverables"
ON public.deliverables
FOR UPDATE
USING (
  public.is_user_admin(auth.uid())
)
WITH CHECK (
  public.is_user_admin(auth.uid())
);

-- ============================================
-- TABLE : payments
-- ============================================

-- Activer RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Politique : Les clients voient uniquement leurs propres paiements
CREATE POLICY "Clients can view own payments"
ON public.payments
FOR SELECT
USING (
  auth.uid() = user_id
);

-- Politique : Les admins voient tous les paiements
CREATE POLICY "Admins can view all payments"
ON public.payments
FOR SELECT
USING (
  public.is_user_admin(auth.uid())
);

-- Politique : Les clients peuvent créer leurs propres paiements
CREATE POLICY "Clients can create own payments"
ON public.payments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- Politique : Seuls les admins peuvent mettre à jour les paiements
CREATE POLICY "Only admins can update payments"
ON public.payments
FOR UPDATE
USING (
  public.is_user_admin(auth.uid())
)
WITH CHECK (
  public.is_user_admin(auth.uid())
);

-- ============================================
-- TABLE : profiles
-- ============================================

-- Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs voient uniquement leur propre profil
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
);

-- Politique : Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id
  -- Empêcher la modification de is_admin et role via cette politique
  AND (OLD.is_admin = is_admin OR NOT is_admin)
  AND (OLD.role = role OR role = 'client')
);

-- Politique : Les admins voient tous les profils
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  public.is_user_admin(auth.uid())
);

-- Politique : Seuls les super_admins peuvent modifier is_admin et role
CREATE POLICY "Only super_admins can modify admin status"
ON public.profiles
FOR UPDATE
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
-- TABLE : status_history
-- ============================================

-- Activer RLS
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;

-- Politique : Les clients voient l'historique de leurs propres demandes
CREATE POLICY "Clients can view own request history"
ON public.status_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.requests 
    WHERE requests.id = status_history.request_id 
      AND requests.user_id = auth.uid()
  )
);

-- Politique : Les admins voient tout l'historique
CREATE POLICY "Admins can view all history"
ON public.status_history
FOR SELECT
USING (
  public.is_user_admin(auth.uid())
);

-- Politique : Seuls les admins peuvent créer des entrées d'historique
CREATE POLICY "Only admins can create history"
ON public.status_history
FOR INSERT
WITH CHECK (
  public.is_user_admin(auth.uid())
);

-- ============================================
-- TABLE : solutions
-- ============================================

-- Activer RLS
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;

-- Politique : Les clients voient les solutions de leurs propres demandes
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

-- Politique : Les admins voient toutes les solutions
CREATE POLICY "Admins can view all solutions"
ON public.solutions
FOR SELECT
USING (
  public.is_user_admin(auth.uid())
);

-- Politique : Seuls les admins peuvent gérer les solutions
CREATE POLICY "Only admins can manage solutions"
ON public.solutions
FOR ALL
USING (
  public.is_user_admin(auth.uid())
)
WITH CHECK (
  public.is_user_admin(auth.uid())
);

-- ============================================
-- TABLE : admin_stats
-- ============================================

-- Activer RLS
ALTER TABLE public.admin_stats ENABLE ROW LEVEL SECURITY;

-- Politique : Seuls les admins peuvent voir les stats
CREATE POLICY "Only admins can view stats"
ON public.admin_stats
FOR SELECT
USING (
  public.is_user_admin(auth.uid())
);

-- Politique : Seuls les super_admins peuvent modifier les stats
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
-- VÉRIFICATION DES POLITIQUES
-- ============================================

-- Afficher toutes les politiques créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Toutes les politiques utilisent la fonction is_user_admin() pour la cohérence
-- 2. Les clients ne peuvent voir/modifier que leurs propres données
-- 3. Les admins peuvent voir toutes les données mais certaines modifications sont réservées aux super_admins
-- 4. Testez chaque politique après création pour vérifier qu'elle fonctionne correctement
-- 5. En cas de problème, vous pouvez désactiver temporairement RLS avec :
--    ALTER TABLE public.table_name DISABLE ROW LEVEL SECURITY;
