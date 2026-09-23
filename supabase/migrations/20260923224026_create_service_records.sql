-- Adım 3: Servisler, servis kayıtları ve değişiklik geçmişi (audit)

-- ---------------------------------------------------------------------------
-- services: Servis tanımı (ad, telefon, adres).
-- MVP'de servis hesabı/onboarding yok; kayıtlar servis adını serbest metin olarak tutar.
-- Tablo, ileride servisin kaydı girmesi için veri modelinde yer alır. Şimdilik istemciye kapalı.
-- ---------------------------------------------------------------------------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint services_name_length check (char_length(btrim(name)) between 1 and 100),
  constraint services_phone_length check (phone is null or char_length(phone) <= 30),
  constraint services_address_length check (address is null or char_length(address) <= 300)
);

create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

revoke all on table public.services from anon, authenticated;
alter table public.services enable row level security;

-- ---------------------------------------------------------------------------
-- service_records
-- ---------------------------------------------------------------------------
create table public.service_records (
  id uuid primary key default gen_random_uuid(),
  -- Kaydı olan araç silinemez (soft delete edilmiş kayıtlar dahil).
  vehicle_id uuid not null references public.vehicles (id) on delete restrict,
  -- Servis hesabı ile ilişki opsiyonel; ad her zaman service_name'de tutulur.
  service_id uuid references public.services (id) on delete set null,
  service_name text not null,
  service_date date not null,
  odometer_km integer not null,
  description text not null,
  -- Kaydı kimin girdiği. Uygulama bunu "doğrulanmış" olarak yorumlamaz, sadece gösterir.
  entered_by text not null default 'owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  constraint service_records_service_name_length
    check (char_length(btrim(service_name)) between 1 and 100),
  constraint service_records_description_length
    check (char_length(btrim(description)) between 1 and 2000),
  constraint service_records_odometer_range
    check (odometer_km between 0 and 2000000),
  constraint service_records_service_date_range
    check (service_date >= date '1900-01-01'),
  constraint service_records_entered_by_values
    check (entered_by in ('owner', 'service'))
);

comment on column public.service_records.entered_by is
  'owner: araç sahibi tarafından girildi, service: servis tarafından girildi.';
comment on column public.service_records.deleted_at is
  'Soft delete. Silinmiş kayıt değiştirilemez ve geri alınamaz.';

create index service_records_vehicle_date_idx
  on public.service_records (vehicle_id, service_date desc, created_at desc);

-- Silinmiş kayıtları kilitler; silme zamanını sunucu belirler.
create or replace function public.guard_service_record_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.deleted_at is not null then
    raise exception 'Silinmiş servis kaydı değiştirilemez.'
      using errcode = '55000';
  end if;

  if new.deleted_at is not null then
    new.deleted_at := now();
  end if;

  return new;
end;
$$;

create trigger service_records_guard_update
  before update on public.service_records
  for each row execute function public.guard_service_record_update();

create trigger service_records_set_updated_at
  before update on public.service_records
  for each row execute function public.set_updated_at();

-- Yetkiler: kalıcı silme yok; vehicle_id, entered_by ve zaman damgaları istemciden yazılamaz.
revoke all on table public.service_records from anon, authenticated;
grant select on table public.service_records to authenticated;
grant insert (vehicle_id, service_name, service_date, odometer_km, description)
  on table public.service_records to authenticated;
grant update (service_name, service_date, odometer_km, description, deleted_at)
  on table public.service_records to authenticated;

alter table public.service_records enable row level security;

create policy "service_records_select_own_vehicle"
  on public.service_records for select
  to authenticated
  using (
    exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.owner_id = (select auth.uid())
    )
  );

create policy "service_records_insert_own_vehicle"
  on public.service_records for insert
  to authenticated
  with check (
    entered_by = 'owner'
    and exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.owner_id = (select auth.uid())
    )
  );

-- Araç sahibi yalnızca kendi girdiği kayıtları düzenleyebilir/silebilir.
create policy "service_records_update_own_entries"
  on public.service_records for update
  to authenticated
  using (
    entered_by = 'owner'
    and exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.owner_id = (select auth.uid())
    )
  )
  with check (
    entered_by = 'owner'
    and exists (
      select 1 from public.vehicles v
      where v.id = vehicle_id and v.owner_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- service_record_audits: Kayıtların sessizce değiştirilmesini önlemek için
-- her ekleme/düzenleme/silme trigger ile yazılır. İstemci bu tabloya yazamaz.
-- ---------------------------------------------------------------------------
create table public.service_record_audits (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.service_records (id) on delete cascade,
  action text not null,
  changed_by uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz not null default now(),

  constraint service_record_audits_action_values
    check (action in ('insert', 'update', 'soft_delete'))
);

create index service_record_audits_record_idx
  on public.service_record_audits (record_id, created_at);

create or replace function public.audit_service_record()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_row jsonb;
  new_row jsonb;
  old_diff jsonb := '{}'::jsonb;
  new_diff jsonb := '{}'::jsonb;
  field text;
begin
  if tg_op = 'INSERT' then
    insert into public.service_record_audits (record_id, action, changed_by, new_values)
    values (
      new.id,
      'insert',
      auth.uid(),
      to_jsonb(new) - array['id', 'created_at', 'updated_at', 'deleted_at']
    );
    return null;
  end if;

  -- Yalnızca değişen alanlar saklanır.
  old_row := to_jsonb(old) - 'updated_at';
  new_row := to_jsonb(new) - 'updated_at';
  for field in select jsonb_object_keys(new_row) loop
    if new_row -> field is distinct from old_row -> field then
      old_diff := old_diff || jsonb_build_object(field, old_row -> field);
      new_diff := new_diff || jsonb_build_object(field, new_row -> field);
    end if;
  end loop;

  if new_diff = '{}'::jsonb then
    return null;
  end if;

  insert into public.service_record_audits (record_id, action, changed_by, old_values, new_values)
  values (
    new.id,
    case when old.deleted_at is null and new.deleted_at is not null then 'soft_delete' else 'update' end,
    auth.uid(),
    old_diff,
    new_diff
  );
  return null;
end;
$$;

revoke execute on function public.audit_service_record() from public, anon, authenticated;

create trigger service_records_audit
  after insert or update on public.service_records
  for each row execute function public.audit_service_record();

revoke all on table public.service_record_audits from anon, authenticated;
grant select on table public.service_record_audits to authenticated;

alter table public.service_record_audits enable row level security;

create policy "service_record_audits_select_own_vehicle"
  on public.service_record_audits for select
  to authenticated
  using (
    exists (
      select 1
      from public.service_records r
      join public.vehicles v on v.id = r.vehicle_id
      where r.id = record_id and v.owner_id = (select auth.uid())
    )
  );
