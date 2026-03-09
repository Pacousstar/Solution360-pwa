# 📧 CONFIGURATION DES EMAILS - SOLUTION360°
**Guide de configuration Resend pour les notifications email**

---

## 🎯 PRÉREQUIS

Avant de pouvoir envoyer des emails, vous devez :
1. ✅ Installer Resend (déjà fait : `npm install resend`)
2. ❌ Créer un compte Resend
3. ❌ Obtenir une API Key
4. ❌ Configurer le domaine (ou utiliser le domaine de test Resend)

---

## 📝 ÉTAPE 1 : CRÉER UN COMPTE RESEND

1. **Aller sur https://resend.com/**
2. **Cliquer sur "Sign Up"**
3. **Créer un compte** :
   - Email : Votre email professionnel
   - Mot de passe : Fort et sécurisé
   - Vérifier votre email

---

## 🔑 ÉTAPE 2 : OBTENIR L'API KEY

1. **Se connecter à Resend**
2. **Aller dans "API Keys"** (menu de gauche)
3. **Cliquer sur "Create API Key"**
4. **Configurer la clé** :
   - **Name** : `Solution360 Production` (ou `Solution360 Development`)
   - **Permission** : `Sending access` (suffisant pour l'instant)
   - **Domains** : Sélectionner votre domaine (ou laisser vide pour le domaine de test)
5. **Cliquer sur "Create"**
6. **Copier la clé API** (elle ne sera affichée qu'une seule fois !)

**⚠️ IMPORTANT :** Gardez cette clé secrète ! Ne la partagez jamais publiquement.

---

## 🌐 ÉTAPE 3 : CONFIGURER LE DOMAINE (PRODUCTION)

### **Option A : Utiliser le domaine de test Resend (DÉVELOPPEMENT)**

Si vous êtes en développement, vous pouvez utiliser le domaine de test Resend :
- **Email "from"** : `onboarding@resend.dev`
- **Avantage** : Pas de configuration nécessaire
- **Inconvénient** : Limité à 100 emails/jour, email d'expéditeur = "onboarding@resend.dev"

### **Option B : Configurer votre propre domaine (PRODUCTION)**

Pour utiliser votre propre domaine (ex: `noreply@solution360.app`) :

1. **Dans Resend**, aller dans **"Domains"**
2. **Cliquer sur "Add Domain"**
3. **Entrer votre domaine** : `solution360.app` (ou votre domaine)
4. **Suivre les instructions DNS** :
   - Ajouter les enregistrements DNS demandés dans votre gestionnaire de domaine
   - Attendre la vérification (peut prendre jusqu'à 48h)
5. **Une fois vérifié**, vous pouvez utiliser `noreply@solution360.app` comme expéditeur

**Enregistrements DNS à ajouter :**
```
Type    Name                Value
-----   ----                -----
TXT     @                   v=spf1 include:resend.com ~all
TXT     resend._domainkey   [valeur fournie par Resend]
CNAME   resend              [valeur fournie par Resend]
```

---

## ⚙️ ÉTAPE 4 : CONFIGURER LES VARIABLES D'ENVIRONNEMENT

### **En local (`.env.local`)**

Ajouter dans `.env.local` :

```env
# Resend Email Service
RESEND_API_KEY=re_U6iJqftw_QFtiJNtaN1AS87EAhZZLpsFx

# URL de l'application (pour les liens dans les emails)
NEXT_PUBLIC_URL=http://localhost:3000
```

### **Sur Vercel**

1. **Aller dans votre projet Vercel**
2. **Settings** → **Environment Variables**
3. **Ajouter les variables** :
   - **Key** : `RESEND_API_KEY`
   - **Value** : Votre clé API Resend
   - **Environment** : Production, Preview, Development (tous)
4. **Ajouter aussi** :
   - **Key** : `NEXT_PUBLIC_URL`
   - **Value** : `solution360-pwa.vercel.app` (ou votre domaine custom)
   - **Environment** : Production, Preview, Development

---

## 📧 ÉTAPE 5 : MODIFIER L'EXPÉDITEUR (OPTIONNEL)

Si vous avez configuré votre propre domaine, modifiez `src/lib/emails.ts` :

```typescript
// Ligne 13 dans emails.ts
from = 'Solution360° <noreply@solution360.app>', // Votre domaine vérifié
```

Sinon, pour le développement avec le domaine de test :

```typescript
from = 'Solution360° <onboarding@resend.dev>', // Domaine de test Resend
```

---

## ✅ ÉTAPE 6 : TESTER LES EMAILS

### **Test en développement**

1. **Démarrer le serveur** : `npm run dev`
2. **Créer une demande** ou **envoyer un devis**
3. **Vérifier les logs** dans la console :
   - Si `RESEND_API_KEY` n'est pas défini : `📧 [DEV MODE] Email à envoyer:`
   - Si `RESEND_API_KEY` est défini : Email envoyé réellement

### **Test en production**

1. **Déployer sur Vercel** avec les variables d'environnement configurées
2. **Tester le workflow complet** :
   - Créer une demande → Email admin (si configuré)
   - Envoyer un devis → Email client avec devis
   - Envoyer une réponse → Email client avec réponse

---

## 📋 EMAILS IMPLÉMENTÉS

### **✅ Déjà fonctionnels :**

1. **Email Devis** (`getQuoteEmailTemplate`)
   - Envoyé quand l'admin envoie un devis
   - Contient : Prix final, justification, lien vers la demande

2. **Email Réponse** (`getResponseEmailTemplate`)
   - Envoyé quand l'admin répond au client
   - Contient : Message personnalisé, lien vers la demande

### **📝 À implémenter plus tard :**

3. **Email Confirmation Paiement** (`getPaymentConfirmationEmailTemplate`)
   - À envoyer dans le webhook de paiement
   - Contient : Montant payé, confirmation, lien vers la demande

4. **Email Livraison** (`getDeliveryEmailTemplate`)
   - À envoyer quand le statut passe à `delivered`
   - Contient : Confirmation de livraison, lien vers les livrables

5. **Email Notification Admin** (`getAdminNotificationEmailTemplate`)
   - À envoyer quand une nouvelle demande est créée
   - Contient : Titre de la demande, email client, lien vers la demande admin

---

## 🔍 DÉPANNAGE

### **Erreur : "Missing API Key"**

**Solution :**
- Vérifier que `RESEND_API_KEY` est bien défini dans `.env.local` (local) ou Vercel (production)
- Redémarrer le serveur après avoir ajouté la variable

### **Erreur : "Domain not verified"**

**Solution :**
- Vérifier que votre domaine est bien vérifié dans Resend
- Utiliser `onboarding@resend.dev` pour le développement

### **Emails non reçus**

**Solutions :**
1. **Vérifier les logs** dans la console
2. **Vérifier les spams** dans la boîte de réception
3. **Vérifier que l'adresse email est valide**
4. **Vérifier les limites Resend** :
   - Domaine de test : 100 emails/jour
   - Domaine vérifié : Selon votre plan

### **Mode développement (sans Resend)**

Si vous n'avez pas encore configuré Resend, les emails seront simplement **loggés dans la console** sans être envoyés. C'est le comportement par défaut en mode développement.

Pour activer les emails réels, ajoutez simplement `RESEND_API_KEY` dans vos variables d'environnement.

---

## 📚 RESSOURCES

- **Documentation Resend** : https://resend.com/docs
- **API Reference** : https://resend.com/docs/api-reference
- **Pricing** : https://resend.com/pricing (Plan gratuit : 3000 emails/mois)

---

## ✅ CHECKLIST DE CONFIGURATION

- [ ] Compte Resend créé
- [ ] API Key obtenue
- [ ] `RESEND_API_KEY` ajouté dans `.env.local` (local)
- [ ] `RESEND_API_KEY` ajouté dans Vercel (production)
- [ ] `NEXT_PUBLIC_URL` configuré
- [ ] Domaine configuré (optionnel, pour production)
- [ ] Test d'envoi réussi

---

**Document créé par MonAP - Chef de Projet Solution360°**  
*Dernière mise à jour : 2026-01-01*

