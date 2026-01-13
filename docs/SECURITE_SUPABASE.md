# 🔐 GUIDE DE SÉCURITÉ SUPABASE
**Solution360° - Par MonAP**

---

## 📋 ANALYSE DES TABLES

### **Tables Identifiées :**

1. ✅ **requests** - Demandes clients
2. ✅ **ai_analyses** - Analyses IA
3. ✅ **admin_users** - Admins (legacy)
4. ✅ **user_roles** - Rôles et permissions (nouveau)
5. ✅ **admin_notes** - Notes admin
6. ✅ **deliverables** - Livrables
7. ✅ **payments** - Paiements
8. ✅ **profiles** - Profils utilisateurs
9. ✅ **status_history** - Historique des statuts
10. ✅ **solutions** - Solutions
11. ✅ **admin_stats** - Statistiques admin

---

## 🔒 ÉTAT ACTUEL DE LA SÉCURITÉ

### **RLS (Row Level Security)**

⚠️ **À VÉRIFIER** : Les politiques RLS doivent être activées sur toutes les tables.

**Tables nécessitant RLS :**
- ✅ `requests` - **CRITIQUE** (données clients)
- ✅ `ai_analyses` - **CRITIQUE** (analyses privées)
- ✅ `admin_users` - **CRITIQUE** (accès admin)
- ✅ `user_roles` - **CRITIQUE** (rôles et permissions)
- ✅ `admin_notes` - **IMPORTANT** (notes internes)
- ✅ `deliverables` - **IMPORTANT** (fichiers clients)
- ✅ `payments` - **CRITIQUE** (données financières)
- ✅ `profiles` - **IMPORTANT** (données personnelles)
- ✅ `status_history` - **IMPORTANT** (historique)
- ✅ `solutions` - **IMPORTANT** (solutions)
- ✅ `admin_stats` - **IMPORTANT** (statistiques)

---

## 🚨 PROBLÈMES DE SÉCURITÉ IDENTIFIÉS

### **1. RLS Non Configuré**
⚠️ **RISQUE ÉLEVÉ** : Si RLS n'est pas activé, tous les utilisateurs peuvent voir toutes les données.

**Solution :** Exécuter le script `RLS_POLICIES.sql`

### **2. Table admin_users Legacy**
⚠️ **RISQUE MOYEN** : Table legacy qui peut créer de la confusion.

**Recommandation :** 
- Migrer tous les admins vers `user_roles`
- Garder `admin_users` temporairement pour compatibilité
- Supprimer `admin_users` une fois migration complète

### **3. Table profiles avec is_admin**
⚠️ **RISQUE MOYEN** : Duplication de la logique admin dans plusieurs tables.

**Recommandation :**
- Utiliser `user_roles` comme source de vérité
- Synchroniser `profiles.is_admin` depuis `user_roles`
- Ne pas permettre la modification directe de `profiles.is_admin`

### **4. Fonction is_user_admin()**
✅ **BONNE PRATIQUE** : Fonction centralisée pour vérifier les admins.

**Recommandation :** Utiliser cette fonction dans toutes les politiques RLS.

---

## 📝 ACTIONS REQUISES

### **Priorité 1 (Immédiat) - SÉCURITÉ CRITIQUE**

1. ✅ **Exécuter le script RLS_POLICIES.sql**
   - Activer RLS sur toutes les tables
   - Créer toutes les politiques de sécurité
   - Tester chaque politique

2. ✅ **Migrer les admins vers user_roles**
   - Exécuter le script `MIGRATION_ADMINS.sql`
   - Vérifier que tous les admins sont migrés
   - Tester l'authentification admin

### **Priorité 2 (Court terme) - AMÉLIORATION**

3. ✅ **Synchroniser profiles avec user_roles**
   - Créer un trigger pour synchroniser automatiquement
   - Ou mettre à jour manuellement après migration

4. ✅ **Vérifier les buckets Storage**
   - Bucket `deliverables` : Politiques d'accès configurées ?
   - Bucket `Avatar` : Politiques d'accès configurées ?
   - Vérifier que les fichiers sont accessibles uniquement aux bonnes personnes

### **Priorité 3 (Moyen terme) - OPTIMISATION**

5. ✅ **Nettoyer les tables legacy**
   - Une fois tous les admins migrés, supprimer les fallbacks
   - Documenter la migration complète

6. ✅ **Ajouter des triggers de sécurité**
   - Logs d'audit pour les changements critiques
   - Alertes pour les actions suspectes

---

## 🔐 POLITIQUES RLS RECOMMANDÉES

### **Principe Général**

1. **Clients** : Voient uniquement leurs propres données
2. **Admins** : Voient toutes les données mais modifications limitées
3. **Super Admins** : Accès complet à tout

### **Politiques par Table**

Voir le fichier `RLS_POLICIES.sql` pour les politiques complètes.

---

## 🛡️ SÉCURITÉ STORAGE (Buckets)

### **Bucket `deliverables`**

**Politiques recommandées :**

```sql
-- Les clients peuvent lire les livrables de leurs propres demandes
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

-- Les admins peuvent lire tous les livrables
CREATE POLICY "Admins can read all deliverables"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'deliverables'
  AND public.is_user_admin(auth.uid())
);

-- Seuls les admins peuvent uploader des livrables
CREATE POLICY "Only admins can upload deliverables"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deliverables'
  AND public.is_user_admin(auth.uid())
);
```

### **Bucket `Avatar`**

**Politiques recommandées :**

```sql
-- Les utilisateurs peuvent lire leur propre avatar
CREATE POLICY "Users can read own avatar"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'Avatar'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Les utilisateurs peuvent uploader leur propre avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'Avatar'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Les utilisateurs peuvent mettre à jour leur propre avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'Avatar'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 📊 CHECKLIST DE SÉCURITÉ

### **Avant de mettre en production :**

- [ ] ✅ RLS activé sur toutes les tables
- [ ] ✅ Toutes les politiques RLS créées et testées
- [ ] ✅ Admins migrés vers `user_roles`
- [ ] ✅ Fonction `is_user_admin()` créée et testée
- [ ] ✅ Politiques Storage configurées pour les buckets
- [ ] ✅ Tests d'accès effectués (client, admin, super_admin)
- [ ] ✅ Logs d'audit activés
- [ ] ✅ Backup de la base de données effectué

### **Tests de sécurité à effectuer :**

1. **Test Client :**
   - [ ] Un client ne peut pas voir les demandes d'un autre client
   - [ ] Un client ne peut pas modifier les demandes d'un autre client
   - [ ] Un client ne peut pas voir les analyses d'un autre client

2. **Test Admin :**
   - [ ] Un admin peut voir toutes les demandes
   - [ ] Un admin peut modifier toutes les demandes
   - [ ] Un admin ne peut pas modifier les rôles (réservé aux super_admins)

3. **Test Super Admin :**
   - [ ] Un super_admin peut tout faire
   - [ ] Un super_admin peut modifier les rôles
   - [ ] Un super_admin peut gérer les admins

---

## 🚨 EN CAS DE PROBLÈME

### **Si RLS bloque l'accès légitime :**

1. Vérifier que la fonction `is_user_admin()` fonctionne
2. Vérifier que les politiques sont correctement créées
3. Tester avec un utilisateur admin connu
4. Consulter les logs Supabase pour les erreurs

### **Si un utilisateur voit des données qu'il ne devrait pas :**

1. **URGENT** : Désactiver temporairement l'accès
2. Vérifier les politiques RLS
3. Corriger les politiques problématiques
4. Réactiver l'accès

---

## 📚 RESSOURCES

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [PostgreSQL Security Best Practices](https://www.postgresql.org/docs/current/security.html)

---

**Document créé par MonAP - Chef de Projet Solution360°**  
*Dernière mise à jour : 2026*
