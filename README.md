# Sandaluci Asistan: Akıllı Üretim Koordinatörü 🚀

Sandaluci firması için özel olarak tasarlanmış, **Kazakistan merkezli** operasyonlarda **Yalın Kültür (Lean Culture)** ve **Stratejik Hizalama (Hoshin Kanri)** prensiplerini uçtan uca yöneten zeki bir asistan sistemidir.

---

## 📊 Proje Gelişim Raporu ve Sunum Rehberi

Bu bölüm, projenin başından sonuna kadar geçirdiği evreleri ve teknik başarıları özetler:

### 1. Vizyon ve Başlangıç

- **Hedef:** Kağıt üzerindeki sipariş takibini dijitalize etmek ve departmanlar arası koordinasyonu otomatiğe bağlamak.
- **Kültür:** Sistemin merkezine "Yalın Üretim" prensipleri (israfı önleme, tam zamanında üretim) yerleştirildi.

### 2. Teknik Evrim Basamakları

- **Aşama 1: Veri Yakalama:** Gmail üzerinden gelen karmaşık sipariş formlarını (Excel/PDF) yapay zeka ile okuma yeteneği eklendi.
- **Aşama 2: Departman Dağıtımı:** Tek bir siparişi parçalara bölüp; Karkas, Dikişhane ve Döşemehane'ye ilgili kısımları resimli olarak gönderme (Multi-Dept Logic) kuruldu.
- **Aşama 3: Personel & Verimlilik:** Parça başı (Piecework) takip sistemi ve "Marina" onay mekanizması ile üretim disiplini sağlandı.
- **Aşama 4: Görsel Hafıza:** Supabase (pgvector) vektör veritabanı ile geçmiş ürün görsellerinden benzerlik araması yapabilen "Görsel Bellek" entegre edildi. Görseller VPS üzerindeki yerel depolama biriminde güvenle saklanır.

### 3. Bot Stabilitesi & Çakışma Yönetimi (Mart 2026)

- **Çatışma Çözümü:** Telegram `409 Conflict` hataları artık sistemi çökertmez. `bot.catch` yapısı ile bot başka bir yerde çalışıyor olsa bile sistem uyarı verir ve diğer servisler (Health Check, API) çalışmaya devam eder.
- **Gelişmiş Health Check:** Coolify entegrasyonu için port 3000 üzerinde `/health` ve `/ping` desteği.

---

## 🌟 Öne Çıkan Özellikler

### 1. Hibrit Görsel Depolama & Vektör Hafızası

- **Teknoloji:** Qdrant'tan **Supabase (pgvector)** altyapısına geçiş yapıldı.
- **Performans:** Vektör aramaları doğrudan ana veritabanı (SQL) üzerinde çalışır (1024-dim).
- **VPS Depolama:** Orijinal ürün resimleri VPS üzerindeki `data/images` klasöründe saklanır.

### 2. Otomatik & Akıllı Üretim Dağıtımı

- **Multi-Dept Logic:** Sipariş tipi ve departman ihtiyacına göre otomatik iş emri ayrıştırma.
- **Senkronize Rapor:** Dağıtım raporu tüm birimlere iş emirleri ulaştıktan sonra özet olarak yönetime iletilir.

### 3. Çok Dillilik ve Bölgesel Adaptasyon

- **Dinamik Dil:** Kullanıcının diline göre (Türkçe veya Rusça) otomatik cevap verir.
- **Kazakistan Operasyonu:** Personelin Rusça, yönetimin çift dilli olduğu yapıya tam uyumludur.

### 4. Güvenlik & İzleme

- **Mükerrer İşlem Önleme:** E-posta UID'leri `processed_uids.json` ile kalıcı olarak depolanır.
- **Doctor Service:** Sistem sağlığını (Database, LLM, Gmail, Network) anlık denetleyen `/doctor` komutu.

---

## 🛠️ Teknik Altyapı

- **Model:** OpenRouter üzerinden `google/gemini-2.0-flash-001` (Yüksek hızlı ve zeki JSON analizi).
- **Veritabanı:** Supabase (SQL & pgvector).
- **Arşivleme:** İşlenen sipariş formları `data/orders` altında, görseller ise `data/images` altında.
- **Deployment:** Docker & Coolify (Port 3000 Healthcheck aktif).

## 🚀 Kurulum

1. `.env` dosyasını yapılandırın (Supabase, Telegram, Gmail, OpenRouter).
2. Supabase projesinde `supabase_schema.sql` dosyasını çalıştırın.
3. `npm install` ve `npm run build` ile derleyin.
4. Docker üzerinden yayına alın (Health Check Port: 3000).

---

> **Not:** Visible Swarm Web Dashboard projesi geliştirme aşamasındadır ve sonraki versiyonlarda aktif edilecektir.

_SanaSistans: Geleceğin Mobilya Üretim Teknolojisi - 2026_
