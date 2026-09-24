-- Adım 7: Paylaşım kodları (access_tokens)
--
-- Kod düz metin saklanmaz; yalnızca SHA-256 hash'i (hex) tutulur. Kod sahibine yalnızca
-- oluşturulduğu anda bir kez gösterilir. Varsayılan geçerlilik 24 saat, iptal edilebilir.
-- Kodun doğrulanması (plaka + kod) paylaşım görünümü adımında sunucu tarafında yapılır.

create table public.access_tokens (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  code_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours',
  revoked_at timestamptz,

  constraint access_tokens_code_hash_format check (code_hash ~ '^[0-9a-f]{64}$'),
  constraint access_tokens_expiry_window
    check (expires_at > created_at and expires_at <= created_at + interval '30 days')
);

comment on column public.access_tokens.code_hash is
  'Normalize edilmiş kodun (büyük harf, tiresiz) SHA-256 hash''i. İstemciye hiçbir zaman döndürülmez.';

create index access_tokens_vehicle_idx on public.access_tokens (vehicle_id, created_at desc);

-- İptal zamanını sunucu belirler; iptal edilmiş kod yeniden açılamaz.
create or replace function public.guard_access_token_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.revoked_at is not null then
    raise exception 'İptal edilmiş paylaşım kodu değiştirilemez.'
      using errcode = '55000';
  end if;

  if new.revoked_at is not null then
    new.revoked_at := now();
  end if;

  return new;
end;
$$;

create trigger access_tokens_guard_update
  before update on public.access_tokens
  for each row execute function public.guard_access_token_update();

-- Yetkiler: hash okunamaz; süre istemciden belirlenemez; yalnızca iptal güncellenebilir; silme yok.
revoke all on table public.access_tokens from anon, authenticated;
grant select (id, vehicle_id, created_at, expires_at, revoked_at)
  on table public.access_tokens to authenticated;
grant insert (vehicle_id, code_hash) on table public.access_tokens to authenticated;
grant update (revoked_at) on table public.access_tokens to authenticated;

alter table public.access_tokens enable row level security;

create policy "access_tokens_select_own_vehicle"
  on public.access_tokens for select
  to authenticated
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.owner_id = (select auth.uid())
    )
  );

create policy "access_tokens_insert_own_vehicle"
  on public.access_tokens for insert
  to authenticated
  with check (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.owner_id = (select auth.uid())
    )
  );

create policy "access_tokens_update_own_vehicle"
  on public.access_tokens for update
  to authenticated
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.owner_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.owner_id = (select auth.uid())
    )
  );
