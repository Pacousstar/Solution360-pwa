# 📝 TEMPLATE .env.local - SOLUTION360°

**Copiez ce contenu dans votre fichier `.env.local` à la racine du projet.**

---

## ✅ VARIABLES D'ENVIRONNEMENT REQUISES

```env
# ============================================
# SUPABASE (Déjà configuré)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# ============================================
# RESEND EMAIL SERVICE
# ============================================
RESEND_API_KEY=re_U6iJqftw_QFtiJNtaN1AS87EAhZZLpsFx

# ============================================
# URL DE L'APPLICATION
# ============================================
# En local (développement)
NEXT_PUBLIC_URL=http://localhost:3000

# En production (Vercel), cette variable sera configurée automatiquement
# Si vous avez un domaine custom, utilisez : https://votre-domaine.com
```

---

## 📋 INSTRUCTIONS

1. **Créer le fichier `.env.local`** à la racine du projet (même niveau que `package.json`)

2. **Copier le contenu ci-dessus** dans `.env.local`

3. **Remplacer les valeurs** :
   - `RESEND_API_KEY` : Votre clé API Resend (déjà fournie dans l'exemple ci-dessus)
   - `NEXT_PUBLIC_URL` : `http://localhost:3000` pour le développement local

4. **Vérifier que le fichier existe** :
   ```bash
   # Windows PowerShell
   Test-Path .env.local
   
   # Résultat attendu : True
   ```

5. **Redémarrer le serveur de développement** après avoir créé/modifié `.env.local` :
   ```bash
   npm run dev
   ```

---

## ⚠️ IMPORTANT

- **Ne jamais commit `.env.local`** dans Git (déjà dans `.gitignore`)
- **Ne jamais partager** vos clés API publiquement
- **Utiliser des valeurs différentes** pour développement et production

---

## ✅ VÉRIFICATION

Pour vérifier que les variables sont bien chargées :

1. **Démarrer le serveur** : `npm run dev`
2. **Vérifier les logs** au démarrage
3. **Tester l'envoi d'un email** (par exemple, envoyer un devis)
4. **Vérifier les logs** :
   - Si `RESEND_API_KEY` est défini : Email envoyé réellement ✅
   - Si `RESEND_API_KEY` n'est pas défini : `📧 [DEV MODE] Email à envoyer:` ⚠️

---

**Document créé par MonAP - Chef de Projet Solution360°**  
*Dernière mise à jour : 2026-01-01*

