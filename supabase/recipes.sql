-- Glutenfria recept — redigerbara i Supabase.
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  servings text,
  cook_time text,
  ingredients text[] not null default '{}',
  steps text[] not null default '{}',
  source_url text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recipes enable row level security;

create policy "recipes_select" on public.recipes for select using (true);
create policy "recipes_insert" on public.recipes for insert with check (true);
create policy "recipes_update" on public.recipes for update using (true) with check (true);
create policy "recipes_delete" on public.recipes for delete using (true);
