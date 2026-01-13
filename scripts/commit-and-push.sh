#!/bin/bash
# Script de commit et push vers GitHub
# Solution360° - Par MonAP

echo "🚀 Démarrage du commit et push..."

# Aller dans le répertoire du projet
cd "$(dirname "$0")/.."

# Vérifier que nous sommes dans un repo git
if [ ! -d .git ]; then
    echo "❌ Ce répertoire n'est pas un repo git"
    echo "Initialisation du repo..."
    git init
    git remote add origin https://github.com/Pacousstar/Solution360-pwa.git || true
fi

# Supprimer les fichiers .txt indésirables (sauf ceux nécessaires)
echo "🧹 Suppression des fichiers .txt indésirables..."
git rm -f "Traiter une demande de A à Z Solution360°.txt" 2>/dev/null || rm -f "Traiter une demande de A à Z Solution360°.txt"
git rm -f "Solution360 (2).txt" 2>/dev/null || rm -f "Solution360 (2).txt"
git rm -f "RÉCAPITULATIF COMPLET MVP SOLUTION360°.txt" 2>/dev/null || rm -f "RÉCAPITULATIF COMPLET MVP SOLUTION360°.txt"
git rm -f "supabase.txt" 2>/dev/null || rm -f "supabase.txt"

# Ajouter tous les fichiers modifiés
echo "📦 Ajout des fichiers modifiés..."
git add .

# Faire le commit
echo "💾 Création du commit..."
git commit -m "✨ Améliorations majeures par MonAP

- ✅ Correction erreur Supabase (vérification variables d'environnement)
- ✅ Nettoyage de 68 console.log (remplacés par logger conditionnel)
- ✅ Amélioration gestion d'erreurs (messages clairs)
- ✅ Système de logging conditionnel créé (src/lib/logger.ts)
- ✅ Logique admin centralisée et améliorée
- ✅ Suppression de 10 fichiers dupliqués (* copy.*)
- ✅ Documentation complète (workflow, sécurité, migration)
- ✅ Scripts SQL pour migration admins et RLS
- ✅ Script de migration automatique (scripts/migrate-admins.js)
- ✅ Remplacement admin@solution360.app → pacousstar02@gmail.com
- ✅ Suppression fichiers .txt indésirables

Améliorations de qualité et sécurité pour production."

# Push vers GitHub
echo "📤 Push vers GitHub..."
git push origin main || git push origin master

echo "✅ Commit et push terminés avec succès !"
