# 🔐 GUIDE DE SÉCURITÉ SOLUTION360°

**Document créé par MonAP - Chef de Projet Solution360°**

---

## 🎯 PRINCIPES DE SÉCURITÉ

### **1. Protection des Données**
- ✅ **Chiffrement** : Toutes les données sensibles sont chiffrées
- ✅ **HTTPS/TLS** : Obligatoire en production
- ✅ **RLS (Row Level Security)** : Activé sur toutes les tables Supabase
- ✅ **Validation** : Toutes les entrées utilisateur sont validées

### **2. Authentification & Autorisation**
- ✅ **Supabase Auth** : Gestion sécurisée des sessions
- ✅ **Middleware** : Protection des routes sensibles
- ✅ **Vérification admin** : Système de rôles et permissions
- ⚠️ **2FA** : À implémenter pour les admins

### **3. Variables d'Environnement**
- ✅ **Séparation** : Variables publiques vs privées
- ✅ **.env.local** : Jamais commité dans Git
- ✅ **.env.example** : Template sans valeurs sensibles
- ✅ **Vercel** : Variables sécurisées dans le dashboard

---

## 🔒 VARIABLES D'ENVIRONNEMENT SÉCURISÉES

### **Variables PUBLIQUES (NEXT_PUBLIC_*)**
Ces variables sont exposées au client. Ne jamais y mettre de secrets.

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_URL=https://votre-domaine.com
```

### **Variables PRIVÉES (jamais NEXT_PUBLIC_*)**
Ces variables sont uniquement côté serveur. Ne jamais les exposer.

```env
SUPABASE_SERVICE_ROLE_KEY=xxx  # ⚠️ TRÈS SENSIBLE
DEEPSEEK_API_KEY=xxx
OPENAI_API_KEY=xxx
WAVE_API_TOKEN=xxx
RESEND_API_KEY=xxx
JWT_SECRET=xxx
```

---

## 🛡️ RLS (ROW LEVEL SECURITY)

### **Tables Protégées :**

#### **`requests`**
- ✅ Clients : Voient uniquement leurs propres demandes
- ✅ Admins : Voient toutes les demandes (via client admin)

#### **`ai_analyses`**
- ✅ Clients : Voient uniquement les analyses de leurs demandes
- ✅ Admins : Voient toutes les analyses

#### **`admin_users`**
- ✅ Clients : Pas d'accès
- ✅ Admins : Voient uniquement leur propre entrée

---

## 🔐 SYSTÈME D'AUTHENTIFICATION

### **Flux de Connexion :**
1. Client saisit email/password
2. Supabase Auth vérifie les credentials
3. Session créée avec JWT
4. Middleware vérifie la session à chaque requête
5. RLS filtre les données selon l'utilisateur

### **Vérification Admin :**
```typescript
// ✅ BONNE PRATIQUE : Centralisé dans lib/admin/permissions.ts
import { getUserRole } from '@/lib/admin/permissions';

const roleData = await getUserRole(user.id);
const isAdmin = roleData?.role === 'admin' || roleData?.role === 'super_admin';
```

### **⚠️ À ÉVITER :**
```typescript
// ❌ MAUVAISE PRATIQUE : Emails hardcodés
const adminEmails = ['pacous2000@gmail.com', 'admin@solution360.app'];
if (adminEmails.includes(user.email)) { ... }
```

---

## 🚨 PROTECTION DES ROUTES

### **Middleware (`middleware.ts`)**
- ✅ Vérifie l'authentification
- ✅ Redirige vers `/login` si non authentifié
- ✅ Protège les routes `/admin/*`

### **Layouts de Protection :**
- ✅ `(dashboard)/layout.tsx` : Vérifie l'authentification
- ✅ `admin/layout.tsx` : Vérifie le rôle admin

---

## 📤 UPLOAD DE FICHIERS

### **Sécurité Supabase Storage :**
- ✅ Bucket `deliverables` configuré avec policies
- ✅ Validation des types de fichiers
- ✅ Limite de taille (à configurer)
- ✅ Scan antivirus (à implémenter)

### **Bonnes Pratiques :**
```typescript
// ✅ Validation du type de fichier
const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
if (!allowedTypes.includes(file.type)) {
  throw new Error('Type de fichier non autorisé');
}

// ✅ Validation de la taille
const maxSize = 10 * 1024 * 1024; // 10 MB
if (file.size > maxSize) {
  throw new Error('Fichier trop volumineux');
}
```

---

## 💳 PAIEMENTS SÉCURISÉS

### **Wave API :**
- ✅ Token API stocké en variable d'environnement
- ✅ Validation des webhooks
- ✅ Vérification de la signature

### **CinetPay :**
- ✅ Clés API stockées en variables d'environnement
- ✅ Validation des callbacks
- ✅ Vérification de l'intégrité

---

## 🔍 AUDIT & LOGS

### **Logs à Enregistrer :**
- ✅ Connexions/déconnexions
- ✅ Changements de statut
- ✅ Upload de fichiers
- ✅ Modifications de prix
- ✅ Accès admin

### **Format des Logs :**
```typescript
{
  timestamp: '2026-01-07T10:30:00Z',
  user_id: 'xxx',
  action: 'status_changed',
  resource: 'request',
  resource_id: 'xxx',
  details: { from: 'pending', to: 'in_progress' }
}
```

---

## 🚫 PROTECTION CONTRE LES ATTAQUES

### **Rate Limiting :**
- ✅ Limite les requêtes par IP
- ✅ Protection contre le spam
- ✅ Protection contre les attaques DDoS

### **Validation des Entrées :**
- ✅ Sanitization de tous les inputs
- ✅ Validation des types
- ✅ Protection XSS
- ✅ Protection SQL Injection (via Supabase)

### **CORS :**
- ✅ Configuration stricte des origines autorisées
- ✅ Headers de sécurité HTTP

---

## 📋 CHECKLIST DE SÉCURITÉ

### **Avant chaque déploiement :**
- [ ] Vérifier que `.env.local` n'est pas commité
- [ ] Vérifier que toutes les variables d'environnement sont définies
- [ ] Tester l'authentification
- [ ] Vérifier les permissions RLS
- [ ] Tester les uploads de fichiers
- [ ] Vérifier les validations d'entrée

### **Mensuel :**
- [ ] Réviser les logs d'accès
- [ ] Vérifier l'utilisation des clés API
- [ ] Mettre à jour les dépendances
- [ ] Réviser les permissions admin
- [ ] Tester les sauvegardes

### **Trimestriel :**
- [ ] Audit de sécurité complet
- [ ] Test de pénétration
- [ ] Révision des politiques RLS
- [ ] Mise à jour des secrets

---

## 🆘 EN CAS DE BRÈCHE

### **Actions Immédiates :**
1. 🔴 Révoquer toutes les clés API compromises
2. 🔴 Changer tous les mots de passe admin
3. 🔴 Analyser les logs pour identifier la source
4. 🔴 Notifier les utilisateurs affectés
5. 🔴 Documenter l'incident

### **Prévention :**
- ✅ Monitoring continu
- ✅ Alertes automatiques
- ✅ Sauvegardes régulières
- ✅ Plan de réponse aux incidents

---

## 📚 RESSOURCES

- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Document créé par MonAP - Chef de Projet Solution360°**  
*Dernière mise à jour : 2026*
