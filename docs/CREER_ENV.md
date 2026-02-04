# 📝 GUIDE : Créer le fichier .env
**Solution360° - Par MonAP**

---

## 🎯 OBJECTIF

Créer un fichier `.env` à la racine du projet avec des valeurs d'exemple (template).

---

## 📋 ÉTAPES

### **Option 1 : Copier depuis .env.example** (Recommandé)

```bash
# À la racine du projet
cp .env.example .env
```

### **Option 2 : Créer manuellement**

1. Créer un fichier `.env` à la racine du projet
2. Copier le contenu de `.env.example` dans `.env`
3. Vérifier que le fichier est bien créé

---

## ✅ VÉRIFICATION

```bash
# Vérifier que .env existe
ls .env

# Vérifier que .env.local est ignoré
git status
# .env.local ne doit PAS apparaître
```

---

## 🔒 SÉCURITÉ

- ✅ `.env` : Peut être commité (valeurs d'exemple)
- 🔒 `.env.local` : Dans `.gitignore` (vraies valeurs)

---

**Signé : MonAP - Chef de Projet Solution360°**
