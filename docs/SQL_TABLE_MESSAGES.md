# 💬 CRÉATION TABLE MESSAGES
**Solution360° - Par MonAP**

---

## 📋 SCRIPT SQL COMPLET

Exécutez ce script dans le **SQL Editor** de Supabase pour créer la table `messages` et ses politiques RLS.

```sql
-- Créer la table messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('client', 'admin')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_messages_request_id ON public.messages(request_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read) WHERE is_read = false;

-- Activer RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Fonction helper pour vérifier si un utilisateur est admin
-- Note: Cette fonction doit déjà exister si vous avez exécuté RLS_POLICIES.sql
-- Si elle n'existe pas, elle sera créée ici
CREATE OR REPLACE FUNCTION public.is_user_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier via user_roles (méthode principale)
  IF EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = user_uuid 
      AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN true;
  END IF;

  -- Vérifier via admin_users (fallback)
  IF EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = user_uuid 
      AND is_admin = true
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Politique : Clients voient les messages de leurs demandes
CREATE POLICY "Clients can view messages for own requests"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.requests
    WHERE requests.id = messages.request_id
    AND requests.user_id = auth.uid()
  )
);

-- Politique : Admins voient tous les messages
CREATE POLICY "Admins can view all messages"
ON public.messages FOR SELECT
USING (public.is_user_admin(auth.uid()));

-- Politique : Clients peuvent créer des messages pour leurs demandes
CREATE POLICY "Clients can create messages for own requests"
ON public.messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND sender_type = 'client'
  AND EXISTS (
    SELECT 1 FROM public.requests
    WHERE requests.id = messages.request_id
    AND requests.user_id = auth.uid()
  )
);

-- Politique : Admins peuvent créer des messages pour toutes les demandes
CREATE POLICY "Admins can create messages for all requests"
ON public.messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND sender_type = 'admin'
  AND public.is_user_admin(auth.uid())
);

-- Politique : Clients peuvent marquer leurs messages comme lus
CREATE POLICY "Clients can update read status for own messages"
ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.requests
    WHERE requests.id = messages.request_id
    AND requests.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.requests
    WHERE requests.id = messages.request_id
    AND requests.user_id = auth.uid()
  )
);

-- Politique : Admins peuvent marquer tous les messages comme lus
CREATE POLICY "Admins can update read status for all messages"
ON public.messages FOR UPDATE
USING (public.is_user_admin(auth.uid()))
WITH CHECK (public.is_user_admin(auth.uid()));

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_messages_updated_at();
```

---

## 📊 STRUCTURE DE LA TABLE

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Identifiant unique du message |
| `request_id` | UUID | Référence à la demande (FK) |
| `sender_id` | UUID | ID de l'utilisateur qui envoie (FK vers auth.users) |
| `sender_type` | VARCHAR(20) | Type d'expéditeur : 'client' ou 'admin' |
| `content` | TEXT | Contenu du message |
| `is_read` | BOOLEAN | Indique si le message a été lu |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Date de mise à jour |

---

## 🔒 SÉCURITÉ (RLS)

### **Politiques de lecture (SELECT)**
- ✅ Clients : Voient uniquement les messages de leurs propres demandes
- ✅ Admins : Voient tous les messages

### **Politiques d'écriture (INSERT)**
- ✅ Clients : Peuvent envoyer des messages uniquement pour leurs demandes
- ✅ Admins : Peuvent envoyer des messages pour toutes les demandes

### **Politiques de mise à jour (UPDATE)**
- ✅ Clients : Peuvent marquer comme lus les messages de leurs demandes
- ✅ Admins : Peuvent marquer comme lus tous les messages

---

## 🎯 UTILISATION

### **Exemple d'insertion (Client)**
```sql
INSERT INTO public.messages (request_id, sender_id, sender_type, content)
VALUES (
  'request-uuid-here',
  auth.uid(),
  'client',
  'Bonjour, j''aimerais avoir des précisions sur mon projet.'
);
```

### **Exemple d'insertion (Admin)**
```sql
INSERT INTO public.messages (request_id, sender_id, sender_type, content)
VALUES (
  'request-uuid-here',
  auth.uid(),
  'admin',
  'Bonjour, nous avons bien reçu votre demande. Nous y travaillons actuellement.'
);
```

### **Récupérer les messages d'une demande**
```sql
SELECT 
  m.*,
  u.email as sender_email,
  u.raw_user_meta_data->>'full_name' as sender_name
FROM public.messages m
LEFT JOIN auth.users u ON u.id = m.sender_id
WHERE m.request_id = 'request-uuid-here'
ORDER BY m.created_at ASC;
```

---

## ✅ VÉRIFICATION

Après avoir exécuté le script, vérifiez :

1. ✅ La table `messages` existe
2. ✅ Les index sont créés
3. ✅ RLS est activé
4. ✅ Les politiques sont créées
5. ✅ La fonction `is_user_admin` existe

```sql
-- Vérifier la table
SELECT * FROM information_schema.tables 
WHERE table_name = 'messages' AND table_schema = 'public';

-- Vérifier les politiques RLS
SELECT * FROM pg_policies 
WHERE tablename = 'messages';

-- Vérifier les index
SELECT * FROM pg_indexes 
WHERE tablename = 'messages';
```

---

**Document créé par MonAP - Chef de Projet Solution360°**  
*Date : 2026*
