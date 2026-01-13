# 🔐 SQL FINAL POUR MIGRATION ADMINS
**Solution360° - Par MonAP**

---

## 📋 RÉSUMÉ

Vous avez :
- ✅ **1 super_admin** : `1568ea30-8d1b-452e-abcc-3a7a310957c1`
- ⚠️ **1 admin à créer** : `admin@solution360.app`

---

## 🚀 SCRIPT SQL COMPLET

### **ÉTAPE 1 : Migrer le super_admin existant**

```sql
-- Ajouter le super_admin dans user_roles
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
```

### **ÉTAPE 2 : Créer pacousstar02@gmail.com (si n'existe pas)**

**Option A : Si l'utilisateur existe déjà**

```sql
-- Vérifier si l'utilisateur existe
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'admin@solution360.app';

-- Si l'utilisateur existe, l'ajouter dans user_roles
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
  role = 'admin',
  permissions = EXCLUDED.permissions,
  updated_at = NOW();
```

**Option B : Si l'utilisateur n'existe pas**

Vous devez créer l'utilisateur via :
1. **L'interface d'inscription** de Solution360° (recommandé)
2. **Le dashboard Supabase** : Auth > Users > Add User
3. **L'API Admin** (voir code ci-dessous)

**Code pour créer via API (à mettre dans une route API temporaire) :**

```typescript
// /src/app/api/create-admin/route.ts (TEMPORAIRE - À SUPPRIMER APRÈS)
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@solution360.app',
    password: 'VotreMotDePasseSecurise123!', // ⚠️ À CHANGER
    email_confirm: true,
    user_metadata: {
      full_name: 'Admin Solution360',
    }
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Ajouter dans user_roles
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({
      user_id: data.user.id,
      role: 'admin',
      permissions: {
        manage_requests: true,
        manage_payments: true,
        view_analytics: true,
      }
    });

  if (roleError) {
    return NextResponse.json({ error: roleError.message }, { status: 400 });
  }

  return NextResponse.json({ 
    success: true, 
    user_id: data.user.id,
    message: 'Admin créé avec succès. Supprimez cette route API maintenant !'
  });
}
```

**⚠️ IMPORTANT :** Supprimez cette route API après utilisation !

### **ÉTAPE 3 : Synchroniser admin_users (legacy)**

```sql
-- S'assurer que les admins sont aussi dans admin_users pour compatibilité
INSERT INTO public.admin_users (user_id, is_admin)
VALUES 
  ('1568ea30-8d1b-452e-abcc-3a7a310957c1', true),
  ((SELECT id FROM auth.users WHERE email = 'pacousstar02@gmail.com' LIMIT 1), true)
ON CONFLICT (user_id) 
DO UPDATE SET 
  is_admin = true;
```

### **ÉTAPE 4 : Synchroniser profiles**

```sql
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
```

### **ÉTAPE 5 : Vérification finale**

```sql
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
ORDER BY ur.role, u.email;
```

**Résultat attendu :**
- ✅ `1568ea30-8d1b-452e-abcc-3a7a310957c1` → super_admin
- ✅ `pacousstar02@gmail.com` → admin

---

## 📝 NOTES IMPORTANTES

1. **L'utilisateur `1568ea30-8d1b-452e-abcc-3a7a310957c1`** est maintenant dans `user_roles` comme super_admin
2. **admin@solution360.app** doit exister dans `auth.users` avant d'être ajouté dans `user_roles`
3. **Les deux tables** (`user_roles` et `admin_users`) sont synchronisées pour compatibilité
4. **La fonction `is_user_admin()`** utilisera `user_roles` en priorité

---

**Document créé par MonAP - Chef de Projet Solution360°**
