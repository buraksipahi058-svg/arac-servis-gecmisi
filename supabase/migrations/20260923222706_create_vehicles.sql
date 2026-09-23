-- Adım 2: Araçlar (vehicles)
-- Kullanıcı tablosu ayrıca tutulmaz; sahiplik auth.users üzerinden kurulur.

-- updated_at'i güncelleyen genel trigger fonksiyonu (sonraki tablolar da kullanacak).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Normalize edilmiş plaka: büyük harf, boşluksuz (örn. 34ABC123). Gösterimde biçimlendirilir.
  plate text not null,
  make text not null,
  model text not null,
  model_year smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint vehicles_plate_format
    check (plate ~ '^(0[1-9]|[1-7][0-9]|8[01])[A-Z]{1,3}[0-9]{2,4}$'),
  constraint vehicles_make_length
    check (char_length(btrim(make)) between 1 and 50),
  constraint vehicles_model_length
    check (char_length(btrim(model)) between 1 and 50),
  constraint vehicles_model_year_range
    check (model_year between 1900 and 2100),
  -- Plaka yalnızca kullanıcı bazında tekil. Genel tekillik, başka birinin
  -- o plakayı kaydedip kaydetmediğini sızdırırdı.
  constraint vehicles_owner_plate_unique unique (owner_id, plate)
);

comment on table public.vehicles is 'Kullanıcıya ait araçlar. Erişim RLS ile yalnızca sahibine açıktır.';

create trigger vehicles_set_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

-- Yetkiler: varsayılan geniş yetkileri kaldır, yalnızca gerekenleri ver.
-- owner_id, id ve zaman damgaları istemciden yazılamaz.
revoke all on table public.vehicles from anon, authenticated;
grant select, delete on table public.vehicles to authenticated;
grant insert (plate, make, model, model_year) on table public.vehicles to authenticated;
grant update (plate, make, model, model_year) on table public.vehicles to authenticated;

-- RLS: kullanıcı yalnızca kendi araçlarını görür ve değiştirir.
alter table public.vehicles enable row level security;

create policy "vehicles_select_own"
  on public.vehicles for select
  to authenticated
  using (owner_id = (select auth.uid()));

create policy "vehicles_insert_own"
  on public.vehicles for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

create policy "vehicles_update_own"
  on public.vehicles for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "vehicles_delete_own"
  on public.vehicles for delete
  to authenticated
  using (owner_id = (select auth.uid()));
