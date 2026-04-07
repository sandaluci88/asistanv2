# 🛋️ Sandaluci Ayça (Kaya SDR) - Akıllı Üretim Takip Asistanı

![Version](https://img.shields.io/badge/version-2.5-blue.svg)
![Status](https://img.shields.io/badge/status-production--ready-green.svg)
![AI](https://img.shields.io/badge/AI-Gemini_2.0_Pro-orange.svg)

Sandaluci Mobilya Fabrikası için geliştirilmiş, Telegram tabanlı, yapay zeka destekli Üretim Takip ve Yönetici Asistanıdır. Ayça, fabrikanın işleyişini dijitalleştirerek üretim hatalarını sıfıra indirmeyi ve verimliliği artırmayı hedefler.

---

## 🏛️ Organizasyon Yapısı ve Roller

| Rol | Yetkili | Tanım |
| :--- | :--- | :--- |
| **SuperAdmin** | Barış Bey (Patron) | Sistem sahibi. Her türlü veri girişine ve analize tam yetkili. |
| **Genel Koordinatör** | Marina | Üretim trafiğini yönetir. Döşeme ve Dikiş departmanlarını koordine eder. |
| **Dijital Asistan** | Ayça | Üretim akışını yöneten, Excel'leri işleyen ve personeli Rusça yönlendiren AI. |
| **Departmanlar** | Atölye Personeli | Karkas, Metal, Boya, Döşeme ve Dikiş ekipleri. |

---

## 🚀 Öne Çıkan Özellikler

### 📦 Akıllı Dağıtım & Split Mode (YENİ)
- **Miktar Bazlı Bölüştürme:** Marina artık "Dikişhane: X üründen 20 adet, Y üründen 15 adet ver" gibi metin tabanlı komutlarla üretimi çalışanlar arasında dağıtabilir.
- **Alt İş Emirleri (Sub-Orders):** Ayça, bu dağıtımı otomatik olarak parçalara ayırır ve her çalışana sadece kendi payına düşen işin PDF belgesini gönderir.

### 🇷🇺 %100 Rusça ve Görsel Destek
- **Otomatik Tercüme:** Tüm iş emirleri, ürün detayları ve notlar otomatik olarak Rusça'ya çevrilir.
- **Resimli İş Emirleri:** Üretim hatası riskini azaltmak için iş emirleri ürün görselleriyle desteklenmiş PDF formatında iletilir.

### ⏲️ Sıkı Takip Döngüsü
- **5-3 Gün Uyarı Sistemi:** Teslimata 5 gün kala başlayan periyodik hatırlatmalar. 3 gün kala Rusça durum sorgulamaları (`Как обстоят дела?`) başlar.
- **Acil Durum Bildirimi:** Kritik gecikmeler veya malzeme eksikleri (kumaş vb.) anında Marina'ya raporlanır.

---

## 🛠️ Teknoloji Yığını

- **Core:** Node.js, TypeScript
- **Telegram:** Grammy Framework
- **Database:** Supabase (PostgreSQL)
- **AI Engine:** Gemini 2.0 Pro (Experimental) via OpenRouter
- **Parsing:** ExcelJS & Custom XlsxUtils

---

## 📂 Kritik Dosyalar

- [core_memory.md](file:///c:/Users/user/Downloads/Z.ai_claude%20code/asistan%20v2/kaya/memory/core_memory.md): Ayça'nın "Anayasası" ve operasyonel bilinci.
- `src/utils/order.service.ts`: Sipariş işleme ve dağıtım mantığı.
- `src/handlers/message.handler.ts`: Mesaj ve sesli komut işleme merkezi.

---

_Bu proje Sandaluci Mobilya Fabrikası için özel olarak geliştirilmiştir. Tüm hakları Barış Bey'e aittir._
