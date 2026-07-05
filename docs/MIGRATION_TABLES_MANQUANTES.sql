-- ============================================
-- MIGRATION : TABLES MANQUANTES
-- Solution360° - Par GSN EXPERTISES GROUP
-- ============================================
-- 
-- Tables créées :
--   1. profiles
--   2. status_history
--   3. admin_notes
--
-- Colonnes ajoutées à requests :
--   - quote_sent_at
--   - admin_response
--   - admin_notes
--
-- ⚠️ Exécuter dans l'éditeur SQL Supabase
-- ============================================

-- ============================================
-- ÉTAPE 1 : Vérifier la fonction helper
-- ============================================

CREATE OR REPLACE FUNCTION public.is_user_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid AND role IN ('admin', 'super_admin')
  ) THEN RETURN TRUE; END IF;
  IF EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = user_uuid AND is_admin = true
  ) THEN RETURN TRUE; END IF;
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_uuid AND is_admin = true
  ) THEN RETURN TRUE; END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ÉTAPE 2 : TABLE profiles
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'client',
  is_admin BOOLEAN NOT NULL DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND (OLD.is_admin = is_admin OR NOT is_admin)
  AND (OLD.role = role OR role = 'client')
);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Only super_admins can modify admin status"
ON public.profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- Trigger : créer auto le profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ÉTAPE 3 : TABLE status_history
-- ============================================

CREATE TABLE IF NOT EXISTS public.status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  change_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_status_history_request_id ON public.status_history(request_id);
CREATE INDEX IF NOT EXISTS idx_status_history_created_at ON public.status_history(created_at);

ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own request history"
ON public.status_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.requests
    WHERE requests.id = status_history.request_id
      AND requests.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all history"
ON public.status_history FOR SELECT
USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Only admins can create history"
ON public.status_history FOR INSERT
WITH CHECK (public.is_user_admin(auth.uid()));

-- ============================================
-- ÉTAPE 4 : TABLE admin_notes
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  note_type TEXT NOT NULL DEFAULT 'internal',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_notes_request_id ON public.admin_notes(request_id);
CREATE INDEX IF NOT EXISTS idx_admin_notes_note_type ON public.admin_notes(note_type);

ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all admin notes"
ON public.admin_notes FOR SELECT
USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Clients can view visible notes"
ON public.admin_notes FOR SELECT
USING (
  note_type = 'client_visible'
  AND EXISTS (
    SELECT 1 FROM public.requests
    WHERE requests.id = admin_notes.request_id
      AND requests.user_id = auth.uid()
  )
);

CREATE POLICY "Only admins can create admin notes"
ON public.admin_notes FOR INSERT
WITH CHECK (public.is_user_admin(auth.uid()));

CREATE POLICY "Only admins can update admin notes"
ON public.admin_notes FOR UPDATE
USING (public.is_user_admin(auth.uid()))
WITH CHECK (public.is_user_admin(auth.uid()));

CREATE POLICY "Only admins can delete admin notes"
ON public.admin_notes FOR DELETE
USING (public.is_user_admin(auth.uid()));

-- ============================================
-- ÉTAPE 5 : Colonnes manquantes sur requests
-- ============================================

ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS quote_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_response TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- ============================================
-- ÉTAPE 6 : Migrer les profils existants
-- ============================================

INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Synchroniser rôles depuis user_roles
UPDATE public.profiles p
SET
  role = CASE
    WHEN ur.role = 'super_admin' THEN 'admin'
    WHEN ur.role = 'admin' THEN 'admin'
    ELSE 'client'
  END,
  is_admin = (ur.role IN ('admin', 'super_admin')),
  updated_at = NOW()
FROM public.user_roles ur
WHERE p.id = ur.user_id;

-- Synchroniser depuis admin_users (legacy)
UPDATE public.profiles p
SET
  is_admin = true,
  role = 'admin',
  updated_at = NOW()
FROM public.admin_users au
WHERE p.id = au.user_id
  AND au.is_admin = true
  AND (p.is_admin = false OR p.is_admin IS NULL);

-- ============================================
-- ÉTAPE 7 : Vérification finale
-- ============================================

SELECT 'profiles' AS table_name, COUNT(*) AS row_count FROM public.profiles
UNION ALL
SELECT 'status_history', COUNT(*) FROM public.status_history
UNION ALL
SELECT 'admin_notes', COUNT(*) FROM public.admin_notes;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'requests'
  AND column_name IN ('quote_sent_at', 'admin_response', 'admin_notes')
ORDER BY column_name;

SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'status_history', 'admin_notes')
ORDER BY tablename, policyname;
