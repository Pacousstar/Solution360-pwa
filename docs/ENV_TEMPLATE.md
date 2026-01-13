# 🔐 TEMPLATE DES VARIABLES D'ENVIRONNEMENT
**Solution360° - Configuration Sécurisée**

Copiez ce contenu dans un fichier `.env.local` à la racine du projet.

```env
# ============================================
# SOLUTION360° - VARIABLES D'ENVIRONNEMENT
# ============================================
# ⚠️ IMPORTANT : Ne jamais commiter le fichier .env.local
# Copiez ce fichier en .env.local et remplissez les valeurs

# ============================================
# SUPABASE (OBLIGATOIRE)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_supabase

# ============================================
# IA - DEEPSEEK (RECOMMANDÉ)
# ============================================
DEEPSEEK_API_KEY=votre_cle_deepseek_api

# ============================================
# IA - OPENAI (OPTIONNEL)
# ============================================
# OPENAI_API_KEY=votre_cle_openai_api

# ============================================
# URL DE L'APPLICATION
# ============================================
NEXT_PUBLIC_URL=http://localhost:3000

# ============================================
# PAIEMENTS - WAVE (OPTIONNEL)
# ============================================
# WAVE_API_TOKEN=votre_token_wave

# ============================================
# PAIEMENTS - CINETPAY (OPTIONNEL)
# ============================================
# CINETPAY_API_KEY=votre_cle_cinetpay
# CINETPAY_SITE_ID=votre_site_id_cinetpay

# ============================================
# EMAIL - RESEND (OPTIONNEL)
# ============================================
# RESEND_API_KEY=votre_cle_resend

# ============================================
# SÉCURITÉ
# ============================================
# JWT_SECRET=votre_secret_jwt_long_et_aleatoire

# ============================================
# ENVIRONNEMENT
# ============================================
NODE_ENV=development
```

---

## 📝 NOTES DE SÉCURITÉ

1. **Ne JAMAIS commiter** le fichier `.env.local`
2. **Ne JAMAIS partager** les clés API publiquement
3. Utiliser des clés différentes pour dev/prod
4. Régénérer les clés si elles sont compromises
5. Activer 2FA sur tous les comptes API
6. Surveiller l'utilisation des clés API régulièrement

---

**Document créé par MonAP - Chef de Projet Solution360°**
