-- Shared cache for the API-Football proxy (supabase/functions/football).
-- Only the Edge Function (service role) reads and writes it; RLS with no policies blocks app users.
create table if not exists public.api_football_cache (
  key text primary key,
  body text not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.api_football_cache enable row level security;

create index if not exists api_football_cache_expires_at_idx on public.api_football_cache (expires_at);
