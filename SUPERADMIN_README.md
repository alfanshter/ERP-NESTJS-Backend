buatak# ERP System - Superadmin Module

## 🎯 Fitur Superadmin

Sistem ERP multi-tenant dengan fitur lengkap untuk superadmin mengelola:
- ✅ Company Management (Tenant)
- ✅ Pricing Plans
- ✅ Subscriptions
- ✅ Dashboard Analytics
- ✅ JWT Authentication & Authorization

## 📚 Documentation

- **[Authentication Guide](./AUTHENTICATION_GUIDE.md)** - Lengkap: JWT authentication, testing, security features
- **[This File]** - Superadmin endpoints & features overview

## 🎭 Role Hierarchy

### Superadmin Roles

```
┌─────────────────────────────────────┐
│     MASTER SUPERADMIN               │
│  ✓ All system access                │
│  ✓ Can register new superadmins     │
│  ✓ Full company management          │
│  ✓ Pricing & subscriptions          │
└─────────────────────────────────────┘
              │
              ├── Can create
              ↓
┌─────────────────────────────────────┐
│     SUPERADMIN                      │
│  ✓ All system access                │
│  ✗ Cannot register superadmins      │
│  ✓ Full company management          │
│  ✓ Pricing & subscriptions          │
└─────────────────────────────────────┘
```

### Company Roles (Per Tenant)

```
┌─────────────────────────────────────┐
│     ADMIN (Company Admin)           │
│  ✓ Full company access              │
│  ✓ Manage employees                 │
│  ✓ All projects & finance           │
└─────────────────────────────────────┘
              │
              ├── Can manage
              ↓
┌─────────────────────────────────────┐
│     MANAGER                         │
│  ✓ Project management               │
│  ✓ Read employee data               │
│  ✓ Read finance data                │
└─────────────────────────────────────┘
              │
              ├── Can assign tasks
              ↓
┌─────────────────────────────────────┐
│     STAFF                           │
│  ✓ Read projects                    │
│  ✓ Manage own tasks                 │
└─────────────────────────────────────┘
```

**Key Points:**
- 🔐 Only **1 Master Superadmin** should exist in production
- 👥 Multiple **Regular Superadmins** can be created by Master
- 🏢 Each company has their own Admin/Manager/Staff hierarchy
- 🔒 Superadmins have NO company association (companyId = null)

## 🔐 Login Credentials

### Master Superadmin (Can register other superadmins)
```
Email: master@erp-system.com
Password: MasterAdmin123!
```

### Regular Superadmin (Cannot register superadmins)
```
Email: superadmin@erp-system.com
Password: SuperAdmin123!
```

### Demo Company Admin
```
Email: admin@demo.com
Password: Admin123!
```

### Demo Manager
```
Email: manager@demo.com
Password: Manager123!
```

### Demo Staff
```
Email: staff@demo.com
Password: Staff123!
```

## 📊 Database Schema

### Core Models
- **Company** - Tenant/perusahaan yang menyewa sistem
- **User** - User sistem (superadmin & company users)
- **Role** - Role dengan permissions
- **Employee** - Karyawan perusahaan
- **PricingPlan** - Paket harga/pricing
- **Subscription** - Subscription perusahaan ke pricing plan

### Project Management
- **Project** - Proyek (IT Development / Procurement / General)
- **ProjectTask** - Task dalam proyek

### Procurement
- **Procurement** - Pengadaan barang
- **ProcurementItem** - Item pengadaan

### Finance
- **Invoice** - Invoice/tagihan
- **Expense** - Pengeluaran

## 🚀 API Endpoints

### Authentication

#### Login (All Roles)
```http
POST /auth/login
Content-Type: application/json

{
  "email": "master@erp-system.com",
  "password": "MasterAdmin123!"
}
```

Response:
```json
{
  "access_token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "firstName": "Master",
    "lastName": "Admin",
    "email": "master@erp-system.com",
    "role": "master-superadmin",
    "company": null,
    "isSuperAdmin": true,
    "isMasterSuperAdmin": true
  }
}
```

#### Register Superadmin (Master Superadmin Only) 🔒
```http
POST /auth/register-superadmin
Content-Type: application/json
Authorization: Bearer {master-superadmin-token}

{
  "email": "newsuperadmin@erp-system.com",
  "password": "StrongPassword123!",
  "firstName": "New",
  "lastName": "Superadmin"
}
```

**⚠️ Security Rules:**
- ✅ Only `master-superadmin` can access this endpoint
- ❌ Regular `superadmin` CANNOT register new superadmins
- ❌ Unauthenticated requests will be denied
- New superadmin will have role `superadmin` (NOT master-superadmin)

Response:
```json
{
  "message": "Superadmin registered successfully",
  "user": {
    "id": "uuid",
    "email": "newsuperadmin@erp-system.com",
    "firstName": "New",
    "lastName": "Superadmin",
    "role": {
      "name": "superadmin",
      "description": "Super Administrator - Full system access (cannot register superadmins)"
    }
  }
}
```

### Superadmin - Companies

#### Get All Companies
```http
GET /superadmin/companies?page=1&limit=10&search=demo&status=ACTIVE
```

#### Get Company Stats
```http
GET /superadmin/companies/stats
```

Response:
```json
{
  "total": 1,
  "active": 1,
  "trial": 0,
  "suspended": 0,
  "inactive": 0
}
```

#### Get Single Company
```http
GET /superadmin/companies/:id
```

#### Create Company
```http
POST /superadmin/companies
Content-Type: application/json

{
  "name": "New Company",
  "email": "contact@newcompany.com",
  "phone": "+1234567890",
  "address": "123 Street",
  "status": "TRIAL",
  "subscriptionId": "uuid"
}
```

#### Update Company
```http
PATCH /superadmin/companies/:id
Content-Type: application/json

{
  "status": "ACTIVE"
}
```

#### Delete Company
```http
DELETE /superadmin/companies/:id
```

### Superadmin - Pricing Plans

#### Get All Plans
```http
GET /superadmin/pricing-plans?includeInactive=false
```

#### Get Single Plan
```http
GET /superadmin/pricing-plans/:id
```

#### Create Plan
```http
POST /superadmin/pricing-plans
Content-Type: application/json

{
  "name": "Custom Plan",
  "description": "Custom pricing plan",
  "price": 149.99,
  "billingPeriod": "MONTHLY",
  "features": ["Feature 1", "Feature 2"],
  "maxUsers": 50,
  "maxProjects": 200,
  "maxStorage": 100,
  "isActive": true
}
```

#### Update Plan
```http
PATCH /superadmin/pricing-plans/:id
Content-Type: application/json

{
  "price": 159.99
}
```

#### Delete Plan
```http
DELETE /superadmin/pricing-plans/:id
```

### Superadmin - Dashboard

#### Get Overview
```http
GET /superadmin/dashboard/overview
```

Response:
```json
{
  "stats": {
    "totalCompanies": 1,
    "activeCompanies": 1,
    "totalUsers": 4,
    "totalPlans": 3,
    "activeSubscriptions": 1
  },
  "recentCompanies": [...],
  "revenue": {
    "monthlyRevenue": 79.99,
    "yearlyRevenue": 959.88,
    "activeSubscriptions": 1
  }
}
```

**Penjelasan Response:**

**Stats (Statistik Keseluruhan)**
- `totalCompanies`: Total perusahaan terdaftar di sistem
- `activeCompanies`: Perusahaan dengan status ACTIVE
- `totalUsers`: Total user di semua perusahaan (superadmin + company users)
- `totalPlans`: Total paket harga tersedia
- `activeSubscriptions`: Total subscription yang aktif

**Recent Companies (5 Perusahaan Terbaru)**
```json
{
  "id": "uuid",                    // ID unik perusahaan
  "name": "Demo Company",          // Nama perusahaan
  "email": "demo@company.com",     // Email kontak
  "phone": "+1234567890",          // Nomor telepon
  "address": "123 Demo Street",    // Alamat
  "status": "ACTIVE",              // Status: ACTIVE/TRIAL/SUSPENDED/INACTIVE
  "subscriptionId": "uuid",        // ID subscription
  "createdAt": "2025-12-19...",    // Tanggal daftar
  
  "subscription": {
    "id": "uuid",
    "planId": "uuid",              // ID pricing plan
    "status": "ACTIVE",            // Status subscription
    "startDate": "2025-12-19",     // Mulai subscription
    "endDate": "2026-12-19",       // Akhir subscription
    "autoRenew": true,             // Auto perpanjang
    
    "plan": {
      "name": "Professional",      // Nama paket
      "price": 79.99,              // Harga per bulan
      "billingPeriod": "MONTHLY",  // Periode billing
      "features": [                // Fitur yang didapat
        "Advanced Project Management",
        "Procurement Management",
        "Up to 20 users",
        "50 projects",
        "50GB storage",
        "Priority support",
        "Custom reports"
      ],
      "maxUsers": 20,              // Limit user
      "maxProjects": 50,           // Limit proyek
      "maxStorage": 50             // Storage (GB)
    }
  },
  
  "_count": {
    "users": 3                     // Jumlah user di perusahaan ini
  }
}
```

**Revenue (Pendapatan)**
- `monthlyRevenue`: Total pendapatan per bulan dari semua subscription aktif
- `yearlyRevenue`: Proyeksi pendapatan per tahun (monthly × 12)
- `activeSubscriptions`: Jumlah subscription yang menghasilkan revenue

**Use Case:**
Dashboard ini untuk superadmin monitoring:
- Pertumbuhan jumlah perusahaan/tenant
- Revenue yang dihasilkan dari subscription
- Status subscription masing-masing perusahaan
- Analisa bisnis dan financial metrics

#### Get Company Growth
```http
GET /superadmin/dashboard/company-growth?months=12
```

#### Get Subscription Breakdown
```http
GET /superadmin/dashboard/subscription-breakdown
```

#### Get Company Status Distribution
```http
GET /superadmin/dashboard/company-status
```

## 🧪 Testing dengan cURL

### Test Dashboard Overview
```bash
curl http://localhost:3000/superadmin/dashboard/overview
```

### Test Companies List
```bash
curl http://localhost:3000/superadmin/companies?page=1&limit=10
```

### Test Company Stats
```bash
curl http://localhost:3000/superadmin/companies/stats
```

### Test Pricing Plans
```bash
curl http://localhost:3000/superadmin/pricing-plans
```

## 📦 Database Seeder

Untuk re-seed database:
```bash
pnpm prisma db seed
```

## 🗄️ Prisma Studio

Untuk melihat database secara visual:
```bash
npx prisma studio
```

Akan terbuka di: http://localhost:5555

## 🛠️ Development

### Start Server
```bash
pnpm run start:dev
```

### Generate Prisma Client
```bash
pnpm prisma generate
```

### Create Migration
```bash
pnpm prisma migrate dev --name migration_name
```

### Reset Database
```bash
pnpm prisma migrate reset
```

## 📁 Structure

```
src/
├── superadmin/
│   ├── companies/          # Company management
│   │   ├── companies.controller.ts
│   │   ├── companies.service.ts
│   │   ├── companies.module.ts
│   │   └── dto/
│   ├── pricing-plans/      # Pricing plan management
│   │   ├── pricing-plans.controller.ts
│   │   ├── pricing-plans.service.ts
│   │   ├── pricing-plans.module.ts
│   │   └── dto/
│   ├── dashboard/          # Analytics dashboard
│   │   ├── dashboard.controller.ts
│   │   ├── dashboard.service.ts
│   │   └── dashboard.module.ts
│   └── superadmin.module.ts
```

## ✨ Next Steps

1. ✅ Setup Authentication (JWT)
2. ✅ Add Guards untuk protect routes
3. ✅ Implement Subscriptions management
4. ✅ Add audit logging
5. ✅ Build company-specific modules (for tenant users)

## 🧪 Quick Test

### Test Register Superadmin API
```bash
# Run automated test script
./test-register-superadmin.sh
```

The script will test:
1. ✅ Master Superadmin can login
2. ✅ Master can register new superadmins
3. ✅ Regular Superadmin CANNOT register superadmins (403 Forbidden)
4. ✅ Unauthenticated requests denied (401 Unauthorized)

### Manual Test with cURL

```bash
# 1. Login as Master Superadmin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "master@erp-system.com",
    "password": "MasterAdmin123!"
  }'

# Copy the access_token from response

# 2. Register New Superadmin (replace YOUR_TOKEN)
curl -X POST http://localhost:3000/auth/register-superadmin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "email": "newsuperadmin@erp-system.com",
    "password": "SecurePassword123!",
    "firstName": "New",
    "lastName": "Superadmin"
  }'

# Expected: Success (201 Created)

# 3. Try with Regular Superadmin token
# Login as superadmin@erp-system.com first, then try to register
# Expected: Error (403 Forbidden)
```

## 🎊 Status

**Superadmin Module: COMPLETED ✅**

Database: Connected ✅
Migration: Done ✅
Seed: Done ✅
API Routes: Working ✅

Ready untuk digunakan! 🚀
