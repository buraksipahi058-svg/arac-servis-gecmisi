# Güvenlik modeli ve gözden geçirme (Adım 9)

## Katmanlar

1. **Veritabanı (asıl koruma):** Tüm `public` tablolarında RLS açık. `anon` rolünün hiçbir tablo yetkisi yok.
   `authenticated` yalnızca gereken sütunlarda yetkili (sütun düzeyi GRANT); sahiplik alanları (`owner_id`),
   `entered_by`, zaman damgaları, belge türü/boyutu ve paylaşım kodu süresi istemciden yazılamaz.
   Paylaşım kodu hash'i istemciye okunamaz.
2. **Storage:** `record-documents` bucket'ı private (10 MB, JPG/PNG/WEBP/PDF). Yol
   `{owner_id}/{vehicle_id}/{record_id}/{uuid}.ext`; yükleme/silme yalnızca kendi aracının silinmemiş ve
   kendi girdiği kaydına. Üzerine yazma yok. Belgeler kısa ömürlü signed URL ile gösterilir.
3. **Sunucu (Next.js):** Oturum gerektiren her server action `requireUser` ile başlar; sayfalar proxy'ye ek
   olarak oturumu kendileri de doğrular. URL/form'dan gelen ID'ler UUID olarak doğrulanır; RLS ikinci katmandır.
4. **Paylaşım görünümü:** Plaka + kod sunucuda doğrulanır (hash, plaka, süre, iptal); tüm hatalarda aynı
   mesaj. Service role client (`src/lib/supabase/admin.ts`, `server-only`) yalnızca burada ve yalnızca
   whitelist alanlar için kullanılır. Erişim httpOnly çerezle, her istekte yeniden doğrulanır.
5. **Profiller ve onaylar:** Profiller yalnızca giriş yapmış kullanıcılara açıktır (anonim erişim ve
   paylaşım görünümü dışında); e-posta profilde tutulmaz, telefon isteğe bağlıdır. Kullanıcı yalnızca kendi
   profilini ve unvanlarını düzenler. Onay veren kişi DB'de `auth.uid()` ile belirlenir (başkası adına onay
   verilemez), onay için profil gerekir, kendi unvanı onaylanamaz, aynı unvan bir kez onaylanır, onayı
   yalnızca veren geri alır; unvan kaldırılınca onayları silinir.
   Not: Onaylar kullanıcı beyanıdır; sahte hesaplarla sayı şişirilebilir. Uygulama bunları "doğrulanmış"
   olarak sunmaz.
6. **Kayıt ve e-posta doğrulama:** Hesap, e-postadaki tek kullanımlık bağlantıyla doğrulanmadan oturum açamaz
   (`[auth.email] enable_confirmations`). Bağlantı `/auth/confirm` rotasına gelir: yalnızca `email`/`signup`
   türleri kabul edilir, token sunucuda `verifyOtp` ile doğrulanır, yönlendirme `safeNextPath` ile yalnızca
   `/dashboard` altına yapılır; geçersiz, süresi dolmuş veya kullanılmış bağlantılar aynı genel mesaja düşer.
   Kayıtlı bir adresle kayıt denemesi, yeni kayıtla aynı "E-postanı kontrol et" yanıtını alır. Bunun için
   GoTrue'da e-posta **ve** SMS otomatik onayı kapalı olmalıdır (`[auth.sms] enable_confirmations = true`);
   biri açıksa GoTrue "User already registered" döner. Aynı adrese en fazla dakikada bir doğrulama e-postası
   gönderilir.
   Not: GoTrue API'sine doğrudan yapılan kayıt isteğinde, kayıtlı adres için dönen sahte kullanıcının
   `identities` dizisi boştur; adresin kayıtlı olduğu API üzerinden yine anlaşılabilir (GoTrue kısıtı).
   Arayüz bunu göstermez; GoTrue'nun kayıt/giriş hız sınırı (`sign_in_sign_ups`) geçerlidir.

## Otomatik kontroller

- `npm run db:test` — pgTAP: RLS, yetkiler, trigger'lar, storage politikaları ve genel kurallar
  (`security_hardening.test.sql`: tüm tablolarda RLS, `anon` yetkisi yok, istemci rolleri public
  fonksiyonları çalıştıramaz, security definer fonksiyonlarda sabit `search_path`).
- `npx supabase db advisors --local` — Supabase güvenlik/performans denetleyicisi.
- `npm audit`

## Adım 9'da düzeltilenler

| Bulgu | Düzeltme |
| --- | --- |
| Girişteki `next` parametresi ile açık yönlendirme (`/%09/evil.com` → `evil.com`) | `safeNextPath`: URL ayrıştırma, kontrol karakteri reddi, yalnızca `/dashboard` altı |
| Giriş formunda deneme sınırı yoktu | İstemci + e-posta başına 15 dk'da 10 hatalı deneme |
| Güvenlik başlıkları yoktu, `X-Powered-By` açıktı | `X-Frame-Options`, `frame-ancestors`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` |
| Yeni tablo/fonksiyonlar varsayılan olarak `anon`/`authenticated`'a açılıyordu | `public` şeması varsayılan yetkileri kaldırıldı |
| Deneme sayacı sınırsız bellek kullanabiliyordu | En fazla 10.000 istemci anahtarı |
| `service_records.service_id` FK indeksi yoktu | İndeks eklendi |

## Production öncesi yapılacaklar

- [ ] HTTPS ve önünde `X-Forwarded-For`/`X-Forwarded-Proto` başlıklarını kendisi yazan güvenilir bir ters vekil
      (reverse proxy). Deneme sınırları `X-Forwarded-For`'a dayanır; vekil yoksa bu başlık istemci tarafından
      değiştirilebilir. Paylaşım çerezi HTTPS isteklerinde `secure` olarak yazılır.
- [ ] Supabase Auth: gerçek SMTP sağlayıcısı (yerelde e-postalar Mailpit'e düşer) ve buna uygun `email_sent`
      hız sınırı; `site_url` ve `additional_redirect_urls` production alan adıyla (doğrulama bağlantısı
      `site_url` üzerinden kurulur); `supabase/templates/confirmation.html` şablonu ve konu satırı projeye
      aktarılmalı; e-posta ve SMS otomatik onayı kapalı kalmalı (`MAILER_AUTOCONFIRM=false`,
      `SMS_AUTOCONFIRM=false`).
- [ ] Deneme sınırları bellek içi: birden fazla sunucu süreci varsa ortak bir depoya (ör. Postgres/Redis) taşı.
- [ ] Yerel CLI'ın paylaşılan varsayılan anahtarları yerine production projesinin anahtarları;
      `SUPABASE_SECRET_KEY` yalnızca sunucu ortam değişkeni olarak.
- [ ] İsteğe bağlı: paylaşım kodu hash'ine sunucu tarafı gizli anahtar (HMAC); belgeleri sunucu üzerinden
      aktarma (signed URL'lerde sahip/araç/kayıt UUID'leri görünür).

## Geliştirme hostu (192.168.1.13) hakkında

Supabase CLI yerel geliştirme içindir: tüm servisler `0.0.0.0`'a bağlanır. Veritabanı (54322) varsayılan
`postgres/postgres` şifresiyle, Studio (54323) ve Mailpit (54324) şifresiz olarak yerel ağa açıktır.
Mailpit'te doğrulama bağlantıları durduğundan, yerel ağdaki herkes bu bağlantılarla hesap doğrulayabilir.
Yerel ağda güvenilmeyen cihaz varsa bu portlar yalnızca host ve geliştirici bilgisayarına açılmalıdır
(Docker yayınlanan portlarda `ufw`'yi atladığı için kural `DOCKER-USER` zincirine yazılmalıdır).
