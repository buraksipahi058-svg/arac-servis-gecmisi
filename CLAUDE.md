# Proje Kuralları

- Tüm geliştirme `docs/MVP_SPEC.md` şartnamesine uyar. Kararsız kaldığında önce o dosyayı oku.
- Şartnamenin 20. bölümündeki "yapılmayacaklar" listesindeki hiçbir özelliği ekleme.
  - İstisna (proje sahibinin kararı, 25.09.2026): kullanıcı profili, unvanlar (satıcı / yetkili servis / usta), kullanıcıların birbirinin unvanını onaylaması, kullanıcı arama sayfası ve araç tipi kapsama alındı. Unvanlar "kendi beyanı", onaylar "X kullanıcı onayladı" olarak gösterilir; uygulama bunları "doğrulanmış" diye sunmaz.
- Adım adım ilerle; her adımın sonunda dur, raporla ve onay bekle.
- Supabase service role key ve diğer secret'lar asla client koduna girmez.
- Uygulama araç hakkında hüküm vermez ("temiz", "güvenilir", "doğrulanmış" gibi ifadeler yok); sadece veriyi gösterir.

@AGENTS.md
