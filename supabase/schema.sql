create table if not exists public.saved_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null check (status in ('safe','warning','unsafe')),
  category text,
  note text,
  brand text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.saved_products enable row level security;

-- Appen är öppen: tillåt anon att göra allt.
create policy "open_select" on public.saved_products for select using (true);
create policy "open_insert" on public.saved_products for insert with check (true);
create policy "open_update" on public.saved_products for update using (true) with check (true);
create policy "open_delete" on public.saved_products for delete using (true);
