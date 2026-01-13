# Script de commit et push vers GitHub (PowerShell)
# Solution360° - Par MonAP

Write-Host "🚀 Démarrage du commit et push..." -ForegroundColor Cyan

# Aller dans le répertoire du projet
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Join-Path $scriptPath ".."
Set-Location $projectRoot

# Vérifier que nous sommes dans un repo git
if (-not (Test-Path .git)) {
    Write-Host "❌ Ce répertoire n'est pas un repo git" -ForegroundColor Red
    Write-Host "Initialisation du repo..." -ForegroundColor Yellow
    git init
    git remote add origin https://github.com/Pacousstar/Solution360-pwa.git 2>&1 | Out-Null
}

# Supprimer les fichiers .txt indésirables
Write-Host "🧹 Suppression des fichiers .txt indésirables..." -ForegroundColor Yellow
$filesToDelete = @(
    "Traiter une demande de A à Z Solution360°.txt",
    "Solution360 (2).txt",
    "RÉCAPITULATIF COMPLET MVP SOLUTION360°.txt",
    "supabase.txt"
)

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        git rm -f $file 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Remove-Item $file -Force -ErrorAction SilentlyContinue
        }
        Write-Host "   ✅ Supprimé: $file" -ForegroundColor Green
    }
}

# Ajouter tous les fichiers modifiés
Write-Host "📦 Ajout des fichiers modifiés..." -ForegroundColor Yellow
git add .

# Faire le commit
Write-Host "💾 Création du commit..." -ForegroundColor Yellow
$commitMessage = @"
✨ Améliorations majeures par MonAP

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

Améliorations de qualité et sécurité pour production.
"@

git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Commit créé avec succès !" -ForegroundColor Green
    
    # Push vers GitHub
    Write-Host "📤 Push vers GitHub..." -ForegroundColor Yellow
    git push origin main 2>&1
    if ($LASTEXITCODE -ne 0) {
        git push origin master 2>&1
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Push terminé avec succès !" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Push échoué. Vérifiez votre connexion et vos credentials Git." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Aucun changement à commiter." -ForegroundColor Yellow
}

Write-Host "`n🎉 Script terminé !" -ForegroundColor Cyan
