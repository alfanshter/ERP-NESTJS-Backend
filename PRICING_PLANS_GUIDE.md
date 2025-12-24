# 💰 Pricing Plans - Flexible Billing & Discount Guide

## Overview

Pricing Plans sekarang mendukung:
- **Harga Monthly & Yearly terpisah**
- **Diskon untuk setiap billing period**
- **2 tipe diskon: Percentage atau Fixed**
- **Perhitungan harga final otomatis**

---

## 📊 Struktur Pricing Plan

### Field Utama

| Field | Type | Required | Description | Contoh |
|-------|------|----------|-------------|--------|
| `monthlyPrice` | Float | ✅ | Harga per bulan | 200000 |
| `yearlyPrice` | Float | ✅ | Harga per tahun | 2400000 atau 1500000 |
| `monthlyDiscount` | Float | ❌ | Diskon untuk monthly | 10 (10% atau Rp 10.000) |
| `yearlyDiscount` | Float | ❌ | Diskon untuk yearly | 37.5 (37.5% atau Rp 900.000) |
| `discountType` | Enum | ❌ | `PERCENTAGE` atau `FIXED` | PERCENTAGE |

### Response Fields (Auto-calculated)

API response akan include field tambahan:
- `finalMonthlyPrice`: Harga final setelah diskon monthly
- `finalYearlyPrice`: Harga final setelah diskon yearly

---

## 💡 Contoh Penggunaan

### Contoh 1: Diskon Persentase
**Case:** Monthly Rp 200.000, Yearly Rp 2.4jt → diskon yearly 37.5% jadi Rp 1.5jt

```json
{
  "name": "Professional",
  "description": "Untuk bisnis yang sedang berkembang",
  "monthlyPrice": 200000,
  "yearlyPrice": 2400000,
  "monthlyDiscount": 0,
  "yearlyDiscount": 37.5,
  "discountType": "PERCENTAGE",
  "features": [
    "50 users",
    "100 projects",
    "100GB storage",
    "Priority support"
  ],
  "maxUsers": 50,
  "maxProjects": 100,
  "maxStorage": 100,
  "isActive": true
}
```

**Response akan include:**
```json
{
  "id": "...",
  "monthlyPrice": 200000,
  "yearlyPrice": 2400000,
  "monthlyDiscount": 0,
  "yearlyDiscount": 37.5,
  "discountType": "PERCENTAGE",
  "finalMonthlyPrice": 200000,     // 200k - 0% = 200k
  "finalYearlyPrice": 1500000,     // 2.4jt - 37.5% = 1.5jt
  ...
}
```

---

### Contoh 2: Diskon Monthly + Yearly

**Case:** 
- Monthly: Rp 200.000 → diskon 10% jadi Rp 180.000
- Yearly: Rp 2.4jt → diskon 900.000 (fixed) jadi Rp 1.5jt

```json
{
  "name": "Starter",
  "monthlyPrice": 200000,
  "yearlyPrice": 2400000,
  "monthlyDiscount": 10,
  "yearlyDiscount": 900000,
  "discountType": "FIXED",
  "features": ["10 users", "20 projects", "10GB storage"],
  "maxUsers": 10,
  "maxProjects": 20,
  "maxStorage": 10
}
```

**Response:**
```json
{
  "finalMonthlyPrice": 190000,     // 200k - 10k (fixed) = 190k
  "finalYearlyPrice": 1500000,     // 2.4jt - 900k (fixed) = 1.5jt
  ...
}
```

---

### Contoh 3: Diskon Percentage untuk Monthly

```json
{
  "name": "Basic",
  "monthlyPrice": 200000,
  "yearlyPrice": 2160000,
  "monthlyDiscount": 10,       // 10% discount
  "yearlyDiscount": 10,        // 10% discount
  "discountType": "PERCENTAGE",
  "features": ["5 users", "10 projects"],
  "maxUsers": 5,
  "maxProjects": 10,
  "maxStorage": 5
}
```

**Response:**
```json
{
  "finalMonthlyPrice": 180000,     // 200k - 10% = 180k
  "finalYearlyPrice": 1944000,     // 2.16jt - 10% = 1.944jt
  ...
}
```

---

## 🔄 Migrasi Data Lama

Saat migration jalan, data lama akan dimigrate otomatis:
- `price` (lama) → `monthlyPrice`
- `yearlyPrice` = `price` × 12
- `monthlyDiscount` = 0
- `yearlyDiscount` = 0
- `discountType` = `PERCENTAGE`

Jadi kalau dulu ada plan Rp 100k/bulan:
- `monthlyPrice`: 100000
- `yearlyPrice`: 1200000 (12 × 100k)
- Tidak ada diskon

---

## 🎯 Use Cases

### 1. **No Discount (Standard Pricing)**
```json
{
  "monthlyPrice": 100000,
  "yearlyPrice": 1200000,
  "monthlyDiscount": 0,
  "yearlyDiscount": 0
}
```
→ Final: Monthly Rp 100k, Yearly Rp 1.2jt

---

### 2. **Yearly Discount Only (Most Common)**
```json
{
  "monthlyPrice": 200000,
  "yearlyPrice": 2400000,
  "monthlyDiscount": 0,
  "yearlyDiscount": 37.5,
  "discountType": "PERCENTAGE"
}
```
→ Final: Monthly Rp 200k, Yearly Rp 1.5jt (save 37.5%)

---

### 3. **Flash Sale (Discount Both)**
```json
{
  "monthlyPrice": 200000,
  "yearlyPrice": 2400000,
  "monthlyDiscount": 20,
  "yearlyDiscount": 50,
  "discountType": "PERCENTAGE"
}
```
→ Final: Monthly Rp 160k (20% off), Yearly Rp 1.2jt (50% off)

---

### 4. **Fixed Amount Discount**
```json
{
  "monthlyPrice": 200000,
  "yearlyPrice": 2400000,
  "monthlyDiscount": 20000,
  "yearlyDiscount": 900000,
  "discountType": "FIXED"
}
```
→ Final: Monthly Rp 180k, Yearly Rp 1.5jt

---

## 🛠️ API Endpoints

### Create Pricing Plan
```http
POST /superadmin/pricing-plans
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Professional",
  "monthlyPrice": 200000,
  "yearlyPrice": 1500000,
  "monthlyDiscount": 10,
  "yearlyDiscount": 37.5,
  "discountType": "PERCENTAGE",
  "features": ["Feature 1", "Feature 2"],
  "maxUsers": 50,
  "maxProjects": 100,
  "maxStorage": 100
}
```

### Update Pricing Plan
```http
PATCH /superadmin/pricing-plans/:id
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "monthlyPrice": 180000,
  "yearlyDiscount": 40
}
```

### Get All Plans (with Final Prices)
```http
GET /superadmin/pricing-plans?includeInactive=false
Authorization: Bearer {{token}}
```

Response otomatis include `finalMonthlyPrice` & `finalYearlyPrice`.

---

## 📝 Notes

1. **Discount Default**: Kalau tidak set, default `0` (no discount)
2. **Discount Type Default**: Default `PERCENTAGE` kalau tidak specify
3. **Validation**: 
   - `monthlyDiscount` & `yearlyDiscount` must be ≥ 0
   - Percentage discount biasanya 0-100
4. **Final Price**: Akan selalu ≥ 0 (tidak bisa negatif)
5. **Migration Safe**: Data lama otomatis convert, tidak hilang

---

## 🔍 Testing di Postman

1. **Import Collection**: `ERP-System-API.postman_collection.json`
2. **Login as Superadmin**: Get token
3. **Create Plan**:
   - Endpoint: `POST /superadmin/pricing-plans`
   - Body: Gunakan contoh di atas
4. **Get All Plans**:
   - Endpoint: `GET /superadmin/pricing-plans`
   - Check field `finalMonthlyPrice` & `finalYearlyPrice`

---

## 📚 Related Files

- **Schema**: `prisma/schema.prisma` (model PricingPlan)
- **Migration**: `prisma/migrations/20251224022941_update_pricing_plan_billing_structure/`
- **DTO**: `src/superadmin/pricing-plans/dto/create-pricing-plan.dto.ts`
- **Service**: `src/superadmin/pricing-plans/pricing-plans.service.ts`
- **Postman**: `ERP-System-API.postman_collection.json` → "Superadmin - Pricing Plans"

---

**Last Updated:** December 24, 2025
