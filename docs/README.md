# Swagger API Validator - Proje Dokümantasyonu

## 📋 Genel Bakış

Bu proje, Swagger/OpenAPI dokümantasyonundan alınan API endpoint'lerini otomatik olarak analiz eden ve parametrelerin validasyon kurallarını test eden bir araçtır. Eksik veya yetersiz validasyonları tespit ederek API güvenliğini ve veri kalitesini artırmayı hedefler.

## 🎯 Amaç

API endpoint'lerinin parametrelerini çeşitli validasyon testlerine tabi tutarak:
- Eksik validasyonları tespit etmek
- API güvenlik açıklarını belirlemek
- Veri kalitesini artırmak
- False positive durumlarını yönetmek

## 🔍 Desteklenen Validasyonlar

| Validasyon Tipi | Açıklama |
|---|---|
| **Whitespace** | Boşluk karakterleri kontrolü |
| **NoString** | String olmama kontrolü |
| **MaxString** | Maksimum string uzunluğu kontrolü |
| **MaxNumber** | Maksimum sayı değeri kontrolü |
| **MinNumber** | Minimum sayı değeri kontrolü |
| **MaxDate** | Maksimum tarih kontrolü |
| **MinDate** | Minimum tarih kontrolü |
| **EmailCheck** | Email formatı doğrulama |
| **PhoneCheck** | Telefon numarası formatı doğrulama |
| **Required Check** | Zorunlu alan kontrolü |

## 🛠 Teknoloji Stack'i

- **Frontend Framework:** Vue.js 3
- **CSS Framework:** TailwindCSS
- **API İletişim:** Axios
- **State Management:** Pinia (önerilir)
- **Routing:** Vue Router

## 📁 Dokümantasyon Yapısı

```
docs/
├── README.md                      # Bu dosya
├── architecture/
│   ├── system-overview.md        # Sistem mimarisi
│   ├── data-flow.md              # Veri akışı
│   └── components.md             # Bileşen yapısı
├── api/
│   ├── swagger-integration.md    # Swagger entegrasyonu
│   └── endpoints.md              # API endpoint'leri
├── validation/
│   ├── rules.md                  # Validasyon kuralları detayı
│   └── test-scenarios.md         # Test senaryoları
└── ui/
    ├── wireframes.md             # UI tasarımları
    └── user-flow.md              # Kullanıcı akışları
```

## 🚀 Özellikler

### 1. Swagger Import
- Swagger/OpenAPI URL'den otomatik import
- Endpoint ve parametre otomatik tespiti
- Schema analizi

### 2. Validasyon Seçimi
- Kullanıcı tarafından customizable validasyon listesi
- Endpoint bazında özel validasyon seçimi
- Toplu validasyon uygulama

### 3. Test Execution
- Otomatik test senaryoları oluşturma
- Paralel test çalıştırma
- Real-time test sonuçları

### 4. Sonuç Yönetimi
- Detaylı test raporları
- False positive işaretleme sistemi
- Test geçmişi kayıtları
- Export/Import özellikleri

### 5. Dashboard
- Genel durum özeti
- İstatistikler ve grafikler
- Endpoint bazlı analiz

## 📊 Kullanıcı Akışı

1. **Import** → Swagger URL'i girişi
2. **Analysis** → Endpoint ve parametre keşfi
3. **Configure** → Validasyon kuralları seçimi
4. **Test** → Test senaryolarını çalıştırma
5. **Review** → Sonuçları inceleme ve false positive işaretleme
6. **Report** → Raporlama ve kaydetme

## 🎨 UI/UX Prensipleri

- Modern ve minimal tasarım
- Dark mode desteği
- Responsive design (mobil uyumlu)
- Kolay navigasyon
- Anlaşılır test sonuçları
- Renk kodlu durumlar (success/warning/error)

## 📝 Sonraki Adımlar

1. ✅ Proje yapısı oluşturuldu
2. 🔄 Detaylı mimari dokümantasyonu
3. ⏳ API spesifikasyonu
4. ⏳ Validasyon kuralları detaylandırması
5. ⏳ UI/UX tasarımları
6. ⏳ Teknik implementasyon planı
