-- Увімкнути RLS
alter table profiles enable row level security;
alter table recipes enable row level security;
alter table recipe_ingredients enable row level security;
alter table recipe_steps enable row level security;
alter table saved_recipes enable row level security;

-- PROFILES
create policy "profiles_select_own"
on profiles for select
using (auth.uid() = id);

create policy "profiles_insert_own"
on profiles for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- RECIPES
create policy "recipes_select_public_or_own"
on recipes for select
using (is_public = true or auth.uid() = author_id);

create policy "recipes_insert_own"
on recipes for insert
with check (auth.uid() = author_id);

create policy "recipes_update_own"
on recipes for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create policy "recipes_delete_own"
on recipes for delete
using (auth.uid() = author_id);

-- RECIPE_INGREDIENTS
create policy "ingredients_select_public_or_own"
on recipe_ingredients for select
using (
  exists (
    select 1 from recipes
    where recipes.id = recipe_ingredients.recipe_id
      and (recipes.is_public = true or recipes.author_id = auth.uid())
  )
);

create policy "ingredients_write_own"
on recipe_ingredients for all
using (
  exists (
    select 1 from recipes
    where recipes.id = recipe_ingredients.recipe_id
      and recipes.author_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from recipes
    where recipes.id = recipe_ingredients.recipe_id
      and recipes.author_id = auth.uid()
  )
);

-- RECIPE_STEPS
create policy "steps_select_public_or_own"
on recipe_steps for select
using (
  exists (
    select 1 from recipes
    where recipes.id = recipe_steps.recipe_id
      and (recipes.is_public = true or recipes.author_id = auth.uid())
  )
);

create policy "steps_write_own"
on recipe_steps for all
using (
  exists (
    select 1 from recipes
    where recipes.id = recipe_steps.recipe_id
      and recipes.author_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from recipes
    where recipes.id = recipe_steps.recipe_id
      and recipes.author_id = auth.uid()
  )
);

-- SAVED_RECIPES
create policy "saved_select_own"
on saved_recipes for select
using (auth.uid() = user_id);

create policy "saved_insert_own"
on saved_recipes for insert
with check (auth.uid() = user_id);

create policy "saved_delete_own"
on saved_recipes for delete
using (auth.uid() = user_id);
