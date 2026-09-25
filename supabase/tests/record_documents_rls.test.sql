-- record_documents ve record-documents bucket'ı için yetki, RLS ve trigger testleri.
-- Yükleme, storage.objects tablosuna doğrudan satır eklenerek simüle edilir
-- (Storage API de aynı RLS politikalarıyla bu tabloya yazar).
begin;
create extension if not exists pgtap with schema extensions;

select plan(26);

-- ---------- Hazırlık (yetkili rol) ----------
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'owner-a@test.local'),
  ('22222222-2222-2222-2222-222222222222', 'user-b@test.local');

insert into public.vehicles (id, owner_id, plate, make, model, model_year) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '34ABC123', 'Toyota', 'Corolla', 2021),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '06DEF45', 'Renault', 'Clio', 2018);

insert into public.service_records (id, vehicle_id, service_name, service_date, odometer_km, description, entered_by) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ABC Oto', '2025-03-12', 58700, 'Yağ değişimi', 'owner'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Yetkili Servis', '2024-01-10', 40000, 'Bakım', 'service'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Eski Servis', '2023-01-10', 30000, 'Silinecek', 'owner'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'B Servis', '2025-01-01', 1000, 'B kaydı', 'owner');
update public.service_records set deleted_at = now() where id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

-- Yetkili rolle konmuş nesneler (RLS'in satır eklemede yakaladığı durumları test etmek için).
insert into storage.objects (bucket_id, name, metadata) values
  ('record-documents', '11111111-1111-1111-1111-111111111111/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee/svc.webp', '{"mimetype": "image/webp", "size": 100}'),
  ('record-documents', '11111111-1111-1111-1111-111111111111/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/ffffffff-ffff-ffff-ffff-ffffffffffff/del.webp', '{"mimetype": "image/webp", "size": 100}'),
  ('record-documents', '22222222-2222-2222-2222-222222222222/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/dddddddd-dddd-dddd-dddd-dddddddddddd/b.pdf', '{"mimetype": "application/pdf", "size": 2048}');

select is(
  (select public from storage.buckets where id = 'record-documents'),
  false,
  'record-documents bucket''ı private'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.record_documents'::regclass),
  true,
  'record_documents tablosunda RLS açık'
);

-- ---------- Kullanıcı A ----------
set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$ insert into storage.objects (bucket_id, name, metadata) values ('record-documents',
     '11111111-1111-1111-1111-111111111111/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/cccccccc-cccc-cccc-cccc-cccccccccccc/fis.webp',
     '{"mimetype": "image/webp", "size": 12345}') $$,
  'A kendi kaydının klasörüne dosya yükleyebilir'
);
-- Üzerine yazma yok: storage.objects için UPDATE politikası tanımlı değil.
select is_empty(
  $$ update storage.objects set metadata = '{"mimetype": "image/webp", "size": 1}'
     where bucket_id = 'record-documents' and name = '11111111-1111-1111-1111-111111111111/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/cccccccc-cccc-cccc-cccc-cccccccccccc/fis.webp' returning 1 $$,
  'A kendi dosyasının üzerine yazamaz (UPDATE hiçbir satırı etkilemez)'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name, metadata) values ('record-documents',
     '11111111-1111-1111-1111-111111111111/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/cccccccc-cccc-cccc-cccc-cccccccccccc/fis.webp', '{"mimetype": "image/webp", "size": 1}')
     on conflict (bucket_id, name) do update set metadata = excluded.metadata $$,
  '42501', null,
  'A kendi dosyasının üzerine upsert ile yazamaz'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('record-documents',
     '22222222-2222-2222-2222-222222222222/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/dddddddd-dddd-dddd-dddd-dddddddddddd/x.webp') $$,
  '42501', null,
  'A başka kullanıcının klasörüne dosya yükleyemez'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('record-documents',
     '11111111-1111-1111-1111-111111111111/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/dddddddd-dddd-dddd-dddd-dddddddddddd/x.webp') $$,
  '42501', null,
  'A kendi klasöründe bile B''nin kaydı adına dosya yükleyemez'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('record-documents',
     '11111111-1111-1111-1111-111111111111/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee/x.webp') $$,
  '42501', null,
  'servis tarafından girilmiş kayda araç sahibi dosya yükleyemez'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('record-documents',
     '11111111-1111-1111-1111-111111111111/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/ffffffff-ffff-ffff-ffff-ffffffffffff/x.webp') $$,
  '42501', null,
  'silinmiş kayda dosya yüklenemez'
);

select lives_ok(
  $$ insert into public.record_documents (record_id, storage_path, file_name) values ('cccccccc-cccc-cccc-cccc-cccccccccccc',
     '11111111-1111-1111-1111-111111111111/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/cccccccc-cccc-cccc-cccc-cccccccccccc/fis.webp', 'fis.webp') $$,
  'A kendi kaydına belge kaydı ekleyebilir'
);
select is(
  (select mime_type || ' ' || file_size || ' ' || type from public.record_documents where file_name = 'fis.webp'),
  'image/webp 12345 photo',
  'tür ve boyut istemciden değil, depodaki nesneden alınır; görsel "photo" sayılır'
);
select throws_ok(
  $$ insert into public.record_documents (record_id, storage_path, file_name, mime_type, file_size) values ('cccccccc-cccc-cccc-cccc-cccccccccccc',
     '11111111-1111-1111-1111-111111111111/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/cccccccc-cccc-cccc-cccc-cccccccccccc/fis2.webp', 'fis2.webp', 'application/pdf', 1) $$,
  '42501', null,
  'istemci mime_type/file_size yazamaz'
);
select throws_ok(
  $$ insert into public.record_documents (record_id, storage_path, file_name) values ('cccccccc-cccc-cccc-cccc-cccccccccccc',
     '11111111-1111-1111-1111-111111111111/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/cccccccc-cccc-cccc-cccc-cccccccccccc/yok.webp', 'yok.webp') $$,
  'P0002', null,
  'depoda olmayan dosya için belge kaydı oluşturulamaz'
);
select throws_ok(
  $$ insert into public.record_documents (record_id, storage_path, file_name) values ('cccccccc-cccc-cccc-cccc-cccccccccccc',
     '11111111-1111-1111-1111-111111111111/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee/svc.webp', 'svc.webp') $$,
  '42501', null,
  'belge yolu, bağlandığı kaydın klasöründe olmalı'
);
select throws_ok(
  $$ insert into public.record_documents (record_id, storage_path, file_name) values ('dddddddd-dddd-dddd-dddd-dddddddddddd',
     '22222222-2222-2222-2222-222222222222/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/dddddddd-dddd-dddd-dddd-dddddddddddd/b.pdf', 'b.pdf') $$,
  '42501', null,
  'A, B''nin kaydına belge bağlayamaz'
);
select throws_ok(
  $$ insert into public.record_documents (record_id, storage_path, file_name) values ('ffffffff-ffff-ffff-ffff-ffffffffffff',
     '11111111-1111-1111-1111-111111111111/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/ffffffff-ffff-ffff-ffff-ffffffffffff/del.webp', 'del.webp') $$,
  '42501', null,
  'silinmiş kayda belge bağlanamaz'
);
select throws_ok(
  $$ update public.record_documents set file_name = 'degisti.webp' $$,
  '42501', null,
  'belge kaydı güncellenemez'
);
select is(
  (select count(*) from public.service_record_audits
   where record_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' and action = 'document_added'
     and new_values ->> 'file_name' = 'fis.webp'),
  1::bigint,
  'belge ekleme kaydın değişiklik geçmişine yazılır'
);

-- Kayıt başına en fazla 10 belge
do $$
begin
  for i in 2..10 loop
    insert into storage.objects (bucket_id, name, metadata) values ('record-documents',
      '11111111-1111-1111-1111-111111111111/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/cccccccc-cccc-cccc-cccc-cccccccccccc/f' || i || '.webp',
      '{"mimetype": "image/webp", "size": 10}');
    insert into public.record_documents (record_id, storage_path, file_name) values ('cccccccc-cccc-cccc-cccc-cccccccccccc',
      '11111111-1111-1111-1111-111111111111/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/cccccccc-cccc-cccc-cccc-cccccccccccc/f' || i || '.webp',
      'f' || i || '.webp');
  end loop;
  insert into storage.objects (bucket_id, name, metadata) values ('record-documents',
    '11111111-1111-1111-1111-111111111111/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/cccccccc-cccc-cccc-cccc-cccccccccccc/f11.pdf',
    '{"mimetype": "application/pdf", "size": 10}');
end;
$$;
select throws_ok(
  $$ insert into public.record_documents (record_id, storage_path, file_name) values ('cccccccc-cccc-cccc-cccc-cccccccccccc',
     '11111111-1111-1111-1111-111111111111/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/cccccccc-cccc-cccc-cccc-cccccccccccc/f11.pdf', 'f11.pdf') $$,
  '54000', null,
  'bir kayda en fazla 10 belge eklenebilir'
);

-- ---------- Kullanıcı B ----------
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is(
  (select count(*) from public.record_documents where record_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  0::bigint,
  'B, A''nın belgelerini göremez'
);
select is(
  (select count(*) from storage.objects where bucket_id = 'record-documents' and name like '11111111-%'),
  0::bigint,
  'B, A''nın dosyalarını depoda göremez (signed URL de üretemez)'
);
delete from public.record_documents where record_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

-- ---------- Tekrar A ----------
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select is(
  (select count(*) from public.record_documents where record_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  10::bigint,
  'B''nin silme denemesi A''nın belgelerini etkilemedi'
);
select lives_ok(
  $$ delete from public.record_documents where file_name = 'fis.webp' $$,
  'A kendi belgesini kaldırabilir'
);
select is(
  (select old_values ->> 'file_name' from public.service_record_audits
   where record_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' and action = 'document_removed'),
  'fis.webp',
  'belge kaldırma kaydın değişiklik geçmişine yazılır'
);

-- ---------- Anonim ----------
reset role;
set local role anon;
set local request.jwt.claims = '{"role": "anon"}';

select throws_ok(
  $$ select * from public.record_documents $$,
  '42501', null,
  'anonim kullanıcı belge tablosunu okuyamaz'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('record-documents',
     '11111111-1111-1111-1111-111111111111/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/cccccccc-cccc-cccc-cccc-cccccccccccc/anon.webp') $$,
  '42501', null,
  'anonim kullanıcı dosya yükleyemez'
);

select * from finish();
rollback;
