-- =============================================
-- Yumli on a shared Supabase project
-- =============================================
--
-- Yumli lives in its own `yumli` schema, next to (never inside) the other
-- app's tables, and is private: the public anon key cannot see it at all.
-- Only Yumli's server reaches it, signed in as a dedicated service account
-- that can touch Yumli's tables and images and nothing else in the project.
--
--   yumli.categories, yumli.recipes      the data
--   yumli.recipes_with_category          the joined view the API reads
--   storage bucket `recipe-images`       public to view by link, private to change
--
-- Before running:
--   1. The project's lock-down script must have run already: it creates
--      public.has_app_access(), which every policy below uses.
--   2. Create the service account: Authentication -> Users -> Add user ->
--      Create new user, email yumli-api@kayv.os (or change SERVICE_EMAIL
--      below), a long random password, "Auto Confirm User" ticked.
--      The password goes into Vercel later as YUMLI_SERVICE_PASSWORD.
--
-- After running:
--   3. Project Settings -> Data API -> Exposed schemas: add `yumli`, Save.
--      Exposing it is safe: anon has no access to the schema, so the public
--      API answers "permission denied" for everything in it.
--
-- Safe to run more than once. Run in Dashboard -> SQL Editor -> New query.

BEGIN;

-- 0. Preconditions, and the service account's access.
DO $$
DECLARE
  SERVICE_EMAIL constant text := 'yumli-api@kayv.os';
  service_id uuid;
BEGIN
  IF to_regprocedure('public.has_app_access(text)') IS NULL THEN
    RAISE EXCEPTION 'public.has_app_access() is missing. Run the project''s lock-down script first.';
  END IF;

  SELECT id INTO service_id FROM auth.users WHERE email = SERVICE_EMAIL;
  IF service_id IS NULL THEN
    RAISE EXCEPTION 'No user % yet. Create it first: Authentication -> Users -> Add user (Auto Confirm User ticked).', SERVICE_EMAIL;
  END IF;

  INSERT INTO public.app_access (user_id, app)
  VALUES (service_id, 'yumli')
  ON CONFLICT DO NOTHING;
END $$;

-- 1. The schema. Signed-in users may look inside; anonymous callers may not.
CREATE SCHEMA IF NOT EXISTS yumli;
REVOKE ALL ON SCHEMA yumli FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA yumli TO authenticated;

-- 2. Tables (the same shape as before, plus images + youtube_link).
CREATE TABLE IF NOT EXISTS yumli.categories (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text NOT NULL UNIQUE,
  slug       text NOT NULL UNIQUE,
  icon       text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS yumli.recipes (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title        text NOT NULL,
  description  text NOT NULL,
  image        text NOT NULL,
  images       text[] DEFAULT '{}',
  prep_time    text NOT NULL,
  cook_time    text NOT NULL,
  servings     integer NOT NULL DEFAULT 1,
  difficulty   text NOT NULL DEFAULT 'Easy' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  ingredients  text[] NOT NULL DEFAULT '{}',
  instructions text[] NOT NULL DEFAULT '{}',
  category_id  uuid REFERENCES yumli.categories (id) ON DELETE SET NULL,
  is_featured  boolean DEFAULT false,
  youtube_link text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- 3. Row-level security: only the account granted 'yumli' gets any row.
ALTER TABLE yumli.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE yumli.recipes    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Yumli service full access" ON yumli.categories;
CREATE POLICY "Yumli service full access" ON yumli.categories
  FOR ALL TO authenticated
  USING (public.has_app_access('yumli'))
  WITH CHECK (public.has_app_access('yumli'));

DROP POLICY IF EXISTS "Yumli service full access" ON yumli.recipes;
CREATE POLICY "Yumli service full access" ON yumli.recipes
  FOR ALL TO authenticated
  USING (public.has_app_access('yumli'))
  WITH CHECK (public.has_app_access('yumli'));

REVOKE ALL ON yumli.categories, yumli.recipes FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON yumli.categories, yumli.recipes TO authenticated;

-- 4. The joined view. security_invoker makes it obey the tables' row-level
--    security; without it a view runs as its owner and would skip the checks.
DROP VIEW IF EXISTS yumli.recipes_with_category;
CREATE VIEW yumli.recipes_with_category WITH (security_invoker = true) AS
SELECT
  r.id,
  r.title,
  r.description,
  r.image,
  r.images,
  r.prep_time,
  r.cook_time,
  r.servings,
  r.difficulty,
  r.ingredients,
  r.instructions,
  r.is_featured,
  r.youtube_link,
  r.created_at,
  r.updated_at,
  r.category_id,
  c.name AS category,
  c.slug AS category_slug
FROM yumli.recipes r
LEFT JOIN yumli.categories c ON r.category_id = c.id;

REVOKE ALL ON yumli.recipes_with_category FROM PUBLIC, anon;
GRANT SELECT ON yumli.recipes_with_category TO authenticated;

-- 5. Images. The bucket is public, so a recipe's image link works for anyone;
--    only the service account may upload, replace or delete. Uploads are
--    capped at 5 MB and limited to image types.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('recipe-images', 'recipe-images', true, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Remove any older recipe-images policies (such as the open ones from the
-- original setup), whatever they are named, then add the locked-down set.
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND (coalesce(qual, '') || coalesce(with_check, '')) LIKE '%recipe-images%'
  LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Listing and deleting files need read access too; public links do not.
CREATE POLICY "Yumli service read recipe images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'recipe-images' AND public.has_app_access('yumli'));
CREATE POLICY "Yumli service upload recipe images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'recipe-images' AND public.has_app_access('yumli'));
CREATE POLICY "Yumli service update recipe images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'recipe-images' AND public.has_app_access('yumli'))
  WITH CHECK (bucket_id = 'recipe-images' AND public.has_app_access('yumli'));
CREATE POLICY "Yumli service delete recipe images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'recipe-images' AND public.has_app_access('yumli'));

COMMIT;

-- Check: the service account should be listed with app = 'yumli'.
SELECT u.email, a.app
FROM public.app_access a JOIN auth.users u ON u.id = a.user_id
WHERE a.app = 'yumli';
