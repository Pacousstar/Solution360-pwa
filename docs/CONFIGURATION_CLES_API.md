# 🔑 GUIDE DE CONFIGURATION DES CLÉS API
**Solution360° - Par MonAP**

---

## 📋 VUE D'ENSEMBLE

Ce guide vous explique comment obtenir et configurer les clés API nécessaires pour Solution360° :
- **Wave** : Paiements Mobile Money
- **CinetPay** : Paiements Mobile Money + Cartes bancaires
- **Resend** : Envoi d'emails transactionnels

---

## 💳 1. CONFIGURATION WAVE API

### **Étape 1 : Créer un compte Wave**

1. Allez sur [https://www.wave.com](https://www.wave.com)
2. Cliquez sur **"S'inscrire"** ou **"Créer un compte"**
3. Remplissez le formulaire avec vos informations :
   - Nom complet
   - Email professionnel
   - Numéro de téléphone
   - Pays (Côte d'Ivoire, Sénégal, etc.)
4. Vérifiez votre email et votre téléphone

### **Étape 2 : Activer Wave Business**

1. Connectez-vous à votre compte Wave
2. Allez dans **"Paramètres"** → **"Compte Business"**
3. Cliquez sur **"Créer un compte Business"**
4. Remplissez les informations de votre entreprise :
   - Nom de l'entreprise
   - Adresse
   - Numéro SIRET/RC (si applicable)
   - Secteur d'activité
5. Téléchargez les documents requis (pièce d'identité, justificatif de domicile)
6. Attendez la validation (généralement 24-48h)

### **Étape 3 : Accéder à l'API Wave**

1. Une fois votre compte Business validé, connectez-vous
2. Allez dans **"Paramètres"** → **"API"** ou **"Développeurs"**
3. Si l'option API n'est pas visible :
   - Contactez le support Wave : support@wave.com
   - Demandez l'activation de l'accès API pour votre compte Business
   - Mentionnez que vous souhaitez intégrer les paiements dans votre application web

### **Étape 4 : Créer une clé API**

1. Dans la section **"API"**, cliquez sur **"Créer une nouvelle clé API"**
2. Donnez un nom à votre clé (ex: "Solution360 Production")
3. Sélectionnez les permissions nécessaires :
   - ✅ **Créer des paiements**
   - ✅ **Voir les transactions**
   - ❌ Ne pas activer les permissions inutiles (sécurité)
4. Cliquez sur **"Générer"**
5. **⚠️ IMPORTANT** : Copiez immédiatement la clé API
   - Elle ne sera affichée qu'une seule fois
   - Si vous la perdez, vous devrez en créer une nouvelle

### **Étape 5 : Configurer dans Solution360°**

1. Ouvrez votre fichier `.env.local` à la racine du projet
2. Ajoutez la ligne suivante :
   ```env
   WAVE_API_TOKEN=votre_clé_api_wave_ici
   ```
3. Remplacez `votre_clé_api_wave_ici` par la clé que vous avez copiée
4. Sauvegardez le fichier

### **Étape 6 : Tester l'intégration**

1. Redémarrez votre serveur de développement : `npm run dev`
2. Créez une demande de test dans Solution360°
3. Essayez d'initier un paiement Wave
4. Vérifiez les logs pour voir si l'API répond correctement

### **📝 Notes importantes Wave**

- **Mode Sandbox** : Wave peut proposer un environnement de test. Utilisez-le pour tester sans risques
- **Frais** : Wave prend généralement une commission de 1-2% par transaction
- **Webhooks** : Configurez l'URL de callback dans les paramètres API : `https://votre-domaine.com/api/payment/wave-callback`
- **Support** : support@wave.com ou [https://help.wave.com](https://help.wave.com)

---

## 💳 2. CONFIGURATION CINETPAY

### **Étape 1 : Créer un compte CinetPay**

1. Allez sur [https://www.cinetpay.com](https://www.cinetpay.com)
2. Cliquez sur **"S'inscrire"** ou **"Créer un compte"**
3. Choisissez **"Compte Marchand"** (pas compte particulier)
4. Remplissez le formulaire :
   - Nom de l'entreprise
   - Email professionnel
   - Numéro de téléphone
   - Pays
   - Type d'activité
5. Acceptez les conditions générales
6. Cliquez sur **"Créer mon compte"**

### **Étape 2 : Vérifier votre compte**

1. Vérifiez votre email (cliquez sur le lien de confirmation)
2. Connectez-vous à votre compte CinetPay
3. Complétez votre profil :
   - Informations de l'entreprise
   - Adresse complète
   - Documents légaux (statuts, K-bis, etc.)
4. Soumettez votre dossier pour validation

### **Étape 3 : Obtenir votre Site ID et API Key**

1. Une fois votre compte validé (24-48h), connectez-vous
2. Allez dans **"Paramètres"** → **"API"** ou **"Intégration"**
3. Vous verrez deux informations importantes :
   - **Site ID** : Identifiant unique de votre site marchand (ex: `123456`)
   - **API Key** : Clé secrète pour authentifier vos requêtes API

### **Étape 4 : Générer une nouvelle API Key (si nécessaire)**

1. Si vous n'avez pas encore d'API Key, cliquez sur **"Générer une clé API"**
2. Donnez un nom à votre clé (ex: "Solution360 Production")
3. Sélectionnez les permissions :
   - ✅ **Initier des paiements**
   - ✅ **Vérifier le statut des paiements**
   - ✅ **Recevoir les notifications (webhooks)**
4. Cliquez sur **"Générer"**
5. **⚠️ IMPORTANT** : Copiez immédiatement l'API Key
   - Elle ne sera affichée qu'une seule fois

### **Étape 5 : Configurer dans Solution360°**

1. Ouvrez votre fichier `.env.local` à la racine du projet
2. Ajoutez les lignes suivantes :
   ```env
   CINETPAY_API_KEY=votre_api_key_cinetpay_ici
   CINETPAY_SITE_ID=votre_site_id_ici
   ```
3. Remplacez les valeurs par celles de votre compte CinetPay
4. Sauvegardez le fichier

### **Étape 6 : Configurer les webhooks**

1. Dans votre dashboard CinetPay, allez dans **"Paramètres"** → **"Notifications"**
2. Ajoutez l'URL de notification :
   ```
   https://votre-domaine.com/api/payment/cinetpay-callback
   ```
3. Sélectionnez les événements à notifier :
   - ✅ **Paiement accepté**
   - ✅ **Paiement refusé**
   - ✅ **Paiement annulé**
4. Sauvegardez les paramètres

### **Étape 7 : Tester l'intégration**

1. Redémarrez votre serveur : `npm run dev`
2. Créez une demande de test
3. Essayez d'initier un paiement CinetPay
4. Vérifiez les logs pour confirmer que l'API répond

### **📝 Notes importantes CinetPay**

- **Mode Test** : CinetPay propose un environnement de test. Utilisez-le avant la production
- **Frais** : Commission de 1.5-3% selon le type de paiement
- **Support** : support@cinetpay.com ou [https://help.cinetpay.com](https://help.cinetpay.com)
- **Documentation** : [https://doc.cinetpay.com](https://doc.cinetpay.com)

---

## 📧 3. CONFIGURATION RESEND (EMAILS)

### **Étape 1 : Créer un compte Resend**

1. Allez sur [https://resend.com](https://resend.com)
2. Cliquez sur **"Sign Up"** ou **"Get Started"**
3. Choisissez votre méthode d'inscription :
   - **GitHub** (recommandé pour les développeurs)
   - **Google**
   - **Email** (créer un compte avec email/mot de passe)
4. Remplissez le formulaire si nécessaire :
   - Nom
   - Email professionnel
   - Mot de passe (si inscription par email)

### **Étape 2 : Vérifier votre email**

1. Vérifiez votre boîte email
2. Cliquez sur le lien de confirmation envoyé par Resend
3. Vous serez redirigé vers votre dashboard Resend

### **Étape 3 : Obtenir votre API Key**

1. Une fois connecté, allez dans **"API Keys"** dans le menu de gauche
2. Cliquez sur **"Create API Key"**
3. Donnez un nom à votre clé (ex: "Solution360 Production")
4. Sélectionnez les permissions :
   - ✅ **Send emails** (envoyer des emails)
   - ❌ Ne pas activer **Delete domains** (sécurité)
5. Cliquez sur **"Add"**
6. **⚠️ IMPORTANT** : Copiez immédiatement l'API Key
   - Elle commence par `re_` (ex: `re_123456789abcdef`)
   - Elle ne sera affichée qu'une seule fois

### **Étape 4 : Vérifier votre domaine (IMPORTANT)**

Pour envoyer des emails depuis votre propre domaine (ex: noreply@solution360.app) :

1. Allez dans **"Domains"** dans le menu de gauche
2. Cliquez sur **"Add Domain"**
3. Entrez votre domaine (ex: `solution360.app`)
4. Resend vous donnera des enregistrements DNS à ajouter :
   - **TXT** pour la vérification
   - **MX** pour recevoir les emails (optionnel)
   - **SPF** pour l'authentification
   - **DKIM** pour la signature
5. Ajoutez ces enregistrements dans votre gestionnaire DNS :
   - Allez sur votre hébergeur de domaine (GoDaddy, Namecheap, etc.)
   - Accédez aux paramètres DNS
   - Ajoutez chaque enregistrement avec les valeurs fournies par Resend
6. Attendez la vérification (peut prendre jusqu'à 48h, généralement quelques minutes)
7. Une fois vérifié, vous verrez un ✅ vert à côté de votre domaine

### **Étape 5 : Configurer dans Solution360°**

1. Ouvrez votre fichier `.env.local` à la racine du projet
2. Ajoutez la ligne suivante :
   ```env
   RESEND_API_KEY=re_votre_clé_api_resend_ici
   ```
3. Remplacez `re_votre_clé_api_resend_ici` par votre clé API
4. Si vous avez vérifié un domaine, vous pouvez aussi ajouter :
   ```env
   RESEND_FROM_EMAIL=noreply@solution360.app
   ```
   (Sinon, utilisez l'email par défaut de Resend)
5. Sauvegardez le fichier

### **Étape 6 : Modifier l'email d'expéditeur (optionnel)**

Si vous avez vérifié votre domaine, modifiez `src/lib/emails.ts` :

```typescript
from = 'Solution360° <noreply@solution360.app>', // Votre domaine vérifié
```

Sinon, utilisez l'email par défaut de Resend (limité à 100 emails/jour en mode gratuit).

### **Étape 7 : Tester l'envoi d'emails**

1. Redémarrez votre serveur : `npm run dev`
2. Créez une demande de test
3. Envoyez un devis depuis l'interface admin
4. Vérifiez que l'email arrive bien dans la boîte du client
5. Vérifiez les logs dans Resend Dashboard → **"Logs"** pour voir les détails

### **📝 Notes importantes Resend**

- **Plan gratuit** : 3 000 emails/mois, 100 emails/jour
- **Plan payant** : À partir de $20/mois pour 50 000 emails
- **Mode développement** : Si `RESEND_API_KEY` n'est pas défini, les emails sont loggés dans la console (pas d'envoi réel)
- **Support** : support@resend.com ou [https://resend.com/docs](https://resend.com/docs)
- **Documentation** : [https://resend.com/docs](https://resend.com/docs)

---

## 🔒 4. SÉCURITÉ DES CLÉS API

### **Bonnes pratiques**

1. **Ne jamais commiter `.env.local`** :
   - Le fichier `.env.local` est déjà dans `.gitignore`
   - Vérifiez qu'il n'est pas dans Git : `git status`

2. **Utiliser des clés différentes pour dev/prod** :
   - Créez des clés API séparées pour le développement et la production
   - Utilisez `.env.local` pour le développement
   - Configurez les variables d'environnement dans Vercel/Netlify pour la production

3. **Rotation régulière des clés** :
   - Changez vos clés API tous les 3-6 mois
   - Si une clé est compromise, révoquez-la immédiatement

4. **Limiter les permissions** :
   - N'activez que les permissions nécessaires
   - Ne donnez jamais accès complet si ce n'est pas nécessaire

5. **Surveiller l'utilisation** :
   - Vérifiez régulièrement les logs d'utilisation dans chaque service
   - Configurez des alertes en cas d'activité suspecte

---

## ✅ 5. CHECKLIST DE CONFIGURATION

### **Wave**
- [ ] Compte Wave Business créé et validé
- [ ] Clé API Wave générée
- [ ] `WAVE_API_TOKEN` ajouté dans `.env.local`
- [ ] URL de webhook configurée dans Wave
- [ ] Test de paiement réussi

### **CinetPay**
- [ ] Compte CinetPay Marchand créé et validé
- [ ] Site ID récupéré
- [ ] API Key générée
- [ ] `CINETPAY_API_KEY` et `CINETPAY_SITE_ID` ajoutés dans `.env.local`
- [ ] URL de webhook configurée dans CinetPay
- [ ] Test de paiement réussi

### **Resend**
- [ ] Compte Resend créé
- [ ] API Key générée
- [ ] `RESEND_API_KEY` ajouté dans `.env.local`
- [ ] Domaine vérifié (optionnel mais recommandé)
- [ ] Test d'envoi d'email réussi

---

## 🚨 6. DÉPANNAGE

### **Problème : "Invalid API Key"**

**Solutions :**
1. Vérifiez que la clé est bien copiée sans espaces avant/après
2. Vérifiez que vous utilisez la bonne clé (dev vs prod)
3. Vérifiez que la clé n'a pas expiré ou été révoquée
4. Regénérez une nouvelle clé si nécessaire

### **Problème : "Webhook not received"**

**Solutions :**
1. Vérifiez que l'URL de webhook est accessible publiquement (pas localhost)
2. Vérifiez que l'URL est correcte dans les paramètres du provider
3. Utilisez un service comme [ngrok](https://ngrok.com) pour tester en local
4. Vérifiez les logs de votre serveur pour voir les requêtes reçues

### **Problème : "Email not sent"**

**Solutions :**
1. Vérifiez que `RESEND_API_KEY` est bien défini dans `.env.local`
2. Vérifiez les logs dans Resend Dashboard → Logs
3. Vérifiez que votre domaine est vérifié (si vous utilisez un domaine personnalisé)
4. Vérifiez que vous n'avez pas dépassé la limite du plan gratuit (100 emails/jour)

### **Problème : "Payment failed"**

**Solutions :**
1. Vérifiez que les clés API sont correctes
2. Vérifiez que vous utilisez le bon environnement (test vs production)
3. Vérifiez les logs de votre serveur pour voir l'erreur exacte
4. Contactez le support du provider si le problème persiste

---

## 📞 7. CONTACTS SUPPORT

- **Wave** : support@wave.com | [https://help.wave.com](https://help.wave.com)
- **CinetPay** : support@cinetpay.com | [https://help.cinetpay.com](https://help.cinetpay.com)
- **Resend** : support@resend.com | [https://resend.com/docs](https://resend.com/docs)

---

## 🎉 CONCLUSION

Une fois toutes les clés API configurées, votre système Solution360° sera prêt à :
- ✅ Recevoir des paiements via Wave et CinetPay
- ✅ Envoyer des emails automatiques aux clients
- ✅ Gérer le workflow complet de demande → paiement → livraison

**N'oubliez pas de tester chaque intégration avant de passer en production !**

---

**Signé : MonAP - Chef de Projet Solution360°**  
*Document créé le : 2026*
