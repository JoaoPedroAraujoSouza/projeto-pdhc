create extension if not exists "pgcrypto";

create table if not exists specialties (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);