-- SUPERSEDED: do not run this on the shared project. Its policies let anyone
-- with the public anon key change recipes, categories and images, and its
-- tables would land in the public schema. Use shared_project_setup.sql.

-- =============================================
-- Fresh setup: images + youtube_link + storage
-- Run this in Supabase SQL Editor
-- =============================================

-- Add new columns
alter table recipes add column if not exists images text[] default '{}';
alter table recipes add column if not exists youtube_link text;

-- Drop old view and recreate with new columns
drop view if exists recipes_with_category;

create view recipes_with_category as
select
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
  c.name as category,
  c.slug as category_slug
from recipes r
left join categories c on r.category_id = c.id;

-- Create storage bucket
insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Public read recipe images" on storage.objects
  for select using (bucket_id = 'recipe-images');

create policy "Allow upload recipe images" on storage.objects
  for insert with check (bucket_id = 'recipe-images');

create policy "Allow delete recipe images" on storage.objects
  for delete using (bucket_id = 'recipe-images');
