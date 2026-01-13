# 🚀 GUIDE DE MIGRATION ET SÉCURITÉ
**Solution360° - Par MonAP**

---

## 📋 VUE D'ENSEMBLE

Ce guide vous accompagne pour :
1. ✅ Migrer les admins vers la table `user_roles`
2. ✅ Configurer toutes les politiques RLS
3. ✅ Sécuriser les buckets Storage
4. ✅ Vérifier que tout fonctionne

**Temps estimé :** 30-45 minutes

---

## 🎯 ÉTAPE 1 : MIGRATION DES ADMINS

### **1.1 Ouvrir Supabase SQL Editor**

1. Connectez-vous à votre projet Supabase
2. Allez dans **SQL Editor** (menu de gauche)
3. Créez une nouvelle requête

### **1.2 Identifier les user_id des admins**

Copiez et exécutez cette requête :

```sql
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
WHERE email IN ('pacous2000@gmail.com', 'admin@solution360.app');
```

**Notez les `user_id`** affichés (vous en aurez besoin).

### **1.3 Exécuter la migration**

1. Ouvrez le fichier `docs/MIGRATION_ADMINS.sql`
2. Copiez tout le contenu
3. Collez dans l'éditeur SQL de Supabase
4. **Exécutez** la requête

**Résultat attendu :**
- 2 lignes insérées/mises à jour dans `user_roles`
- 1 super_admin (pacous2000@gmail.com)
- 1 admin (admin@solution360.app)

### **1.4 Vérifier la migration**

Exécutez cette requête pour vérifier :

```sql
SELECT 
  ur.id,
  ur.user_id,
  u.email,
  ur.role,
  ur.permissions,
  ur.created_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role IN ('admin', 'super_admin')
ORDER BY ur.role, u.email;
```

**Vous devriez voir :**
- ✅ pacous2000@gmail.com → super_admin
- ✅ admin@solution360.app → admin

---

## 🔒 ÉTAPE 2 : CONFIGURER LES POLITIQUES RLS

### **2.1 Créer la fonction helper**

1. Ouvrez le fichier `docs/RLS_POLICIES.sql`
2. Copiez la section **"FONCTION HELPER"** (lignes 1-20)
3. Exécutez dans Supabase SQL Editor

**Vérification :**
```sql
SELECT public.is_user_admin('votre-user-id-ici');
-- Devrait retourner true pour un admin
```

### **2.2 Activer RLS sur toutes les tables**

Exécutez ces commandes une par une :

```sql
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_stats ENABLE ROW LEVEL SECURITY;
```

### **2.3 Créer toutes les politiques**

1. Ouvrez le fichier `docs/RLS_POLICIES.sql`
2. Copiez **TOUT le contenu** (sauf la fonction helper déjà créée)
3. Collez dans Supabase SQL Editor
4. **Exécutez** la requête

**Résultat attendu :**
- ✅ ~30 politiques créées
- ✅ Aucune erreur

### **2.4 Vérifier les politiques créées**

Exécutez cette requête :

```sql
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**Vous devriez voir :**
- ✅ Chaque table a plusieurs politiques
- ✅ Total : ~30 politiques

---

## 🗂️ ÉTAPE 3 : SÉCURISER LES BUCKETS STORAGE

### **3.1 Accéder aux politiques Storage**

1. Dans Supabase, allez dans **Storage** (menu de gauche)
2. Cliquez sur **Policies** (onglet en haut)
3. Sélectionnez le bucket **`deliverables`**

### **3.2 Configurer le bucket `deliverables`**

**Politique 1 : Clients peuvent lire leurs propres livrables**

```sql
CREATE POLICY "Clients can read own deliverables"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'deliverables'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text 
    FROM public.requests 
    WHERE user_id = auth.uid()
  )
);
```

**Politique 2 : Admins peuvent lire tous les livrables**

```sql
CREATE POLICY "Admins can read all deliverables"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'deliverables'
  AND public.is_user_admin(auth.uid())
);
```

**Politique 3 : Seuls les admins peuvent uploader**

```sql
CREATE POLICY "Only admins can upload deliverables"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deliverables'
  AND public.is_user_admin(auth.uid())
);
```

### **3.3 Configurer le bucket `Avatar`**

**Politique 1 : Utilisateurs peuvent lire leur propre avatar**

```sql
CREATE POLICY "Users can read own avatar"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'Avatar'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**Politique 2 : Utilisateurs peuvent uploader leur propre avatar**

```sql
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'Avatar'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**Politique 3 : Utilisateurs peuvent mettre à jour leur propre avatar**

```sql
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'Avatar'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## ✅ ÉTAPE 4 : TESTS DE SÉCURITÉ

### **4.1 Test en tant que Client**

1. Connectez-vous avec un compte client
2. Vérifiez que :
   - ✅ Vous voyez uniquement vos propres demandes
   - ✅ Vous ne voyez pas les demandes des autres
   - ✅ Vous pouvez créer une nouvelle demande
   - ✅ Vous ne pouvez pas modifier les demandes des autres

### **4.2 Test en tant qu'Admin**

1. Connectez-vous avec un compte admin
2. Vérifiez que :
   - ✅ Vous voyez toutes les demandes
   - ✅ Vous pouvez modifier toutes les demandes
   - ✅ Vous pouvez uploader des livrables
   - ✅ Vous ne pouvez pas modifier les rôles (réservé aux super_admins)

### **4.3 Test en tant que Super Admin**

1. Connectez-vous avec pacous2000@gmail.com
2. Vérifiez que :
   - ✅ Vous pouvez tout faire
   - ✅ Vous pouvez modifier les rôles
   - ✅ Vous pouvez gérer les admins

---

## 🚨 EN CAS DE PROBLÈME

### **Problème : "RLS bloque l'accès"**

**Solution :**
1. Vérifiez que la fonction `is_user_admin()` existe :
   ```sql
   SELECT public.is_user_admin('votre-user-id');
   ```

2. Vérifiez que les politiques sont créées :
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'requests';
   ```

3. Testez avec un utilisateur admin connu

### **Problème : "Un client voit les données d'un autre"**

**URGENT :**
1. Désactivez temporairement RLS :
   ```sql
   ALTER TABLE public.requests DISABLE ROW LEVEL SECURITY;
   ```

2. Vérifiez les politiques
3. Corrigez les politiques problématiques
4. Réactivez RLS :
   ```sql
   ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
   ```

### **Problème : "Les admins ne peuvent plus se connecter"**

**Solution :**
1. Vérifiez que les admins sont bien dans `user_roles` :
   ```sql
   SELECT * FROM public.user_roles WHERE role IN ('admin', 'super_admin');
   ```

2. Vérifiez que la fonction `is_user_admin()` fonctionne
3. Vérifiez les politiques RLS sur `admin_users` et `user_roles`

---

## 📊 CHECKLIST FINALE

Avant de considérer la migration terminée :

- [ ] ✅ Admins migrés vers `user_roles`
- [ ] ✅ Fonction `is_user_admin()` créée et testée
- [ ] ✅ RLS activé sur toutes les tables
- [ ] ✅ Toutes les politiques RLS créées
- [ ] ✅ Politiques Storage configurées pour `deliverables`
- [ ] ✅ Politiques Storage configurées pour `Avatar`
- [ ] ✅ Tests client effectués (accès correct)
- [ ] ✅ Tests admin effectués (accès correct)
- [ ] ✅ Tests super_admin effectués (accès correct)
- [ ] ✅ Aucune erreur dans les logs Supabase

---

## 📝 NOTES IMPORTANTES

### **Après la migration :**

1. **Le code fonctionne automatiquement** : La fonction `isAdmin()` dans `lib/admin/permissions.ts` utilisera `user_roles` en priorité
2. **Les fallbacks legacy restent actifs** : Pour compatibilité, les fallbacks (admin_users, emails) restent fonctionnels
3. **Une fois tous les admins migrés** : Vous pourrez supprimer les fallbacks dans le code

### **Maintenance :**

- **Ajouter un nouvel admin** : Insérer dans `user_roles` avec le rôle approprié
- **Retirer un admin** : Supprimer de `user_roles` (ou changer le rôle à 'user')
- **Modifier les permissions** : Mettre à jour le champ `permissions` dans `user_roles`

---

## 🎉 FÉLICITATIONS !

Une fois toutes les étapes terminées, votre base de données Supabase est **sécurisée** et **prête pour la production** ! 🚀

---

**Document créé par MonAP - Chef de Projet Solution360°**  
*Dernière mise à jour : 2026*
