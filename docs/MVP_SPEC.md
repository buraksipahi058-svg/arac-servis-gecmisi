# Araç Servis Geçmişi — MVP Şartnamesi

Sen kıdemli bir full-stack geliştirici olarak çalışacaksın. Birlikte küçük adımlarla geliştireceğimiz bir MVP oluşturacağız.

## 1. PROJENİN AMACI

Amaç, bir aracın bakım, onarım ve parça değişimi geçmişini dijital olarak saklamak ve araç sahibinin kontrolünde gerektiğinde başka bir kişiye güvenli şekilde gösterebilmesini sağlayan basit bir platform geliştirmek.

Mevcut problem:

* Araç farklı zamanlarda farklı yetkili veya özel servislerde bakım görüyor.
* Her servis kendi sisteminde veya kağıt üzerinde kayıt tutuyor.
* Araç sahibi tüm geçmişi tek yerde göremiyor.
* Araç satılırken alıcı geçmişte hangi işlemlerin yapıldığını tam olarak göremiyor.
* Özellikle bağımsız/sokak arası servislerde yapılan işlemler merkezi bir sisteme aktarılmıyor.

Uygulamanın amacı ilk aşamada bu kayıtları tek yerde toplamaktır.

Uygulama:

* ekspertiz uygulaması değildir
* araç değerleme uygulaması değildir
* araç satın alma/satma platformu değildir
* servis marketplace'i değildir
* yapay zeka uygulaması değildir

İlk MVP sadece dijital araç geçmişi tutma ve kontrollü paylaşma problemine odaklanmalıdır.

---

## 2. TEKNOLOJİ STACK

Varsayılan olarak:

* Next.js
* TypeScript
* React
* Supabase
  * PostgreSQL
  * Authentication
  * Storage
* Tailwind CSS

kullan.

Mevcut projede farklı bir teknoloji varsa önce mevcut yapıyı incele ve gereksiz yere stack değiştirme.

Kod yazmadan önce mevcut repository'yi incele.

Öncelikle:

* klasör yapısı
* package.json
* mevcut componentler
* mevcut Supabase bağlantısı
* environment değişkenleri
* mevcut database yapısı

kontrol edilmeli.

Mevcut çalışan yapıyı gereksiz yere bozma.

---

## 3. MVP KAPSAMI

İlk versiyonda SADECE aşağıdaki özellikler olacak.

### Feature 1 — Kullanıcı hesabı

Kullanıcı:

* kayıt olabilir
* giriş yapabilir
* çıkış yapabilir

Supabase Auth kullanılabilir.

İlk MVP'de:

* sosyal login
* telefon doğrulama
* 2FA
* gelişmiş profil sistemi

YAPMA.

---

## 4. Feature 2 — Araç oluşturma

Giriş yapan kullanıcı kendi aracını sisteme ekleyebilmeli.

Alanlar:

* plaka
* marka
* model
* model yılı

Örnek:

34 ABC 123
Toyota
Corolla
2021

Database'de araç ile kullanıcı arasında owner ilişkisi bulunmalı.

Önemli:

Bir aracın sahibi olmayan kullanıcı, sadece plakayı bilerek aracın bilgilerine ulaşamamalı.

---

## 5. Feature 3 — Servis kaydı oluşturma

Araç sahibi aracına bir servis/bakım kaydı ekleyebilmeli.

Minimum alanlar:

* tarih
* kilometre
* servis adı
* işlem açıklaması

Örnek:

Tarih: 12.03.2025
Kilometre: 58.700
Servis: ABC Oto
İşlem: Motor yağı ve yağ filtresi değiştirildi.

İlk MVP'de işlem açıklaması serbest metin olabilir.

Henüz karmaşık kategori sistemi oluşturma.

---

## 6. Feature 4 — Fotoğraf / belge yükleme

Her servis kaydına opsiyonel olarak belge veya fotoğraf eklenebilmeli.

Örneğin:

* fatura
* servis fişi
* parça fotoğrafı
* kilometre göstergesi fotoğrafı
* yapılan işlemin fotoğrafı

Dosyalar Supabase Storage'da tutulmalı.

Dosyaları PostgreSQL içerisinde BLOB olarak saklama.

Database'de sadece dosyanın metadata/path bilgisini tut.

Örnek:

record_documents

* id
* record_id
* type
* storage_path
* file_name
* mime_type
* file_size
* created_at

Dosya tipi ve boyutu için makul limitler koy.

Örneğin:

* JPG
* JPEG
* PNG
* WEBP
* PDF

desteklenebilir.

Kullanıcı telefonundan büyük bir fotoğraf yüklerse mümkünse frontend/backend tarafında optimize et.

Orijinal 5-10 MB fotoğrafları gereksiz şekilde olduğu gibi saklamamaya çalış.

MVP için yaklaşık 1600 px genişlik civarında resize ve makul JPEG/WebP compression uygulanabilir.

Ancak görüntü kalitesini okunamayacak kadar düşürme.

---

## 7. Feature 5 — Araç geçmişi

Araç sahibi aracının bütün servis kayıtlarını timeline şeklinde görebilmeli.

Örneğin:

2025
58.700 km
ABC Oto
Motor yağı ve yağ filtresi değiştirildi.
[2 belge]

---

2024
52.100 km
XYZ Servis
Ön fren balataları değiştirildi.
[1 fotoğraf]

---

Timeline'da:

* tarih
* km
* servis
* açıklama
* belge/fotoğraf sayısı

görünmeli.

Kayda tıklayınca detay sayfası açılmalı.

---

## 8. KM TUTARSIZLIĞI KONTROLÜ

Bu MVP'de kesinlikle olmalı fakat basit tutulmalı.

Yeni bir servis kaydı oluşturulduğunda önceki kayıtlardaki kilometre değerleri kontrol edilmeli.

Örneğin:

12.03.2025 → 58.700 km

sonra:

20.05.2025 → 55.200 km

giriliyorsa:

"Kilometre değeri önceki kayda göre daha düşük."

şeklinde uyarı göster.

Ancak sistemi kullanıcıyı tamamen engelleyecek şekilde tasarlama.

İlk MVP'de kayıt yine oluşturulabilir ancak kayıt üzerinde:

"Kilometre tutarsızlığı"

uyarısı gösterilebilir.

---

## 9. KAYITLARIN DEĞİŞTİRİLMESİ

Servis geçmişinin güvenilir olması önemli.

İlk MVP'de kayıtların tamamen sessiz şekilde değiştirilmesini engelle.

Bir servis kaydı düzenlendiğinde mümkünse:

* updated_at
* önceki değer
* yeni değer

gibi temel audit bilgilerini tut.

Ancak tam blockchain veya karmaşık immutable ledger sistemi kurma.

Blockchain kesinlikle gerekli değil.

Basit PostgreSQL audit yaklaşımı yeterli.

---

## 10. SERVİS HESABI

İlk MVP'de servis hesabı oluşturma sistemi çok basit olabilir.

Bir servis:

* servis adı
* telefon
* adres

bilgileriyle tanımlanabilir.

Ancak ilk versiyonda gelişmiş servis doğrulama sistemi yapma.

Şimdilik:

"Servis tarafından girildi"

ve

"Araç sahibi tarafından girildi"

ayrımını veri modelinde destekle.

İlk MVP'de servis onboarding sistemini büyütme.

---

## 11. KAYNAK / KANIT MANTIĞI

Bir kaydın yanında şu bilgiler bulunabilir:

* Araç sahibi tarafından eklendi
* Servis tarafından eklendi
* Belge mevcut
* Fotoğraf mevcut

Ama sistem kesin olarak doğrulamadığı bir şeyi:

"Doğrulanmış"

şeklinde göstermemeli.

Özellikle:

"Bu parça kesinlikle değişmiştir."

gibi bir iddia üretme.

Uygulama sadece kaydın kim tarafından oluşturulduğunu ve hangi belgelerin bulunduğunu göstermeli.

---

## 12. FEATURE 6 — PAYLAŞIM KODU

Araç sahibi aracının geçmişini başka bir kişiye gösterebilmeli.

Örneğin araç satışı sırasında:

"Geçmişi paylaş"

butonuna basar.

Sistem geçici bir erişim kodu/token oluşturur.

Örneğin:

X7K9-P4M2

Bu kod ile araç sahibi olmayan kişi ilgili aracın geçmişini görebilir.

Token:

* süreli olmalı
* iptal edilebilir olmalı
* mümkünse tahmin edilmesi zor olmalı

Örneğin 24 saatlik erişim MVP için yeterlidir.

Alıcı:

plaka + paylaşım kodu

girerek geçmişi görüntüler.

Önemli:

Paylaşım modunda:

* araç sahibinin e-mail adresi
* telefon numarası
* kişisel bilgileri

gösterilmemeli.

---

## 13. PAYLAŞIM EKRANI

Alıcının gördüğü ekran araç sahibinin dashboard'undan farklı olmalı.

Alıcı sadece:

Araç:
34 ABC 123
Toyota Corolla 2021

Araç geçmişi:

2025
58.700 km
ABC Oto
Motor yağı değişimi
[Belge]

2024
52.100 km
XYZ Servis
Fren balatası değişimi
[Fotoğraf]

gibi bilgileri görmeli.

Araç sahibinin hesabına veya diğer araçlarına erişememeli.

---

## 14. BELGE GİZLİLİĞİ

Fatura/servis fişleri kişisel bilgiler içerebilir.

İlk MVP'de OCR veya otomatik kişisel veri maskeleme sistemi geliştirme.

Ancak paylaşım mimarisini ileride belgelerin maskelenebileceği şekilde tasarla.

En azından:

* storage path
* public/private erişim

kontrollü olmalı.

Belgeleri public bucket'a koyup herkesin URL'yi bilerek erişebilmesini istemiyorum.

Supabase Storage'da private bucket + signed URL yaklaşımı kullanılabilir.

---

## 15. DATABASE

Mantıklı minimum yapı:

users
vehicles
services
service_records
record_documents
access_tokens

Gerekli foreign key ilişkilerini kur.

Temel ilişki:

users → vehicles → service_records → record_documents

ve:

services → service_records

access_tokens → vehicles

Database tasarımında:

* UUID kullan
* foreign key kullan
* created_at kullan
* updated_at gerektiğinde kullan
* Row Level Security (RLS) kullan

---

## 16. SUPABASE RLS

Bu konu çok önemli.

Bir kullanıcı:

* sadece kendi araçlarını görebilmeli
* sadece kendi araçlarına servis kaydı ekleyebilmeli
* sadece kendi araçlarının belgelerini görebilmeli

Başka kullanıcının araç ID'sini tahmin ederek veriye ulaşamamalı.

Paylaşım tokenı üzerinden erişim ise ayrı kontrollü bir mekanizma olmalı.

RLS politikalarını gerçekten güvenli şekilde yaz.

Sadece frontend'de ID gizlemek güvenlik değildir.

---

## 17. FOTOĞRAF DEPOLAMA

Fotoğrafların boyutunu ve maliyetini göz önünde bulundur.

Örnek varsayım:

Bir araç: 100 servis kaydı
Her kayıt: ortalama 3 fotoğraf
Fotoğraf: ~400 KB

Yaklaşık: 100 × 3 × 400 KB ≈ 120 MB / araç

Bu nedenle ilk MVP'de fotoğraf optimizasyonu uygulanmalı.

Ancak şu anda storage maliyet optimizasyonu için gereksiz karmaşık CDN/image processing altyapısı kurma.

---

## 18. UI

UI sade olmalı.

Dashboard:

"Benim Araçlarım"
[+ Araç Ekle]

Araç kartı:

34 ABC 123
Toyota Corolla 2021
58.700 km
12 servis kaydı
[Geçmişi Gör] [Paylaş]

Araç detay:

Araç bilgileri
Servis Geçmişi
[+ Servis Kaydı]
Timeline

---

Servis kaydı formu:

Tarih
Kilometre
Servis
İşlem açıklaması
Belge/fotoğraf yükle
[Kaydet]

---

## 19. MOBİL ÖNCELİKLİ

Bu uygulamanın kullanımının önemli kısmı telefondan olabilir.

Bu nedenle responsive tasarım yap.

Özellikle:

* fotoğraf yükleme
* servis kaydı oluşturma
* geçmiş görüntüleme

mobilde rahat kullanılmalı.

Native Android/iOS uygulaması YAPMA.

İlk MVP web uygulaması/PWA seviyesinde olsun.

---

## 20. ŞİMDİLİK YAPILMAYACAKLAR

Aşağıdakileri kesinlikle MVP'ye ekleme:

* AI
* OCR
* otomatik fatura okuma
* araç değerleme
* ekspertiz skoru
* araç fiyat tahmini
* blockchain
* NFT
* VIN API entegrasyonu
* plaka API entegrasyonu
* sigorta entegrasyonu
* TÜVTÜRK entegrasyonu
* e-Devlet entegrasyonu
* servis marketplace
* servis yorumları
* chat
* bildirim sistemi
* SMS
* WhatsApp entegrasyonu
* ödeme sistemi
* abonelik
* gelişmiş admin panel
* sosyal özellikler
* araç karşılaştırma
* gelişmiş analitik
* native mobil uygulama

Bunların hiçbirini "gelecekte lazım olabilir" diye MVP'ye ekleme.

---

## 21. GELİŞTİRME YÖNTEMİ

Projeyi tek seferde devasa şekilde yazma.

Adım adım ilerle.

Önce mevcut projeyi analiz et.

Sonra bana:

1. Mevcut proje yapısı
2. Kullanılan teknolojiler
3. Eksik bağımlılıklar
4. Önerdiğin minimum database şeması
5. İlk implementasyon adımı

şeklinde kısa bir rapor ver.

BEN ONAYLAMADAN büyük çaplı kod değişikliğine başlama.

Sonrasında feature'ları şu sırayla geliştir:

1. Auth
2. Vehicle CRUD
3. Service Record CRUD
4. Storage / document upload
5. Vehicle timeline
6. KM consistency warning
7. Share token
8. Shared vehicle view
9. RLS/security review
10. UI cleanup

Her adımdan sonra:

* ne yaptığını
* hangi dosyaları değiştirdiğini
* database'de ne değiştiğini
* nasıl test ettiğini
* varsa kalan problemi

kısaca raporla.

---

## 22. KOD KALİTESİ

Kod:

* TypeScript strict
* component bazlı
* tekrar kullanılabilir
* gereksiz abstraction olmadan
* anlaşılır isimlendirme
* server/client ayrımı doğru
* environment secret'ları frontend'e sızdırmadan

yazılmalı.

Supabase service role key gibi secret'lar client tarafına kesinlikle gönderilmemeli.

---

## 23. ÖNEMLİ ÜRÜN PRENSİBİ

Uygulama araç hakkında kendi başına hüküm vermemeli.

YANLIŞ:

* "Bu araç temiz."
* "Bu araç güvenilir."
* "Bu araç alınır."

DOĞRU:

* "12 servis kaydı bulundu."
* "9 kayıtta belge bulunuyor."
* "Son kayıt 58.700 km'de oluşturulmuş."
* "İki kayıt arasında kilometre düşüşü tespit edildi."

Uygulama veri sunmalı; nihai değerlendirmeyi kullanıcı yapmalı.

---

## 24. İLK HEDEF

İlk hedefimiz mükemmel ürün değil.

Şu senaryonun uçtan uca çalışması:

1. Kullanıcı kayıt olur.
2. Araç ekler.
3. Araç için servis kaydı ekler.
4. Km girer.
5. Fotoğraf/fatura yükler.
6. Geçmişi timeline olarak görür.
7. Paylaşım kodu oluşturur.
8. Başka biri kod ile geçmişi görür.
9. Yetkisiz kullanıcı araç verisine ulaşamaz.

Bu akış çalışıyorsa MVP'nin temel amacı gerçekleşmiştir.

Önce bunu yap.

Ekstra feature önermeden önce mevcut MVP'nin düzgün ve güvenli çalıştığından emin ol.
