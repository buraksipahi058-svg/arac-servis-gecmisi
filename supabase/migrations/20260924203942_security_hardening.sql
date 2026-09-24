-- Adım 9: Güvenlik gözden geçirmesi sonrası sıkılaştırma

-- 1) Varsayılan yetkiler: public şemasında ileride oluşturulacak tablo, sequence ve
--    fonksiyonlar anon/authenticated rollerine OTOMATİK açılmasın. Yeni her nesne için
--    yetkiler migration'da açıkça verilir (mevcut tablolarda olduğu gibi); bir migration'da
--    RLS veya revoke unutulsa bile tablo istemciye açık kalmaz.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated;
-- Not: Postgres, fonksiyonlara PUBLIC için EXECUTE yetkisini sistem genelinde verir ve bu
-- şemaya özel varsayılanlarla kaldırılamaz. Bu yüzden her yeni fonksiyonda
-- "revoke execute ... from public, anon, authenticated" açıkça yazılır;
-- supabase/tests/security_hardening.test.sql bunu denetler.

-- 2) Trigger fonksiyonları doğrudan çağrılamaz; yine de istemci rollerinin yetkisi kaldırılır.
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.guard_service_record_update() from public, anon, authenticated;
revoke execute on function public.guard_access_token_update() from public, anon, authenticated;

-- 3) Veritabanı denetleyicisinin (supabase db advisors) bulgusu: FK için eksik indeks.
create index service_records_service_id_idx
  on public.service_records (service_id)
  where service_id is not null;

-- Not: public.services tablosunda RLS açık ve politika yok; bu bilinçlidir.
-- Servis hesabı özelliği gelene kadar tablo istemciye tamamen kapalıdır.
comment on table public.services is
  'Servis tanımı. MVP''de istemciye kapalı (RLS açık, politika ve yetki yok).';
