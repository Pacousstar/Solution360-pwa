# 🔄 WORKFLOW COMPLET : TRAITER UNE DEMANDE DE A À Z
**Solution360° - Guide Opérationnel**

---

## 📋 VUE D'ENSEMBLE

Ce document décrit le processus complet de traitement d'une demande client, de la soumission initiale jusqu'à la livraison finale.

---

## 🎯 ÉTAPES DU WORKFLOW

### **ÉTAPE 1 : RÉCEPTION DE LA DEMANDE** 📥

**Côté Client :**
1. Client accède à `/nouvelle-demande`
2. Remplit le formulaire :
   - Titre du projet
   - Type de projet (Site web, Application, Campagne, Audit, Automatisation, Autre)
   - Budget proposé (optionnel, en FCFA)
   - Description détaillée
   - Complexité (Simple, Moyen, Complexe)
   - Urgence (Normal, Urgent, Critique)
3. Soumet la demande
4. Reçoit un accusé de réception automatique

**Côté Système :**
- Demande créée dans table `requests` avec statut `pending`
- `ai_phase` initialisé à `none`
- Notification automatique envoyée à l'admin

**Statut :** `pending` (En attente)

---

### **ÉTAPE 2 : ANALYSE PAR L'ADMIN** 🔍

**Côté Admin :**
1. Admin accède à `/admin/demandes`
2. Voit la nouvelle demande dans la liste
3. Clique sur la demande pour accéder à `/admin/detail/[id]`
4. Consulte les informations :
   - Description complète
   - Budget proposé par le client
   - Complexité et urgence
   - Informations client (email, nom)

**Actions possibles :**
- Lire la demande en détail
- Vérifier les fichiers joints (si présents)
- Noter des observations internes

**Statut :** `pending` → `analysis` (En analyse)

---

### **ÉTAPE 3 : ANALYSE IA (OPTIONNEL MAIS RECOMMANDÉ)** 🤖

**Côté Admin :**
1. Admin accède à `/admin/gerer/[id]`
2. Clique sur "Analyser avec IA" (si disponible)
3. L'IA (DeepSeek) analyse la demande :
   - Reformule le besoin
   - Propose une estimation de prix en FCFA
   - Liste les livrables attendus
   - Pose des questions de clarification si nécessaire

**Résultat stocké dans :**
- Table `ai_analyses` (résumé, livrables, prix estimé, questions)
- `ai_phase` mis à jour à `deepseek`

**⚠️ IMPORTANT :** L'IA **NE REMPLACE PAS** l'admin. Elle **assiste** uniquement.

**Statut :** `analysis` (En analyse)

---

### **ÉTAPE 4 : TARIFICATION** 💰

**Côté Admin :**
1. Admin accède à `/admin/gerer/[id]`
2. Va dans l'onglet **"Tarification"**
3. Consulte l'estimation IA (si disponible)
4. **Décide du prix final** :
   - Peut utiliser l'estimation IA
   - Peut ajuster selon son expertise
   - Saisit le prix final en FCFA
5. Rédige la **justification du tarif** :
   - Explique pourquoi ce prix
   - Détaille les livrables inclus
   - Mentionne les délais
6. Clique sur **"Envoyer le devis au client"**

**Actions système :**
- Prix final sauvegardé dans `requests.final_price`
- Justification sauvegardée dans `requests.price_justification`
- Statut automatiquement changé à `awaiting_payment`
- Email de devis envoyé au client (si configuré)
- Notification WhatsApp courte (si configuré)

**Statut :** `analysis` → `awaiting_payment` (En attente de paiement)

---

### **ÉTAPE 5 : ENVOI DE RÉPONSE AU CLIENT** 💬

**Côté Admin :**
1. Admin accède à `/admin/gerer/[id]`
2. Va dans l'onglet **"Réponse"**
3. Choisit un template ou rédige un message personnalisé :
   - **Template "Devis accepté"** : Message de bienvenue avec détails
   - **Template "Clarification"** : Questions pour préciser le besoin
   - **Template "Livraison finale"** : Message de livraison
   - **Personnalisé** : Message libre
4. Rédige le message au client
5. Clique sur **"Envoyer la réponse au client"**

**Actions système :**
- Message sauvegardé dans l'historique
- Email détaillé envoyé au client
- Notification WhatsApp courte (si configuré)

**Statut :** `awaiting_payment` (reste en attente paiement)

---

### **ÉTAPE 6 : PAIEMENT PAR LE CLIENT** 💳

**Côté Client :**
1. Client reçoit le devis par email
2. Accède à `/demandes/[id]` pour voir les détails
3. Voit le prix final et la justification
4. Clique sur **"Payer maintenant"**
5. Choisit le mode de paiement :
   - **Mobile Money** (Wave, Orange Money, MTN)
   - **Carte bancaire** (Stripe)
   - **Autre** (selon configuration)
6. Effectue le paiement
7. Reçoit une confirmation

**Côté Système :**
- Webhook de paiement reçu
- Paiement vérifié et confirmé
- Statut automatiquement changé à `in_production`
- Email de confirmation envoyé
- Notification admin

**Statut :** `awaiting_payment` → `in_production` (En production)

---

### **ÉTAPE 7 : TRAITEMENT DU PROJET** 🔨

**Côté Admin :**
1. Admin voit le changement de statut automatique
2. Accède à `/admin/gerer/[id]`
3. Travaille sur le projet :
   - Crée les livrables
   - Suit le cahier des charges
   - Respecte les délais
4. Ajoute des **notes internes** si nécessaire :
   - Progression du travail
   - Difficultés rencontrées
   - Solutions trouvées
5. Met à jour le statut si besoin

**Statut :** `in_production` (En production)

---

### **ÉTAPE 8 : UPLOAD DES LIVRABLES** 📤

**Côté Admin :**
1. Admin accède à `/admin/gerer/[id]`
2. Va dans l'onglet **"Livrables"**
3. Upload les fichiers finaux :
   - **Drag & drop** ou **sélection de fichiers**
   - Formats acceptés : PDF, ZIP, images, documents
   - Taille max : Selon configuration Supabase
4. Les fichiers sont stockés dans :
   - Bucket Supabase `deliverables`
   - Chemin : `deliverables/{request_id}/{filename}`
5. Les fichiers sont **immédiatement accessibles** au client

**Actions système :**
- Fichiers uploadés vers Supabase Storage
- URLs publiques générées
- Liste des livrables mise à jour
- Client peut télécharger immédiatement

**Statut :** `in_production` (reste en production jusqu'à validation)

---

### **ÉTAPE 9 : VALIDATION ET LIVRAISON** ✅

**Côté Admin :**
1. Admin vérifie que tous les livrables sont uploadés
2. Accède à `/admin/gerer/[id]`
3. Va dans l'onglet **"Statut"**
4. Change le statut vers **"Livré"**
5. Ajoute une note finale (optionnel) :
   - "Projet terminé et livré"
   - Instructions d'utilisation
   - Contact pour support
6. Clique sur **"Mettre à jour le statut"**

**Actions système :**
- Statut changé à `delivered`
- Email de livraison envoyé au client
- Notification WhatsApp (si configuré)
- Historique mis à jour

**Côté Client :**
1. Client reçoit notification de livraison
2. Accède à `/demandes/[id]`
3. Voit le statut "Livré"
4. Peut télécharger tous les livrables
5. Peut demander des révisions (si plan Pro) : accepter tous les plans du moment qu'il a payeé pour un travail.

**Statut :** `in_production` → `delivered` (Livré)

---

### **ÉTAPE 10 : CLÔTURE (OPTIONNEL)** 🎯

**Côté Admin :**
1. Admin peut ajouter une note finale
2. Marquer la demande comme complètement traitée
3. Archiver si nécessaire

**Côté Client :**
1. Client peut :
   - Télécharger les livrables
   - Demander des révisions (si éligible)
   - Laisser un avis/note
   - Soumettre une nouvelle demande

**Statut :** `delivered` (final)

---

## 📊 STATUTS DISPONIBLES

| Statut | Description | Action suivante |
|--------|-------------|-----------------|
| `pending` | En attente | Admin doit analyser |
| `analysis` | En analyse | Admin analyse la demande |
| `awaiting_payment` | En attente paiement | Client doit payer |
| `in_production` | En production | Admin travaille sur le projet |
| `delivered` | Livré | Projet terminé |
| `cancelled` | Annulé | Demande annulée |

---

## 🔐 SÉCURITÉ & VALIDATION

### **Contrôles à chaque étape :**
1. ✅ **Authentification** : Seuls les admins peuvent gérer
2. ✅ **Validation** : Prix et statuts validés avant envoi
3. ✅ **Traçabilité** : Historique complet des changements
4. ✅ **RLS** : Row Level Security sur toutes les tables
5. ✅ **Audit** : Logs de toutes les actions admin

### **Règles métier :**
- ❌ **Impossible** de passer de `pending` directement à `delivered`
- ❌ **Impossible** de changer le statut sans raison
- ✅ **Obligatoire** : Prix final avant `awaiting_payment`
- ✅ **Obligatoire** : Paiement confirmé avant `in_production`
- ✅ **Obligatoire** : Livrables uploadés avant `delivered`

---

## 📝 NOTES IMPORTANTES

### **Rôle de l'IA :**
- 🤖 L'IA **assiste** l'admin, ne le remplace pas
- 🤖 Toutes les décisions finales sont **humaines**
- 🤖 L'IA propose, l'admin **valide**

### **Communication :**
- 📧 **Emails** : Détails complets, devis, confirmations
- 💬 **WhatsApp** : Notifications courtes et rapides
- 🔔 **Notifications in-app** : Alertes dans le dashboard

### **Délais recommandés :**
- ⏱️ **Réponse initiale** : 24-48h après soumission
- ⏱️ **Devis envoyé** : 48-72h après analyse
- ⏱️ **Livraison** : Selon complexité (1-4 semaines)

---

## 🎯 CHECKLIST ADMIN

Pour chaque demande, vérifier :
- [ ] Demande lue et comprise
- [ ] Analyse IA effectuée (si nécessaire)
- [ ] Prix final fixé et justifié
- [ ] Devis envoyé au client
- [ ] Réponse personnalisée envoyée
- [ ] Paiement reçu et confirmé
- [ ] Travail effectué selon cahier des charges
- [ ] Livrables uploadés
- [ ] Statut mis à jour à "Livré"
- [ ] Client notifié de la livraison

---

**Document créé par MonAP - Chef de Projet Solution360°**  
*Dernière mise à jour : 2026*
