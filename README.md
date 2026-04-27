# Lead Takip MVP (Startkey Loft / KD Ankara)

Bu proje; ofise gelen leadleri tek yerden takip etmek için hazırlanmış, hızlı kurulum odaklı bir **Node.js + Express + SQLite** MVP'sidir.

## Neden bu yapı?
- **Hızlı kurulum:** Sunucu + veritabanı tek projede.
- **Teknik olmayan kullanım:** Form ve tablo temelli basit ekranlar.
- **Geliştirilebilirlik:** İleride rol bazlı yetki, API, WhatsApp entegrasyonu eklenebilir.

## Ekranlar
1. Dashboard (`/`)
2. Lead listesi (`/leads`)
3. Yeni lead formu (`/leads/new`)
4. Bugünkü takipler (`/followups/today`)
5. Geciken takipler (`/followups/overdue`)

## Kurulum
```bash
npm install
npm run dev
```

Ardından: `http://localhost:3000`

## Proje yapısı
```text
src/
  constants.js   # Kaynaklar, türler, durumlar, roller
  db.js          # SQLite tablo + sorgular
  server.js      # Route'lar ve uygulama başlatma
views/
  dashboard.ejs
  leads-list.ejs
  lead-form.ejs
  followup-list.ejs
public/
  styles.css
```

## Bir sonraki adımlar
- Gerçek kullanıcılar için giriş sistemi (admin/danışman/operasyon)
- Lead geçmişi ve aktivite logu
- Filtreleme, arama, Excel dışa aktarma
- WhatsApp / form entegrasyon webhookları
