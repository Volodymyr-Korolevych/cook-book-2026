-- TASK004: Multi seasons + dish types
-- Adds:
--  - recipe_seasons (M:N)
--  - recipe_dish_types (M:N)
-- With minimal RLS policies similar to ingredients/steps

-- 1) recipe_seasons
create table if not exists public.recipe_seasons (
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  season text not null check (season in ('winter','spring','summer','autumn')),
  created_at timestamp with time zone default now(),
  primary key (recipe_id, season)
);

alter table public.recipe_seasons enable row level security;

create policy if not exists "Public can read seasons of public recipes"
on public.recipe_seasons for select
to public
using (
  exists (
    select 1 from public.recipes r
    where r.id = recipe_seasons.recipe_id
      and r.is_public = true
  )
);

create policy if not exists "Author can manage seasons of own recipes"
on public.recipe_seasons for all
to authenticated
using (
  exists (
    select 1 from public.recipes r
    where r.id = recipe_seasons.recipe_id
      and r.author_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.recipes r
    where r.id = recipe_seasons.recipe_id
      and r.author_id = auth.uid()
  )
);

-- 2) recipe_dish_types
create table if not exists public.recipe_dish_types (
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  dish_type text not null check (dish_type in ('breakfast','lunch','dinner','dessert')),
  created_at timestamp with time zone default now(),
  primary key (recipe_id, dish_type)
);

alter table public.recipe_dish_types enable row level security;

create policy if not exists "Public can read dish types of public recipes"
on public.recipe_dish_types for select
to public
using (
  exists (
    select 1 from public.recipes r
    where r.id = recipe_dish_types.recipe_id
      and r.is_public = true
  )
);

create policy if not exists "Author can manage dish types of own recipes"
on public.recipe_dish_types for all
to authenticated
using (
  exists (
    select 1 from public.recipes r
    where r.id = recipe_dish_types.recipe_id
      and r.author_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.recipes r
    where r.id = recipe_dish_types.recipe_id
      and r.author_id = auth.uid()
  )
);
