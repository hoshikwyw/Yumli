-- SUPERSEDED: do not run this on the shared project. Its policies let anyone
-- with the public anon key change recipes, categories and images, and its
-- tables would land in the public schema. Use shared_project_setup.sql.

-- =============================================
-- Yumli Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Categories table
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  icon text,
  created_at timestamptz default now()
);

-- Recipes table
create table if not exists recipes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  image text not null,
  prep_time text not null,
  cook_time text not null,
  servings integer not null default 1,
  difficulty text not null default 'Easy' check (difficulty in ('Easy', 'Medium', 'Hard')),
  ingredients text[] not null default '{}',
  instructions text[] not null default '{}',
  category_id uuid references categories(id) on delete set null,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table categories enable row level security;
alter table recipes enable row level security;

-- Public read access (no auth needed to browse recipes)
create policy "Public can read categories" on categories
  for select using (true);

create policy "Allow insert categories" on categories
  for insert with check (true);

create policy "Allow update categories" on categories
  for update using (true);

create policy "Allow delete categories" on categories
  for delete using (true);

create policy "Public can read recipes" on recipes
  for select using (true);

-- Write access via anon key (admin dashboard uses client-side auth gate)
-- NOTE: Move to Supabase Auth + RLS when ready for production
create policy "Allow insert recipes" on recipes
  for insert with check (true);

create policy "Allow update recipes" on recipes
  for update using (true);

create policy "Allow delete recipes" on recipes
  for delete using (true);

-- Create a view that joins recipes with categories for easy querying
create or replace view recipes_with_category as
select
  r.id,
  r.title,
  r.description,
  r.image,
  r.prep_time,
  r.cook_time,
  r.servings,
  r.difficulty,
  r.ingredients,
  r.instructions,
  r.is_featured,
  r.created_at,
  r.updated_at,
  c.name as category,
  c.slug as category_slug
from recipes r
left join categories c on r.category_id = c.id;
