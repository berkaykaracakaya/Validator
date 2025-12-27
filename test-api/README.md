# Test API - Intentional Validation Gaps

Bu API, Swagger API Validator uygulamasını test etmek için kasıtlı olarak validasyon eksiklikleri içerir.

## Kurulum

```bash
cd test-api
npm install
```

## Çalıştırma

```bash
npm start
# veya watch mode için:
npm run dev
```

API `http://localhost:4000` adresinde çalışacaktır.

## Swagger Dokümantasyonu

- **Swagger UI:** http://localhost:4000/api-docs
- **Swagger JSON:** http://localhost:4000/api-docs-json

## API Endpoints

### Users
- `GET /api/users` - Tüm kullanıcıları getir
- `GET /api/users/:id` - Kullanıcı detayı
- `POST /api/users` - Yeni kullanıcı oluştur
- `PUT /api/users/:id` - Kullanıcı güncelle
- `DELETE /api/users/:id` - Kullanıcı sil

### Products
- `GET /api/products` - Tüm ürünleri getir
- `GET /api/products/:id` - Ürün detayı
- `POST /api/products` - Yeni ürün oluştur
- `PUT /api/products/:id` - Ürün güncelle
- `DELETE /api/products/:id` - Ürün sil

### Orders
- `GET /api/orders` - Tüm siparişleri getir
- `GET /api/orders/:id` - Sipariş detayı
- `POST /api/orders` - Yeni sipariş oluştur
- `PUT /api/orders/:id` - Sipariş güncelle
- `DELETE /api/orders/:id` - Sipariş sil

## ⚠️ Kasıtlı Validasyon Eksiklikleri

Bu API'de test amacıyla aşağıdaki validasyon eksiklikleri bulunmaktadır:

### Users Endpoint
- ❌ Whitespace kontrolü yok (username, email)
- ❌ Email format validasyonu yok
- ❌ Phone format validasyonu yok
- ❌ MaxLength kontrolü yok (bio, username)
- ❌ Age range kontrolü yok

### Products Endpoint
- ❌ Whitespace kontrolü yok (name)
- ❌ MaxString kontrolü yok (name, description)
- ❌ MinNumber kontrolü yok (price > 0)
- ❌ Stock negatif olamaz kontrolü yok

### Orders Endpoint
- ❌ NoString kontrolü yok (userId integer olmalı)
- ❌ Array length kontrolü yok (products)
- ❌ MinNumber kontrolü yok (total > 0)
- ❌ Enum validation yok (status)

## Validator Uygulaması ile Test

1. Test API'yi başlatın: `npm start`
2. Validator uygulamasını açın: http://localhost:3000
3. Swagger URL girin: `http://localhost:4000/api-docs-json`
4. Import edin ve validasyon testlerini çalıştırın
5. Validator uygulaması yukarıdaki eksiklikleri bulmalı!

## Örnek Test Senaryoları

### Test 1: Whitespace Email
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"   ","age":30}'
```
**Beklenen:** 400 Bad Request  
**Gerçek:** 201 Created ❌

### Test 2: Invalid Email
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"notanemail","age":30}'
```
**Beklenen:** 400 Bad Request  
**Gerçek:** 201 Created ❌

### Test 3: String as UserID (NoString)
```bash
curl -X GET "http://localhost:4000/api/users/abc"
```
**Beklenen:** 400 Bad Request  
**Gerçek:** 200 OK veya 404 ❌

### Test 4: Negative Price
```bash
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":-100}'
```
**Beklenen:** 400 Bad Request  
**Gerçek:** 201 Created ❌

### Test 5: Very Long Bio (MaxString)
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","bio":"'"$(python3 -c 'print("a"*10000)')"'"}'
```
**Beklenen:** 400 Bad Request (bio too long)  
**Gerçek:** 201 Created ❌
