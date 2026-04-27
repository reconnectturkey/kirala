# Lead ve İş Takip MVP (Startkey Loft / KD Ankara)

Bu proje; teknik olmayan kullanıcılar için **hızlı kurulumlu**, sade bir web tabanlı MVP'dir.

## 1) Teknoloji seçimi
- **Node.js + Express + SQLite + EJS**

## 2) Neden bu teknoloji?
- **Hızlı kurulum:** Tek komutla çalışır, ayrı veritabanı sunucusu gerekmez.
- **Sade kullanım:** Form ve tablo odaklı arayüz.
- **Geliştirilebilir yapı:** İleride login, yetki, entegrasyonlar kolayca eklenebilir.

## 3) Mac kurulum komutları
```bash
# 1) Klasör oluştur
mkdir -p ~/Projects
cd ~/Projects

# 2) Projeyi al (repo URL'inizi yazın)
git clone <REPO_URL> kirala-lead-mvp
cd kirala-lead-mvp

# 3) Bağımlılıkları kur
npm install

# 4) Uygulamayı başlat
npm start
```

Geliştirme için otomatik yeniden başlatma:
```bash
npm run dev
```

## 4) Oluşturulan dosyalar
```text
src/
  constants.js   # Kaynaklar, türler, durumlar, roller
  db.js          # SQLite tablo + sorgular + notlar + durum güncelleme
  server.js      # Route'lar ve uygulama başlatma
views/
  dashboard.ejs
  leads-list.ejs
  lead-form.ejs
  followup-list.ejs
public/
  styles.css
```

## İlk sürümde olanlar
- Lead ekleme
- Lead listesi
- Bugünkü takipler
- Geciken takipler
- Durum değiştirme
- Not ekleme

## İlk sürümde olmayanlar
- Giriş/üyelik
- Gelişmiş yetki
- Ödeme
- WhatsApp entegrasyonu
- Yapay zeka analizi
