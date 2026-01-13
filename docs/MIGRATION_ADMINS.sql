-- ============================================
-- MIGRATION DES ADMINS VERS user_roles
-- Solution360° - Par MonAP
-- ============================================

-- ⚠️ IMPORTANT : Exécuter ce script dans l'éditeur SQL de Supabase
-- ⚠️ Vérifier les emails avant d'exécuter

-- ============================================
-- ÉTAPE 1 : Identifier les user_id des admins
-- ============================================

-- Afficher les utilisateurs avec les emails admin
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
WHERE email IN ('pacous2000@gmail.com', 'admin@solution360.app');

-- ============================================
-- ÉTAPE 2 : Insérer les admins dans user_roles
-- ============================================

-- ⚠️ REMPLACER les UUIDs ci-dessous par les vrais user_id de l'étape 1
-- ⚠️ Exécuter cette requête pour chaque admin

-- Admin 1 : pacous2000@gmail.com (Super Admin)
INSERT INTO public.user_roles (user_id, role, permissions)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'pacous2000@gmail.com' LIMIT 1),
  'super_admin',
  '{
    "manage_requests": true,
    "manage_users": true,
    "manage_payments": true,
    "manage_finance": true,
    "manage_settings": true,
    "view_analytics": true
  }'::jsonb
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- Admin 2 : admin@solution360.app (Admin)
INSERT INTO public.user_roles (user_id, role, permissions)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@solution360.app' LIMIT 1),
  'admin',
  '{
    "manage_requests": true,
    "manage_payments": true,
    "view_analytics": true
  }'::jsonb
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- ============================================
-- ÉTAPE 3 : Vérifier la migration
-- ============================================

-- Afficher tous les admins dans user_roles
SELECT 
  ur.id,
  ur.user_id,
  u.email,
  ur.role,
  ur.permissions,
  ur.created_at,
  ur.updated_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role IN ('admin', 'super_admin')
ORDER BY ur.role, u.email;

-- ============================================
-- ÉTAPE 4 : Mettre à jour la table profiles (optionnel)
-- ============================================

-- Synchroniser les rôles dans profiles si nécessaire
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

-- Compter les admins par source
SELECT 
  'user_roles' as source,
  COUNT(*) as admin_count
FROM public.user_roles
WHERE role IN ('admin', 'super_admin')

UNION ALL

SELECT 
  'admin_users (legacy)' as source,
  COUNT(*) as admin_count
FROM public.admin_users
WHERE is_admin = true

UNION ALL

SELECT 
  'profiles (legacy)' as source,
  COUNT(*) as admin_count
FROM public.profiles
WHERE is_admin = true OR role = 'admin';

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 1. Après migration, la fonction isAdmin() dans lib/admin/permissions.ts
--    utilisera automatiquement user_roles en priorité
-- 2. Les fallbacks legacy (admin_users, emails hardcodés) resteront actifs
--    jusqu'à ce que tous les admins soient migrés
-- 3. Une fois tous les admins migrés, vous pourrez supprimer les fallbacks
-- 4. Ne supprimez PAS la table admin_users tant que des admins l'utilisent
