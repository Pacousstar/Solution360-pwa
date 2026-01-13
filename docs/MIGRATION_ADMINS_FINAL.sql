-- ============================================
-- MIGRATION FINALE DES ADMINS
-- Solution360° - Par MonAP
-- ============================================

-- ⚠️ IMPORTANT : Exécuter ce script dans l'éditeur SQL de Supabase

-- ============================================
-- ÉTAPE 1 : Migrer le super_admin existant
-- ============================================

-- L'utilisateur 1568ea30-8d1b-452e-abcc-3a7a310957c1 est déjà super_admin
-- On l'ajoute aussi dans user_roles pour la cohérence

INSERT INTO public.user_roles (user_id, role, permissions)
VALUES (
  '1568ea30-8d1b-452e-abcc-3a7a310957c1',
  'super_admin',
  '{
    "manage_requests": true,
    "manage_users": true,
    "manage_payments": true,
    "manage_finance": true,
    "manage_settings": true,
    "view_analytics": true,
    "manage_admins": true
  }'::jsonb
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'super_admin',
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- Vérifier
SELECT 
  ur.user_id,
  u.email,
  ur.role,
  ur.permissions
FROM public.user_roles ur
LEFT JOIN auth.users u ON u.id = ur.user_id
WHERE ur.user_id = '1568ea30-8d1b-452e-abcc-3a7a310957c1';

-- ============================================
-- ÉTAPE 2 : Créer l'utilisateur admin@solution360.app
-- ============================================

-- ⚠️ IMPORTANT : L'utilisateur doit d'abord s'inscrire via l'interface
-- OU utiliser l'API Admin de Supabase pour créer l'utilisateur

-- Option A : Si l'utilisateur existe déjà dans auth.users
-- (Vérifier d'abord)
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'pacousstar02@gmail.com';

-- Si l'utilisateur existe, l'ajouter dans user_roles :
INSERT INTO public.user_roles (user_id, role, permissions)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'pacousstar02@gmail.com' LIMIT 1),
  'admin',
  '{
    "manage_requests": true,
    "manage_payments": true,
    "view_analytics": true
  }'::jsonb
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'admin',
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- Option B : Si l'utilisateur n'existe pas, créer via API Admin
-- (À faire depuis le code ou le dashboard Supabase)
-- Voir la section "Création via API" ci-dessous

-- ============================================
-- ÉTAPE 3 : Mettre à jour admin_users (legacy)
-- ============================================

-- S'assurer que les admins sont aussi dans admin_users pour compatibilité
INSERT INTO public.admin_users (user_id, is_admin)
VALUES 
  ('1568ea30-8d1b-452e-abcc-3a7a310957c1', true),
  ((SELECT id FROM auth.users WHERE email = 'admin@solution360.app' LIMIT 1), true)
ON CONFLICT (user_id) 
DO UPDATE SET 
  is_admin = true;

-- ============================================
-- ÉTAPE 4 : Mettre à jour profiles (synchronisation)
-- ============================================

-- Synchroniser les rôles dans profiles
UPDATE public.profiles p
SET 
  role = CASE 
    WHEN ur.role = 'super_admin' THEN 'admin'
    WHEN ur.role = 'admin' THEN 'admin'
    ELSE 'client'
  END,
  is_admin = (ur.role IN ('admin', 'super_admin')),
  updated_at = NOW()
FROM public.user_roles ur
WHERE p.id = ur.user_id
  AND ur.role IN ('admin', 'super_admin');

-- ============================================
-- ÉTAPE 5 : Vérification finale
-- ============================================

-- Afficher tous les admins
SELECT 
  'user_roles' as source,
  ur.user_id,
  u.email,
  ur.role,
  ur.permissions,
  ur.created_at
FROM public.user_roles ur
LEFT JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role IN ('admin', 'super_admin')

UNION ALL

SELECT 
  'admin_users (legacy)' as source,
  au.user_id,
  u.email,
  CASE WHEN au.is_admin THEN 'admin' ELSE 'user' END as role,
  '{}'::jsonb as permissions,
  au.created_at
FROM public.admin_users au
LEFT JOIN auth.users u ON u.id = au.user_id
WHERE au.is_admin = true

ORDER BY role, email;

-- ============================================
-- CRÉATION D'UTILISATEUR VIA API (Option B)
-- ============================================

-- Si admin@solution360.app n'existe pas, vous devez le créer via :
-- 1. L'interface d'inscription de Solution360°
-- 2. Le dashboard Supabase (Auth > Users > Add User)
-- 3. L'API Admin de Supabase (depuis votre code)

-- Exemple de code pour créer l'utilisateur (à mettre dans un script Node.js ou API route) :
/*
import { createAdminClient } from '@/lib/supabase/admin';

const supabase = createAdminClient();

const { data, error } = await supabase.auth.admin.createUser({
  email: 'admin@solution360.app',
  password: 'VotreMotDePasseSecurise123!',
  email_confirm: true, // Confirmer l'email automatiquement
  user_metadata: {
    full_name: 'Admin Solution360',
  }
});

if (error) {
  console.error('Erreur création utilisateur:', error);
} else {
  console.log('Utilisateur créé:', data.user.id);
  
  // Ensuite, ajouter dans user_roles (voir ÉTAPE 2 ci-dessus)
}
*/

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. L'utilisateur 1568ea30-8d1b-452e-abcc-3a7a310957c1 est maintenant dans user_roles
-- 2. admin@solution360.app doit exister dans auth.users avant d'être ajouté dans user_roles
-- 3. Les deux tables (user_roles et admin_users) sont synchronisées pour compatibilité
-- 4. La fonction is_user_admin() utilisera user_roles en priorité
