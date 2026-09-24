-- Genel güvenlik kontrolleri: tüm public tablolarda RLS, istemci rollerinin varsayılan
-- yetkileri ve fonksiyon ayarları. Yeni tablo/fonksiyon eklendiğinde de geçerli kalır.
begin;
create extension if not exists pgtap with schema extensions;

select plan(7);

select is(
  (select count(*) from pg_class
   where relnamespace = 'public'::regnamespace and relkind in ('r', 'p') and not relrowsecurity),
  0::bigint,
  'public şemasındaki tüm tablolarda RLS açık'
);
select is(
  (select count(*) from information_schema.role_table_grants
   where table_schema = 'public' and grantee = 'anon'),
  0::bigint,
  'anon rolünün public şemasında hiçbir tablo yetkisi yok'
);
select is(
  (select count(*) from pg_proc
   where pronamespace = 'public'::regnamespace and prosecdef
     and (proconfig is null or not exists (select 1 from unnest(proconfig) c where c like 'search_path=%'))),
  0::bigint,
  'security definer fonksiyonların hepsinde search_path sabit'
);
select is(
  (select count(*) from pg_proc
   where pronamespace = 'public'::regnamespace
     and (has_function_privilege('anon', oid, 'EXECUTE') or has_function_privilege('authenticated', oid, 'EXECUTE'))),
  0::bigint,
  'public fonksiyonları istemci rolleri tarafından çalıştırılamaz'
);
select is(
  (select public from storage.buckets where id = 'record-documents'),
  false,
  'belge bucket''ı private'
);

-- Varsayılan yetkiler: yeni oluşturulan tablolar istemci rollerine açılmaz.
create table public.__hardening_probe (id int);
select is(
  (select count(*) from information_schema.role_table_grants
   where table_name = '__hardening_probe' and grantee in ('anon', 'authenticated')),
  0::bigint,
  'yeni tablolar varsayılan olarak anon/authenticated rollerine açılmaz'
);
select is(
  (select count(*) from pg_default_acl
   where defaclnamespace = 'public'::regnamespace and defaclrole = 'postgres'::regrole
     and array_to_string(defaclacl, ',') ~ '(^|,)(anon|authenticated)='),
  0::bigint,
  'public şemasının varsayılan yetkilerinde anon/authenticated yok (tablo, sequence, fonksiyon)'
);

select * from finish();
rollback;
