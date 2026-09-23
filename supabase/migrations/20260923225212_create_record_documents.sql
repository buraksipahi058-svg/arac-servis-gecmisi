-- Adım 4: Servis kaydı belgeleri/fotoğrafları (Supabase Storage + record_documents)
--
-- Dosyalar private bucket'ta tutulur; DB'de yalnızca metadata/path saklanır.
-- Path: {owner_id}/{vehicle_id}/{record_id}/{uuid}.{ext}
-- Erişim yalnızca kısa ömürlü signed URL ile olur.

-- ---------------------------------------------------------------------------
-- Bucket: private, 10 MB sınırı, yalnızca JPG/PNG/WEBP/PDF (Storage sunucusu uygular)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'record-documents',
  'record-documents',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
);

-- Yükleme yalnızca: kendi klasörüne (1. klasör = auth.uid()), kendi aracının
-- silinmemiş ve kendi girdiği kaydının klasörüne yapılabilir.
create policy "record_documents_objects_insert_own_record"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'record-documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and exists (
      select 1
      from public.service_records r
      join public.vehicles v on v.id = r.vehicle_id
      where v.owner_id = (select auth.uid())
        and v.id::text = (storage.foldername(name))[2]
        and r.id::text = (storage.foldername(name))[3]
        and r.deleted_at is null
        and r.entered_by = 'owner'
    )
  );

-- Okuma (signed URL üretimi dahil) yalnızca kendi klasöründe.
create policy "record_documents_objects_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'record-documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Silme, yükleme ile aynı koşullara bağlı: kaydı silinmiş veya servis girişli
-- olan belgelerin dosyası kaldırılamaz (record_documents silme kuralıyla tutarlı).
create policy "record_documents_objects_delete_own_record"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'record-documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and exists (
      select 1
      from public.service_records r
      join public.vehicles v on v.id = r.vehicle_id
      where v.owner_id = (select auth.uid())
        and v.id::text = (storage.foldername(name))[2]
        and r.id::text = (storage.foldername(name))[3]
        and r.deleted_at is null
        and r.entered_by = 'owner'
    )
  );

-- Update (üzerine yazma) politikası yok: yüklenen dosya değiştirilemez.

-- ---------------------------------------------------------------------------
-- record_documents
-- ---------------------------------------------------------------------------
create table public.record_documents (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.service_records (id) on delete restrict,
  storage_path text not null unique,
  file_name text not null,
  -- mime_type ve file_size istemciden alınmaz; Storage'daki nesneden trigger ile kopyalanır.
  mime_type text not null,
  file_size integer not null,
  -- photo: görsel, document: PDF (zaman çizelgesinde "belge"/"fotoğraf" sayısı için)
  type text not null generated always as (
    case when mime_type = 'application/pdf' then 'document' else 'photo' end
  ) stored,
  created_at timestamptz not null default now(),

  constraint record_documents_file_name_length
    check (char_length(btrim(file_name)) between 1 and 255),
  constraint record_documents_mime_type_values
    check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')),
  constraint record_documents_file_size_range
    check (file_size between 1 and 10485760)
);

create index record_documents_record_idx on public.record_documents (record_id, created_at);

-- Nesnenin gerçekten yüklendiğini doğrular, gerçek tür/boyutu nesneden alır ve
-- kayıt başına belge sayısını sınırlar.
create or replace function public.prepare_record_document()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  object_metadata jsonb;
begin
  select o.metadata into object_metadata
  from storage.objects o
  where o.bucket_id = 'record-documents' and o.name = new.storage_path
  order by o.created_at desc
  limit 1;

  if object_metadata is null then
    raise exception 'Belge dosyası depolamada bulunamadı.'
      using errcode = 'P0002';
  end if;

  if (select count(*) from public.record_documents d where d.record_id = new.record_id) >= 10 then
    raise exception 'Bir servis kaydına en fazla 10 belge eklenebilir.'
      using errcode = '54000';
  end if;

  new.mime_type := object_metadata ->> 'mimetype';
  new.file_size := (object_metadata ->> 'size')::integer;
  return new;
end;
$$;

revoke execute on function public.prepare_record_document() from public, anon, authenticated;

create trigger record_documents_prepare
  before insert on public.record_documents
  for each row execute function public.prepare_record_document();

-- Yetkiler: güncelleme yok; istemci yalnızca kayıt, path ve dosya adını yazar.
revoke all on table public.record_documents from anon, authenticated;
grant select, delete on table public.record_documents to authenticated;
grant insert (record_id, storage_path, file_name) on table public.record_documents to authenticated;

alter table public.record_documents enable row level security;

create policy "record_documents_select_own_vehicle"
  on public.record_documents for select
  to authenticated
  using (
    exists (
      select 1
      from public.service_records r
      join public.vehicles v on v.id = r.vehicle_id
      where r.id = record_id and v.owner_id = (select auth.uid())
    )
  );

create policy "record_documents_insert_own_record"
  on public.record_documents for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.service_records r
      join public.vehicles v on v.id = r.vehicle_id
      where r.id = record_id
        and v.owner_id = (select auth.uid())
        and r.deleted_at is null
        and r.entered_by = 'owner'
        and storage_path like (select auth.uid()::text) || '/' || v.id::text || '/' || r.id::text || '/%'
    )
  );

create policy "record_documents_delete_own_record"
  on public.record_documents for delete
  to authenticated
  using (
    exists (
      select 1
      from public.service_records r
      join public.vehicles v on v.id = r.vehicle_id
      where r.id = record_id
        and v.owner_id = (select auth.uid())
        and r.deleted_at is null
        and r.entered_by = 'owner'
    )
  );

-- ---------------------------------------------------------------------------
-- Belge ekleme/kaldırma da kaydın değişiklik geçmişine yazılır.
-- ---------------------------------------------------------------------------
alter table public.service_record_audits
  drop constraint service_record_audits_action_values;
alter table public.service_record_audits
  add constraint service_record_audits_action_values
  check (action in ('insert', 'update', 'soft_delete', 'document_added', 'document_removed'));

create or replace function public.audit_record_document()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.service_record_audits (record_id, action, changed_by, new_values)
    values (new.record_id, 'document_added', auth.uid(),
            jsonb_build_object('file_name', new.file_name, 'type', new.type));
    return null;
  end if;

  insert into public.service_record_audits (record_id, action, changed_by, old_values)
  values (old.record_id, 'document_removed', auth.uid(),
          jsonb_build_object('file_name', old.file_name, 'type', old.type));
  return null;
end;
$$;

revoke execute on function public.audit_record_document() from public, anon, authenticated;

create trigger record_documents_audit
  after insert or delete on public.record_documents
  for each row execute function public.audit_record_document();
