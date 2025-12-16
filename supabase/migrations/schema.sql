-- schema.sql

create table if not exists profiles (
  id uuid primary key,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  main_image_url text,
  cook_time_minutes integer,
  servings integer not null,
  season text not null check (season in ('winter','spring','summer','autumn')),
  is_public boolean not null default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes(id) on delete cascade,
  name text not null,
  quantity numeric(10,2) not null,
  unit text,
  order_index integer
);

create table if not exists recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes(id) on delete cascade,
  step_number integer,
  text text not null,
  image_url text
);

create table if not exists saved_recipes (
  user_id uuid not null references profiles(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, recipe_id)
);
