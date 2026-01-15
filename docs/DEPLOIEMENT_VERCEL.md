# 🚀 Guide de Déploiement Solution360° sur Vercel

**Guide complet pas à pas pour déployer Solution360° sur Vercel**

---

## 📋 PRÉREQUIS

- ✅ Compte GitHub avec le repository `Solution360-pwa` poussé
- ✅ Compte Vercel (gratuit disponible sur [vercel.com](https://vercel.com))
- ✅ Compte Supabase configuré
- ✅ Clés API Supabase disponibles

---

## 🎯 ÉTAPE 1 : Créer un compte Vercel

1. **Aller sur [vercel.com](https://vercel.com)**
2. **Cliquer sur "Sign Up"**
3. **Choisir "Continue with GitHub"** (recommandé)
4. **Autoriser Vercel à accéder à votre GitHub**

---

## 🎯 ÉTAPE 2 : Importer le projet depuis GitHub

1. **Dans le dashboard Vercel, cliquer sur "Add New..." → "Project"**
2. **Sélectionner le repository `Pacousstar/Solution360-pwa`**
3. **Cliquer sur "Import"**

---

## 🎯 ÉTAPE 3 : Configuration du projet

### 3.1 Framework Preset
- **Framework Preset** : `Next.js` (détecté automatiquement)
- **Root Directory** : `./` (laisser par défaut)
- **Build Command** : `npm run build` (déjà configuré)
- **Output Directory** : `.next` (déjà configuré)
- **Install Command** : `npm install` (déjà configuré)

### 3.2 Variables d'environnement

**⚠️ IMPORTANT : Configurer TOUTES les variables avant de déployer**

Cliquer sur **"Environment Variables"** et ajouter :

#### 🔴 OBLIGATOIRES (Supabase)

```
NEXT_PUBLIC_SUPABASE_URL
```
- **Valeur** : `https://votre-projet.supabase.co`
- **Environnements** : ✅ Production, ✅ Preview, ✅ Development

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
- **Valeur** : Votre clé anon Supabase
- **Environnements** : ✅ Production, ✅ Preview, ✅ Development

```
SUPABASE_SERVICE_ROLE_KEY
```
- **Valeur** : Votre service role key Supabase
- **Environnements** : ✅ Production, ✅ Preview, ✅ Development

#### 🟡 RECOMMANDÉES (IA)

```
DEEPSEEK_API_KEY
```
- **Valeur** : Votre clé API DeepSeek
- **Environnements** : ✅ Production, ✅ Preview, ✅ Development

#### 🟢 OPTIONNELLES

```
NEXT_PUBLIC_URL
```
- **Valeur** : `https://votre-projet.vercel.app` (sera mis à jour automatiquement)
- **Environnements** : ✅ Production, ✅ Preview, ✅ Development

```
OPENAI_API_KEY
```
- **Valeur** : Votre clé OpenAI (si vous utilisez GPT-4o)
- **Environnements** : ✅ Production, ✅ Preview, ✅ Development

```
RESEND_API_KEY
```
- **Valeur** : Votre clé Resend pour les emails
- **Environnements** : ✅ Production, ✅ Preview, ✅ Development

```
WAVE_API_TOKEN
```
- **Valeur** : Votre token Wave pour Mobile Money
- **Environnements** : ✅ Production, ✅ Preview, ✅ Development

```
CINETPAY_API_KEY
```
- **Valeur** : Votre clé CinetPay
- **Environnements** : ✅ Production, ✅ Preview, ✅ Development

```
CINETPAY_SITE_ID
```
- **Valeur** : Votre site ID CinetPay
- **Environnements** : ✅ Production, ✅ Preview, ✅ Development

---

## 🎯 ÉTAPE 4 : Settings avancés (optionnel)

### 4.1 Build & Development Settings

1. **Cliquer sur "Settings" → "General"**
2. **Node.js Version** : `20.x` (recommandé)
3. **Install Command** : `npm install` (par défaut)
4. **Build Command** : `npm run build` (par défaut)
5. **Output Directory** : `.next` (par défaut)

### 4.2 Domaine personnalisé (optionnel)

1. **Settings → Domains**
2. **Ajouter votre domaine** (ex: `solution360.app`)
3. **Suivre les instructions DNS** fournies par Vercel

---

## 🎯 ÉTAPE 5 : Déployer

1. **Vérifier que toutes les variables d'environnement sont configurées**
2. **Cliquer sur "Deploy"**
3. **Attendre la fin du build** (2-5 minutes)

---

## 🎯 ÉTAPE 6 : Vérifier le déploiement

### 6.1 Vérifier les logs

1. **Cliquer sur le déploiement**
2. **Ouvrir l'onglet "Build Logs"**
3. **Vérifier qu'il n'y a pas d'erreurs**

### 6.2 Tester l'application

1. **Cliquer sur le lien de déploiement** (ex: `solution360-pwa.vercel.app`)
2. **Tester la page d'accueil**
3. **Tester l'inscription/connexion**
4. **Vérifier que Supabase fonctionne**

---

## 🎯 ÉTAPE 7 : Configuration Supabase pour production

### 7.1 URLs autorisées dans Supabase

1. **Aller sur [supabase.com](https://supabase.com)**
2. **Sélectionner votre projet**
3. **Settings → Authentication → URL Configuration**
4. **Ajouter dans "Site URL"** : `https://votre-projet.vercel.app`
5. **Ajouter dans "Redirect URLs"** :
   - `https://votre-projet.vercel.app/auth/callback`
   - `https://votre-projet.vercel.app/**`

### 7.2 RLS (Row Level Security)

- ✅ Vérifier que RLS est activé sur toutes les tables
- ✅ Vérifier les politiques de sécurité

---

## 🎯 ÉTAPE 8 : Déploiements automatiques

### 8.1 Configuration Git

Vercel déploie automatiquement :
- ✅ **Production** : à chaque push sur `main`
- ✅ **Preview** : à chaque pull request
- ✅ **Development** : branches de développement

### 8.2 Webhooks (optionnel)

Pour notifier d'autres services après déploiement :
1. **Settings → Git → Deploy Hooks**
2. **Créer un webhook** si nécessaire

---

## 🔧 DÉPANNAGE

### Erreur : "Environment variables missing"

**Solution** : Vérifier que toutes les variables obligatoires sont configurées dans Vercel

### Erreur : "Build failed"

**Solution** :
1. Vérifier les logs de build
2. Vérifier que `package.json` est correct
3. Vérifier que toutes les dépendances sont installées

### Erreur : "Supabase connection failed"

**Solution** :
1. Vérifier les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Vérifier les URLs autorisées dans Supabase
3. Vérifier que RLS est correctement configuré

### Erreur : "Module not found"

**Solution** :
1. Vérifier que toutes les dépendances sont dans `package.json`
2. Exécuter `npm install` localement pour vérifier

---

## 📊 MONITORING

### Vercel Analytics (optionnel)

1. **Settings → Analytics**
2. **Activer Vercel Analytics** (gratuit pour les projets open source)

### Logs en temps réel

1. **Dashboard → Votre projet → Logs**
2. **Voir les logs en temps réel**

---

## 🔐 SÉCURITÉ

### Bonnes pratiques

1. ✅ **Ne jamais commiter** `.env.local`
2. ✅ **Utiliser des clés différentes** pour dev/prod
3. ✅ **Activer 2FA** sur Vercel et Supabase
4. ✅ **Surveiller les logs** régulièrement
5. ✅ **Mettre à jour les dépendances** régulièrement

---

## 📝 CHECKLIST FINALE

Avant de considérer le déploiement comme terminé :

- [ ] Toutes les variables d'environnement sont configurées
- [ ] Le build passe sans erreurs
- [ ] L'application est accessible sur l'URL Vercel
- [ ] L'authentification Supabase fonctionne
- [ ] Les URLs sont configurées dans Supabase
- [ ] RLS est activé et testé
- [ ] Le domaine personnalisé est configuré (si applicable)
- [ ] Les déploiements automatiques fonctionnent

---

## 🎉 FÉLICITATIONS !

Votre application Solution360° est maintenant déployée sur Vercel ! 🚀

**URL de production** : `https://votre-projet.vercel.app`

---

**Document créé par MonAP - Chef de Projet Solution360°**  
**Dernière mise à jour** : 2026

