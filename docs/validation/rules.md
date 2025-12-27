# Validasyon Kuralları Detayı

## 📋 Genel Bakış

Her validasyon kuralı için test senaryoları, beklenen davranışlar ve örnek test değerleri.

## 🔍 Validasyon Türleri

### 1. Whitespace Validation

**Amaç:** Parametrelerin sadece boşluk karakterlerinden oluşup oluşmadığını kontrol eder.

**Test Değerleri:**
```javascript
[
  " ",           // Tek boşluk
  "   ",         // Çoklu boşluk
  "\t",          // Tab
  "\n",          // Newline
  "\r\n",        // CRLF
  "  \t \n  "   // Karışık whitespace
]
```

**Beklenen Davranış:**
- API bu değerleri reddetmeli (400 Bad Request)
- Validation error mesajı dönmeli
- Değer işlenmemeli

**Tespit Edilen Sorun:**
```json
{
  "parameterName": "username",
  "testValue": "   ",
  "expected": "400 Bad Request",
  "actual": "200 OK",
  "severity": "high",
  "recommendation": "Whitespace validation ekleyin"
}
```

---

### 2. NoString Validation

**Amaç:** Numeric parametrelere string değer gönderildiğinde doğru davranışı kontrol eder.

**Hedef Parametreler:**
- `type: "integer"`
- `type: "number"`

**Test Değerleri:**
```javascript
[
  "abc",
  "test123",
  "!@#$",
  "null",
  "undefined",
  "true",
  "[]",
  "{}"
]
```

**Beklenen Davranış:**
- Type mismatch error dönmeli
- 400 veya 422 status code
- Değer cast edilmemeli

---

### 3. MaxString Validation

**Amaç:** String parametrelerin maksimum uzunluk kontrolünü test eder.

**Uygulama:**
```javascript
// Eğer schema'da maxLength: 50 ise
const testValue = "a".repeat(51); // 51 karakter
const borderlineValue = "a".repeat(50); // Sınır değer
const extremeValue = "a".repeat(10000); // Aşırı uzun
```

**Test Senaryoları:**
| Senaryo | Test Değeri | Beklenen Sonuç |
|---------|-------------|----------------|
| Normal | maxLength değeri | ✅ 200 OK |
| Sınır Üstü | maxLength + 1 | ❌ 400 Bad Request |
| Çok Büyük | maxLength * 10 | ❌ 400 Bad Request |
| Aşırı Büyük | 10000+ karakter | ❌ 413 Payload Too Large veya 400 |

---

### 4. MaxNumber Validation

**Amaç:** Numeric parametrelerin maksimum değer kontrolünü test eder.

**Uygulama:**
```javascript
// Schema'da maximum: 100 ise
const testCases = [
  { value: 100, expect: "pass" },
  { value: 101, expect: "fail" },
  { value: 999999, expect: "fail" },
  { value: Number.MAX_SAFE_INTEGER, expect: "fail" },
  { value: Infinity, expect: "fail" }
];
```

**Özel Durumlar:**
- Float değerler için precision kontrolü
- Negative infinity
- NaN değerleri

---

### 5. MinNumber Validation

**Amaç:** Numeric parametrelerin minimum değer kontrolünü test eder.

**Uygulama:**
```javascript
// Schema'da minimum: 0 ise
const testCases = [
  { value: 0, expect: "pass" },
  { value: -1, expect: "fail" },
  { value: -999999, expect: "fail" },
  { value: Number.MIN_SAFE_INTEGER, expect: "fail" }
];
```

**Edge Cases:**
- Zero handling (0, -0)
- Very small decimals (0.0000001)
- Negative infinity

---

### 6. MaxDate Validation

**Amaç:** Date parametrelerinin gelecek tarih kontrolünü test eder.

**Test Değerleri:**
```javascript
[
  new Date().toISOString(), // Şu an - geçmeli
  new Date(Date.now() + 86400000).toISOString(), // Yarın
  new Date(Date.now() + 31536000000).toISOString(), // 1 yıl sonra
  "2099-12-31T23:59:59Z", // Çok ileri tarih
  "9999-12-31T23:59:59Z" // Maksimum tarih
]
```

**Format Varyasyonları:**
- ISO 8601: `2024-12-27T00:00:00Z`
- Unix timestamp: `1735257600`
- Custom formats: `27/12/2024`, `12-27-2024`

**Beklenen Davranış:**
- maxDate varsa: daha ileri tarihler reddedilmeli
- maxDate yoksa: makul sınırlar test edilmeli (örn: Y9999)

---

### 7. MinDate Validation

**Amaç:** Date parametrelerinin geçmiş tarih kontrolünü test eder.

**Test Değerleri:**
```javascript
[
  new Date().toISOString(), // Şu an - geçmeli
  new Date(Date.now() - 86400000).toISOString(), // Dün
  new Date(Date.now() - 31536000000).toISOString(), // 1 yıl önce
  "1900-01-01T00:00:00Z", // Çok eski tarih
  "0001-01-01T00:00:00Z" // Minimum tarih
]
```

**Edge Cases:**
- Epoch time: `1970-01-01T00:00:00Z`
- BC dates (negatif yıllar)
- Invalid dates: `0000-00-00`

---

### 8. Email Validation

**Amaç:** Email formatının doğru kontrolünü test eder.

**Geçersiz Email Örnekleri:**
```javascript
[
  // Format hataları
  "plaintext",
  "@domain.com",
  "user@",
  "user @domain.com",
  "user@domain",
  
  // Özel karakterler
  "user..name@domain.com",
  "user@domain..com",
  ".user@domain.com",
  "user.@domain.com",
  
  // SQL Injection denemesi
  "user'@domain.com",
  "user\"@domain.com",
  "user;DROP TABLE@domain.com",
  
  // XSS denemesi
  "<script>@domain.com",
  "user@<script>.com",
  
  // Çok uzun email
  "a".repeat(255) + "@domain.com",
  
  // Geçersiz TLD
  "user@domain.c",
  "user@domain.12345",
  
  // Whitespace
  " user@domain.com",
  "user@domain.com "
]
```

**Geçerli Email Örnekleri (Pozitif test için):**
```javascript
[
  "user@domain.com",
  "user.name@domain.com",
  "user+tag@domain.co.uk",
  "user123@sub.domain.com"
]
```

**Standart:** RFC 5322

---

### 9. Phone Validation

**Amaç:** Telefon numarası formatının doğru kontrolünü test eder.

**Geçersiz Telefon Örnekleri:**
```javascript
[
  // Çok kısa
  "123",
  "12345",
  
  // Çok uzun
  "123456789012345678",
  
  // Geçersiz karakterler
  "abc-def-ghij",
  "12-34-56",
  "+1 (abc) def-ghij",
  
  // Whitespace
  "   ",
  "123 456 789",
  
  // Özel karakterler
  "123-456-789!",
  "123@456#789",
  
  // SQL/XSS
  "'; DROP TABLE--",
  "<script>alert()</script>"
]
```

**Geçerli Telefon Örnekleri:**
```javascript
[
  "+905551234567",      // Türkiye
  "+1234567890",        // International
  "05551234567",        // Local
  "+1 (555) 123-4567",  // US format
  "+44 20 7123 4567"    // UK format
]
```

**Format Desteği:**
- International: E.164 format (+[country][number])
- National formats
- Parantez ve tire ile

---

### 10. Required Check

**Amaç:** Zorunlu alanların kontrolünü test eder.

**Test Senaryoları:**

| Senaryo | Değer | Beklenen Sonuç |
|---------|-------|----------------|
| Parametre yok | (eksik) | ❌ 400 |
| Null değer | `null` | ❌ 400 |
| Undefined | `undefined` | ❌ 400 |
| Empty string | `""` | ❌ 400 (context'e göre) |
| Empty array | `[]` | ❌ 400 (context'e göre) |
| Empty object | `{}` | ❌ 400 (context'e göre) |
| Whitespace | `"   "` | ❌ 400 |
| Valid value | `"value"` | ✅ 200/201 |

**Özel Durumlar:**
- Boolean `false` değeri (valid olmalı)
- Number `0` değeri (valid olmalı)
- String `"0"` değeri (valid olmalı)

---

## 🎯 Validasyon Önceliklendirme

### High Priority (Kritik)
1. **Required Check** - Veri bütünlüğü için temel
2. **Email Validation** - Güvenlik ve veri kalitesi
3. **SQL Injection via inputs** - Güvenlik açığı

### Medium Priority
4. **MaxString** - DoS önleme
5. **MaxNumber / MinNumber** - İş mantığı
6. **Phone Validation** - Veri kalitesi

### Low Priority
7. **Whitespace** - UX improvement
8. **NoString** - Type safety
9. **Date validations** - İş mantığı

## 🧪 Test Execution Strategy

### 1. Toplu Test
Tüm validasyonları tüm parametrelere uygula

### 2. Akıllı Test
- Schema'ya göre sadece ilgili validasyonları uygula
- Örn: integer field → NoString, Min/Max Number

### 3. Özel Test
Kullanıcının seçtiği endpoint ve validasyonlar

## 📊 Raporlama

Her validasyon hatası için:
```javascript
{
  endpoint: string,
  method: string,
  parameter: {
    name: string,
    location: string,
    type: string
  },
  validation: {
    type: string,
    testValue: any,
    expected: string,
    actual: string
  },
  severity: "high" | "medium" | "low",
  recommendation: string,
  isFalsePositive: boolean
}
```

## 🔄 Sürekli İyileştirme

- Kullanıcı feedback'i ile yeni validasyon türleri eklenebilir
- Test değerleri güncellenebilir
- Severity seviyeleri ayarlanabilir
