# 🚀 Solution360° - Plateforme de Consulting Digital

**Solution360°** est une plateforme SaaS moderne qui combine intelligence artificielle et expertise humaine pour proposer des services digitaux personnalisés en Afrique francophone.

---

## 🎯 Vue d'Ensemble

Solution360° permet aux clients de :
- 📝 Soumettre leurs projets/idées via un formulaire intelligent
- 🤖 Recevoir une analyse automatique par IA (DeepSeek/GPT-4o)
- 💰 Obtenir un devis transparent en FCFA
- 📦 Télécharger les livrables professionnels

Et aux admins de :
- 👨‍💼 Gérer toutes les demandes depuis un dashboard complet
- 🤖 Utiliser l'IA pour analyser et estimer les prix
- 📤 Uploader et livrer les solutions
- 📊 Suivre les statistiques et revenus

---

## 🛠️ Stack Technique

- **Framework** : Next.js 15.3.1 (App Router + Server Components)
- **UI** : React 18.3.1 + TypeScript 5
- **Styling** : Tailwind CSS 3.4.1
- **Base de données** : Supabase (PostgreSQL + Auth + Storage)
- **IA** : DeepSeek API (GPT-4o optionnel)
- **Déploiement** : Vercel
- **Paiements** : Wave, CinetPay (Mobile Money)

---

## 📦 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase
- Clé API DeepSeek (optionnel)

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/Pacousstar/Solution360-pwa.git
cd Solution360-pwa
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
# Copier le template
cp docs/ENV_TEMPLATE.md .env.local

# Éditer .env.local avec vos vraies valeurs
# Voir docs/ENV_TEMPLATE.md pour la liste complète
```

4. **Lancer le serveur de développement**
```bash
npm run dev
```

5. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

---

## 🔐 Configuration

### Variables d'Environnement Obligatoires

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Application
NEXT_PUBLIC_URL=http://localhost:3000
```

### Variables Optionnelles

```env
# IA
DEEPSEEK_API_KEY=votre_cle_deepseek
OPENAI_API_KEY=votre_cle_openai

# Paiements
WAVE_API_TOKEN=votre_token_wave
CINETPAY_API_KEY=votre_cle_cinetpay
CINETPAY_SITE_ID=votre_site_id

# Email
RESEND_API_KEY=votre_cle_resend
```

📖 **Voir** `docs/ENV_TEMPLATE.md` pour la configuration complète.

---

## 📚 Documentation

### Documentation Principale

- 📋 **[Workflow Complet](docs/WORKFLOW_DEMANDE_A_Z.md)** : Traiter une demande de A à Z
- 📖 **[Synthèse des Documents](docs/SYNTHESE_DOCUMENTS.md)** : Vision globale et stratégie
- 🔐 **[Guide de Sécurité](docs/SECURITE.md)** : Bonnes pratiques de sécurité
- 🚀 **[Améliorations](docs/AMELIORATIONS_MONAP.md)** : Améliorations effectuées

### Documentation Technique

- 📝 **[CONTEXT.MD](CONTEXT.MD)** : Briefing technique complet
- 📊 **[ANALYSE_MONAP.md](ANALYSE_MONAP.md)** : Analyse détaillée du projet

---

## 🎯 Fonctionnalités

### ✅ Implémenté

- 🔐 Authentification Supabase (login/register)
- 👤 Dashboard client (demandes, nouvelle demande, profil, stats)
- 👨‍💼 Dashboard admin (gestion complète des demandes)
- 🤖 Analyse IA (DeepSeek API)
- 📤 Upload de livrables (Supabase Storage)
- 🔄 Gestion des statuts (7 états)
- 📝 Notes admin privées
- 🎨 Design moderne et responsive

### 🔄 En Cours

- 💳 Paiement Mobile Money (Wave, CinetPay)
- 📧 Notifications email (Resend)
- 📊 Analytics & Reporting

### 📋 À Implémenter

- 💬 Chat client-admin
- 🔔 Notifications push PWA
- ⭐ Système de notation/avis
- 📈 Dashboard statistiques avancé

---

## 🚀 Déploiement

### Vercel (Recommandé)

1. **Connecter le repository GitHub à Vercel**
2. **Configurer les variables d'environnement** dans le dashboard Vercel
3. **Déployer automatiquement** à chaque push

### Variables Vercel Requises

Toutes les variables d'environnement doivent être configurées dans le dashboard Vercel :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DEEPSEEK_API_KEY`
- Etc.

---

## 🔒 Sécurité

### Bonnes Pratiques

- ✅ **RLS activé** sur toutes les tables Supabase
- ✅ **Middleware** de protection des routes
- ✅ **Validation** de toutes les entrées utilisateur
- ✅ **Variables d'environnement** sécurisées
- ✅ **HTTPS/TLS** obligatoire en production

📖 **Voir** `docs/SECURITE.md` pour le guide complet.

---

## 🧪 Scripts Disponibles

```bash
# Développement
npm run dev          # Lancer le serveur de développement

# Production
npm run build        # Build de production
npm run start        # Lancer le serveur de production

# Qualité
npm run lint         # Vérifier le code avec ESLint
```

---

## 📊 Structure du Projet

```
Solution360-pwa/
├── src/
│   ├── app/              # Pages Next.js (App Router)
│   │   ├── (auth)/       # Routes d'authentification
│   │   ├── (dashboard)/  # Dashboard client
│   │   ├── admin/        # Dashboard admin
│   │   └── api/          # API Routes
│   ├── components/       # Composants React réutilisables
│   └── lib/              # Utilitaires et helpers
│       ├── admin/        # Logique admin centralisée
│       ├── supabase/     # Clients Supabase
│       └── payments.ts   # Intégrations paiement
├── docs/                 # Documentation
├── public/               # Fichiers statiques
└── middleware.ts         # Protection des routes
```

---

## 🤝 Contribution

Ce projet est développé par **GSN EXPERTISES GROUP** sous la direction de **A. DIHI**.

Pour toute question ou suggestion, contactez :
- 📧 Email : pacous2000@gmail.com
- 🌐 Site : https://solution360.app

---

## 📄 Licence

Propriétaire - GSN EXPERTISES GROUP © 2026

---

## 🎉 Remerciements

- **MonAP** - Chef de Projet et développeur principal
- **Supabase** - Infrastructure backend
- **Vercel** - Hébergement et déploiement
- **DeepSeek** - API d'intelligence artificielle

---

**Développé avec ❤️ par GSN EXPERTISES GROUP**
