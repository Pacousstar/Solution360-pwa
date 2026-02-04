README.md SOLUTION360°
text
# 🚀 Solution360° - Plateforme de Consulting Digital

![Solution360°](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Latest-3ECF8E?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)

**Solution360°** est une plateforme web professionnelle permettant aux clients de soumettre leurs projets digitaux et de recevoir des solutions sur mesure avec estimation de prix automatique.

---

## ✨ Fonctionnalités

### 👤 **Espace Client**
- 📝 Soumission de demandes de projet
- 👁️ Suivi en temps réel du statut
- 💰 Visualisation des estimations de prix
- 📥 Téléchargement des livrables finaux

### 👨‍💼 **Dashboard Admin**
- 📊 Vue globale de toutes les demandes
- ⚙️ Gestion des statuts (7 états disponibles)
- 📝 Notes privées par demande
- 📎 Upload de fichiers livrables
- 🎨 Interface intuitive orange/blanc/vert

### 🔐 **Sécurité**
- Authentification Supabase (email + password)
- Protection des routes avec middleware
- Row Level Security (RLS) en base de données
- Rôles utilisateur/admin

---

## 🛠️ Technologies

- **Framework** : [Next.js 16.1.1](https://nextjs.org/) (App Router + React Server Components)
- **Base de données** : [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **Styling** : [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Langage** : TypeScript
- **Déploiement** : Vercel
- **IA** : OpenAI GPT-4 (à venir)
- **Paiement** : Mobile Money Wave/Orange/MTN (à venir)

---

## 📦 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase

### 1. Cloner le projet
```bash
git clone https://github.com/Pacousstar/Solution360-pwa.git
cd Solution360-pwa
2. Installer les dépendances
bash
npm install
3. Configuration Supabase
Créer un fichier .env.local :

text
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
SUPABASE_SERVICE_ROLE_KEY=votre-cle-service-role
4. Créer les tables Supabase
Exécuter dans SQL Editor :

sql
-- Table requests
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  project_type TEXT,
  project_description TEXT,
  budget_proposed NUMERIC,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  deliverable_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table ai_analyses
CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id),
  estimated_price NUMERIC,
  analysis_summary TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table admin_users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insérer admin
INSERT INTO admin_users (email) VALUES ('pacous2000@gmail.com');
INSERT INTO admin_users (email) VALUES ('admin@solution360.app');

-- RLS Policies
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests"
ON requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests"
ON requests FOR INSERT
WITH CHECK (auth.uid() = user_id);
5. Créer le bucket Storage
Dans Supabase Dashboard → Storage :

Créer un bucket deliverables

Le rendre public

Ajouter les policies :

sql
-- Allow authenticated upload
CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'deliverables');

-- Allow public read
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'deliverables');
6. Lancer en développement
bash
npm run dev
Ouvrir http://localhost:3000

📁 Structure du projet
text
solution360-pwa/
├── app/
│   ├── (auth)/
│   │   ├── login/              # Page de connexion
│   │   └── register/           # Page d'inscription
│   ├── (dashboard)/
│   │   ├── demandes/           # Liste demandes client
│   │   │   └── [id]/           # Détail demande
│   │   └── nouvelle-demande/   # Formulaire création
│   ├── admin/
│   │   ├── demandes/           # Liste toutes demandes
│   │   ├── detail/[id]/        # Détails complets
│   │   └── gerer/[id]/         # Gestion + upload
│   └── api/                    # Routes API (à venir)
├── components/
│   ├── Navbar.tsx              # Navigation
│   └── UserDisplay.tsx         # Affichage utilisateur
├── lib/
│   └── supabase/
│       ├── client.ts           # Client browser
│       └── server.ts           # Client serveur
├── public/                     # Assets statiques
└── .env.local                  # Variables d'environnement
🚀 Déploiement Vercel
Voir section suivante pour le guide complet.

👥 Équipe
GSN EXPERTISES GROUP

Directeur Général : A. DIHI

GitHub : @Pacousstar

📄 Licence
MIT License - Voir LICENSE pour plus de détails.

🤝 Contribution
Les contributions sont les bienvenues ! Créez une issue ou une pull request.

📞 Contact
Pour toute question : contact@solution360.app

⭐ Si ce projet vous plaît, n'oubliez pas de lui donner une étoile sur GitHub !

text

***

## 🌐 **3. DÉPLOIEMENT VERCEL - GUIDE COMPLET**

### **🔗 Lien Vercel**
**Site officiel** : [https://vercel.com](https://vercel.com)[1][2]

***

### **📝 ÉTAPES DE DÉPLOIEMENT**

#### **A. Méthode Dashboard (Recommandée)**[3][2]

1. **Aller sur Vercel**
https://vercel.com/new

text

2. **Connecter GitHub**
- Cliquer sur "Import Git Repository"
- Sélectionner `Pacousstar/Solution360-pwa`
- Autoriser l'accès à Vercel

3. **Configuration du projet**
- **Project Name** : `solution360-pwa`
- **Framework Preset** : Next.js (auto-détecté)
- **Root Directory** : `.` (laisser vide)
- **Build Command** : `next build` (par défaut)
- **Output Directory** : `.next` (par défaut)

4. **⚠️ IMPORTANT : Ajouter les variables d'environnement**[4][5][6]

Cliquer sur "Environment Variables" et ajouter :

| Nom | Valeur | Environnement |
|-----|--------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://votre-projet.supabase.co` | Production + Preview + Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `votre-cle-anon` | Production + Preview + Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `votre-cle-service-role` | Production uniquement |

> ⚠️ **IMPORTANT** : Cocher les 3 environnements (Production, Preview, Development) pour les variables `NEXT_PUBLIC_*`[7]

5. **Déployer**
- Cliquer sur **"Deploy"**
- Attendre 2-3 minutes
- Récupérer l'URL : `https://solution360-pwa.vercel.app`[8]

***

#### **B. Méthode CLI (Alternative)**[5][4]

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Se connecter
vercel login

# 3. Déployer (première fois)
vercel

# 4. Déployer en production
vercel --prod
🔧 CONFIGURATION POST-DÉPLOIEMENT
1. Configurer les redirections Auth Supabase
​
Dans Supabase Dashboard → Authentication → URL Configuration :

Site URL :

text
https://solution360-pwa.vercel.app
Redirect URLs (ajouter) :

text
https://solution360-pwa.vercel.app/auth/callback
https://solution360-pwa.vercel.app/*
https://*.vercel.app/auth/callback
2. Vérifier les variables d'environnement
​
Dans Vercel Dashboard → Project Settings → Environment Variables :

✅ Toutes les variables NEXT_PUBLIC_* doivent être cochées pour Production, Preview, Development

✅ La SERVICE_ROLE_KEY doit être cochée uniquement pour Production

3. Activer les Analytics
​
Dans Vercel Dashboard → Project → Analytics :

✅ Activer Web Analytics

✅ Activer Speed Insights

🚨 TROUBLESHOOTING COMMUN
Erreur : "Supabase environment variables required"
​
Solution :

Vérifier que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont bien définis

Redéployer SANS cache : Vercel Dashboard → Deployments → ⋯ → Redeploy → Décocher "Use existing Build Cache"

Erreur : "Build failed"
Solution :

bash
# Tester localement
npm run build
npm start

# Si ça marche, commit et push
git add .
git commit -m "Fix build issues"
git push origin main
✅ CHECKLIST FINALE
 Variables d'environnement ajoutées sur Vercel

 Redirect URLs configurés dans Supabase

 Bucket deliverables créé et public

 Admin emails insérés dans admin_users

 Test connexion client : https://solution360-pwa.vercel.app/login

 Test connexion admin : pacous2000@gmail.com

 Test création demande

 Test upload fichier admin

 Analytics activés

🎯 URL FINALE
Après déploiement, votre site sera accessible à :

text
https://solution360-pwa.vercel.app
Chaque push sur main déclenchera un déploiement automatique 🚀
​