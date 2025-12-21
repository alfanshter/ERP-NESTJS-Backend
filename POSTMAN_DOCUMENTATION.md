# 📮 Postman API Documentation - ERP System

## Base URL
```
http://localhost:3000
```

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [Superadmin - Companies](#superadmin-companies)
3. [Superadmin - Pricing Plans](#superadmin-pricing-plans)
4. [Superadmin - Dashboard](#superadmin-dashboard)

---

## 🔐 Authentication

### 1. Login
**Endpoint:** `POST /auth/login`  
**Authentication:** Not Required  
**Description:** Login untuk semua role (master-superadmin, superadmin, admin, manager, staff)

**Request Body:**
```json
{
  "email": "master@erp-system.com",
  "password": "MasterAdmin123!"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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

**Available Credentials:**
| Email | Password | Role |
|-------|----------|------|
| master@erp-system.com | MasterAdmin123! | master-superadmin |
| superadmin@erp-system.com | SuperAdmin123! | superadmin |
| admin@demo.com | Admin123! | admin |
| manager@demo.com | Manager123! | manager |
| staff@demo.com | Staff123! | staff |

---

### 2. Register User
**Endpoint:** `POST /auth/register`  
**Authentication:** Not Required  
**Description:** Register user baru untuk company

**Request Body:**
```json
{
  "email": "newuser@company.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "companyId": "company-uuid-here"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "newuser@company.com",
  "firstName": "John",
  "lastName": "Doe",
  "isActive": true,
  "companyId": "company-uuid-here",
  "role": {
    "name": "staff"
  },
  "company": {
    "name": "Company Name"
  }
}
```

---

### 3. Register Superadmin (Master Only) 🔒
**Endpoint:** `POST /auth/register-superadmin`  
**Authentication:** Required - **Master Superadmin Only**  
**Description:** Hanya Master Superadmin yang bisa mendaftarkan superadmin baru

**Headers:**
```
Authorization: Bearer {master-superadmin-token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newsuperadmin@erp-system.com",
  "password": "StrongPassword123!",
  "firstName": "New",
  "lastName": "Superadmin"
}
```

**Response (201):**
```json
{
  "message": "Superadmin registered successfully",
  "user": {
    "id": "uuid",
    "email": "newsuperadmin@erp-system.com",
    "firstName": "New",
    "lastName": "Superadmin",
    "isActive": true,
    "companyId": null,
    "role": {
      "name": "superadmin",
      "description": "Super Administrator - Full system access (cannot register superadmins)"
    }
  }
}
```

**Error Responses:**
- **401**: No token / Invalid token
- **403**: Not Master Superadmin
- **409**: Email already exists

---

### 4. Get Profile
**Endpoint:** `GET /auth/profile`  
**Authentication:** Required  
**Description:** Get detail profile user yang sedang login

**Headers:**
```
Authorization: Bearer {your-token}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "avatar": null,
  "phone": null,
  "isActive": true,
  "companyId": "uuid",
  "roleId": "uuid",
  "role": {
    "name": "admin",
    "description": "Company Administrator"
  },
  "company": {
    "name": "Demo Company"
  }
}
```

---

### 5. Get Current User
**Endpoint:** `GET /auth/me`  
**Authentication:** Required  
**Description:** Get JWT payload user yang sedang login

**Headers:**
```
Authorization: Bearer {your-token}
```

**Response (200):**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "roleId": "uuid",
  "companyId": "uuid",
  "isSuperAdmin": false,
  "iat": 1703174400,
  "exp": 1703779200
}
```

---

## 🏢 Superadmin - Companies

**Note:** All endpoints require **Superadmin authentication**

### 6. Create Company
**Endpoint:** `POST /superadmin/companies`  
**Authentication:** Required - Superadmin  
**Description:** Buat company/tenant baru

**Headers:**
```
Authorization: Bearer {superadmin-token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Company Ltd",
  "email": "contact@newcompany.com",
  "phone": "+628123456789",
  "address": "Jl. Sudirman No. 123, Jakarta",
  "website": "https://newcompany.com",
  "status": "TRIAL",
  "subscriptionId": "pricing-plan-uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "New Company Ltd",
  "email": "contact@newcompany.com",
  "phone": "+628123456789",
  "address": "Jl. Sudirman No. 123, Jakarta",
  "website": "https://newcompany.com",
  "status": "TRIAL",
  "subscriptionId": "uuid",
  "createdAt": "2025-12-21T10:00:00.000Z",
  "updatedAt": "2025-12-21T10:00:00.000Z"
}
```

---

### 7. Get All Companies
**Endpoint:** `GET /superadmin/companies`  
**Authentication:** Required - Superadmin  
**Description:** List semua companies dengan pagination & filter

**Headers:**
```
Authorization: Bearer {superadmin-token}
```

**Query Parameters:**
```
page=1            # Page number (default: 1)
limit=10          # Items per page (default: 10)
search=demo       # Search by name or email
status=ACTIVE     # Filter by status (ACTIVE, TRIAL, SUSPENDED, INACTIVE)
```

**Example Request:**
```
GET /superadmin/companies?page=1&limit=10&search=demo&status=ACTIVE
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Demo Company",
      "email": "demo@company.com",
      "phone": "+1234567890",
      "address": "123 Demo Street",
      "status": "ACTIVE",
      "createdAt": "2025-12-19T10:00:00.000Z",
      "subscription": {
        "id": "uuid",
        "status": "ACTIVE",
        "plan": {
          "name": "Professional",
          "price": 79.99
        }
      },
      "_count": {
        "users": 4,
        "employees": 0,
        "projects": 0
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### 8. Get Company Stats
**Endpoint:** `GET /superadmin/companies/stats`  
**Authentication:** Required - Superadmin  
**Description:** Get statistik companies

**Headers:**
```
Authorization: Bearer {superadmin-token}
```

**Response (200):**
```json
{
  "total": 10,
  "active": 8,
  "trial": 1,
  "suspended": 0,
  "inactive": 1
}
```

---

### 9. Get Single Company
**Endpoint:** `GET /superadmin/companies/:id`  
**Authentication:** Required - Superadmin  
**Description:** Detail company by ID

**Headers:**
```
Authorization: Bearer {superadmin-token}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Demo Company",
  "email": "demo@company.com",
  "phone": "+1234567890",
  "address": "123 Demo Street",
  "website": "https://demo.com",
  "status": "ACTIVE",
  "subscriptionId": "uuid",
  "subscription": {
    "id": "uuid",
    "status": "ACTIVE",
    "startDate": "2025-12-19",
    "endDate": "2026-12-19",
    "autoRenew": true,
    "plan": {
      "name": "Professional",
      "price": 79.99,
      "billingPeriod": "MONTHLY",
      "maxUsers": 20,
      "maxProjects": 50,
      "features": ["Feature 1", "Feature 2"]
    }
  },
  "users": [
    {
      "id": "uuid",
      "email": "admin@demo.com",
      "firstName": "Admin",
      "lastName": "Demo",
      "role": {
        "name": "admin"
      }
    }
  ],
  "_count": {
    "users": 4,
    "employees": 0,
    "projects": 0
  },
  "createdAt": "2025-12-19T10:00:00.000Z",
  "updatedAt": "2025-12-21T10:00:00.000Z"
}
```

---

### 10. Update Company
**Endpoint:** `PATCH /superadmin/companies/:id`  
**Authentication:** Required - Superadmin  
**Description:** Update company data

**Headers:**
```
Authorization: Bearer {superadmin-token}
Content-Type: application/json
```

**Request Body (Partial Update):**
```json
{
  "status": "ACTIVE",
  "phone": "+628123456789",
  "address": "New Address"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Demo Company",
  "status": "ACTIVE",
  "phone": "+628123456789",
  "address": "New Address",
  "updatedAt": "2025-12-21T10:30:00.000Z"
}
```

---

### 11. Delete Company
**Endpoint:** `DELETE /superadmin/companies/:id`  
**Authentication:** Required - Superadmin  
**Description:** Hapus company (soft delete)

**Headers:**
```
Authorization: Bearer {superadmin-token}
```

**Response (200):**
```json
{
  "message": "Company deleted successfully"
}
```

---

## 💰 Superadmin - Pricing Plans

**Note:** All endpoints require **Superadmin authentication**

### 12. Create Pricing Plan
**Endpoint:** `POST /superadmin/pricing-plans`  
**Authentication:** Required - Superadmin  
**Description:** Buat pricing plan baru

**Headers:**
```
Authorization: Bearer {superadmin-token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Premium",
  "description": "Premium plan for enterprise",
  "price": 299.99,
  "billingPeriod": "MONTHLY",
  "features": [
    "Unlimited users",
    "Unlimited projects",
    "1TB storage",
    "24/7 Priority support",
    "Custom integrations",
    "Dedicated account manager"
  ],
  "maxUsers": 999,
  "maxProjects": 9999,
  "maxStorage": 1000,
  "isActive": true
}
```

**Billing Period Options:**
- `MONTHLY`
- `YEARLY`
- `LIFETIME`

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Premium",
  "description": "Premium plan for enterprise",
  "price": 299.99,
  "billingPeriod": "MONTHLY",
  "features": ["Unlimited users", "..."],
  "maxUsers": 999,
  "maxProjects": 9999,
  "maxStorage": 1000,
  "isActive": true,
  "createdAt": "2025-12-21T10:00:00.000Z",
  "updatedAt": "2025-12-21T10:00:00.000Z"
}
```

---

### 13. Get All Pricing Plans
**Endpoint:** `GET /superadmin/pricing-plans`  
**Authentication:** Required - Superadmin  
**Description:** List semua pricing plans

**Headers:**
```
Authorization: Bearer {superadmin-token}
```

**Query Parameters:**
```
includeInactive=false    # Include inactive plans (default: false)
```

**Example Request:**
```
GET /superadmin/pricing-plans?includeInactive=true
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Starter",
    "description": "Perfect for small teams",
    "price": 29.99,
    "billingPeriod": "MONTHLY",
    "features": [
      "Basic Project Management",
      "Up to 5 users",
      "10 projects",
      "5GB storage"
    ],
    "maxUsers": 5,
    "maxProjects": 10,
    "maxStorage": 5,
    "isActive": true,
    "_count": {
      "subscriptions": 0
    }
  },
  {
    "id": "uuid",
    "name": "Professional",
    "price": 79.99,
    "billingPeriod": "MONTHLY",
    "maxUsers": 20,
    "maxProjects": 50,
    "maxStorage": 50,
    "isActive": true,
    "_count": {
      "subscriptions": 1
    }
  }
]
```

---

### 14. Get Single Pricing Plan
**Endpoint:** `GET /superadmin/pricing-plans/:id`  
**Authentication:** Required - Superadmin  
**Description:** Detail pricing plan by ID

**Headers:**
```
Authorization: Bearer {superadmin-token}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Professional",
  "description": "For growing businesses",
  "price": 79.99,
  "billingPeriod": "MONTHLY",
  "features": [
    "Advanced Project Management",
    "Procurement Management",
    "Up to 20 users",
    "50 projects",
    "50GB storage",
    "Priority support"
  ],
  "maxUsers": 20,
  "maxProjects": 50,
  "maxStorage": 50,
  "isActive": true,
  "subscriptions": [
    {
      "id": "uuid",
      "status": "ACTIVE",
      "company": {
        "name": "Demo Company"
      }
    }
  ],
  "_count": {
    "subscriptions": 1
  },
  "createdAt": "2025-12-19T10:00:00.000Z"
}
```

---

### 15. Update Pricing Plan
**Endpoint:** `PATCH /superadmin/pricing-plans/:id`  
**Authentication:** Required - Superadmin  
**Description:** Update pricing plan

**Headers:**
```
Authorization: Bearer {superadmin-token}
Content-Type: application/json
```

**Request Body (Partial Update):**
```json
{
  "price": 89.99,
  "features": [
    "Advanced Project Management",
    "Procurement Management",
    "Up to 25 users",
    "50 projects",
    "50GB storage",
    "Priority support",
    "Advanced analytics"
  ],
  "maxUsers": 25
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Professional",
  "price": 89.99,
  "maxUsers": 25,
  "updatedAt": "2025-12-21T10:30:00.000Z"
}
```

---

### 16. Delete Pricing Plan
**Endpoint:** `DELETE /superadmin/pricing-plans/:id`  
**Authentication:** Required - Superadmin  
**Description:** Hapus pricing plan

**Headers:**
```
Authorization: Bearer {superadmin-token}
```

**Response (200):**
```json
{
  "message": "Pricing plan deleted successfully"
}
```

---

## 📊 Superadmin - Dashboard

**Note:** All endpoints require **Superadmin authentication**

### 17. Get Dashboard Overview
**Endpoint:** `GET /superadmin/dashboard/overview`  
**Authentication:** Required - Superadmin  
**Description:** Overview statistik sistem

**Headers:**
```
Authorization: Bearer {superadmin-token}
```

**Response (200):**
```json
{
  "stats": {
    "totalCompanies": 10,
    "activeCompanies": 8,
    "totalUsers": 45,
    "totalPlans": 3,
    "activeSubscriptions": 8
  },
  "recentCompanies": [
    {
      "id": "uuid",
      "name": "New Company",
      "email": "new@company.com",
      "status": "TRIAL",
      "createdAt": "2025-12-21T09:00:00.000Z",
      "subscription": {
        "plan": {
          "name": "Starter"
        }
      }
    }
  ],
  "revenue": {
    "monthlyRevenue": 639.92,
    "yearlyRevenue": 7679.04,
    "activeSubscriptions": 8
  }
}
```

---

### 18. Get Company Growth
**Endpoint:** `GET /superadmin/dashboard/company-growth`  
**Authentication:** Required - Superadmin  
**Description:** Data pertumbuhan company per bulan

**Headers:**
```
Authorization: Bearer {superadmin-token}
```

**Query Parameters:**
```
months=6    # Number of months (default: 6)
```

**Response (200):**
```json
[
  {
    "month": "2025-07",
    "count": 2
  },
  {
    "month": "2025-08",
    "count": 3
  },
  {
    "month": "2025-09",
    "count": 1
  },
  {
    "month": "2025-10",
    "count": 0
  },
  {
    "month": "2025-11",
    "count": 2
  },
  {
    "month": "2025-12",
    "count": 2
  }
]
```

---

### 19. Get Subscription Breakdown
**Endpoint:** `GET /superadmin/dashboard/subscription-breakdown`  
**Authentication:** Required - Superadmin  
**Description:** Breakdown subscription per pricing plan

**Headers:**
```
Authorization: Bearer {superadmin-token}
```

**Response (200):**
```json
[
  {
    "planName": "Starter",
    "count": 2,
    "revenue": 59.98
  },
  {
    "planName": "Professional",
    "count": 5,
    "revenue": 399.95
  },
  {
    "planName": "Enterprise",
    "count": 1,
    "revenue": 199.99
  }
]
```

---

### 20. Get Company Status Distribution
**Endpoint:** `GET /superadmin/dashboard/company-status`  
**Authentication:** Required - Superadmin  
**Description:** Distribusi company berdasarkan status

**Headers:**
```
Authorization: Bearer {superadmin-token}
```

**Response (200):**
```json
[
  {
    "status": "ACTIVE",
    "count": 8
  },
  {
    "status": "TRIAL",
    "count": 1
  },
  {
    "status": "SUSPENDED",
    "count": 0
  },
  {
    "status": "INACTIVE",
    "count": 1
  }
]
```

---

## 📝 Environment Variables

Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/erp_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3000
```

---

## 🔑 Authorization Header Format

All protected endpoints require JWT token in header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get token:**
1. Call `POST /auth/login` with credentials
2. Copy `access_token` from response
3. Use it in `Authorization` header for subsequent requests

---

## 🚨 Common Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Solution:** Provide valid JWT token in Authorization header

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```
**Solution:** User role doesn't have access to this endpoint

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Email already registered"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than 8 characters"
  ],
  "error": "Bad Request"
}
```

---

## 📦 Postman Collection

### Import to Postman:

1. **Create Environment:**
   - Variable: `base_url` = `http://localhost:3000`
   - Variable: `token` = (will be set after login)

2. **Create Collections:**
   - Authentication
   - Superadmin - Companies
   - Superadmin - Pricing Plans
   - Superadmin - Dashboard

3. **Setup Pre-request Script for Protected Endpoints:**
   ```javascript
   pm.environment.set("token", pm.environment.get("token"));
   ```

4. **Setup Test Script for Login:**
   ```javascript
   if (pm.response.code === 200) {
       var jsonData = pm.response.json();
       pm.environment.set("token", jsonData.access_token);
   }
   ```

---

## 🎯 Testing Workflow

### 1. Login as Master Superadmin
```
POST /auth/login
Body: { "email": "master@erp-system.com", "password": "MasterAdmin123!" }
→ Save access_token
```

### 2. Register New Superadmin
```
POST /auth/register-superadmin
Headers: Authorization: Bearer {master-token}
Body: { "email": "new@erp.com", "password": "Pass123!", ... }
```

### 3. Create Company
```
POST /superadmin/companies
Headers: Authorization: Bearer {superadmin-token}
Body: { "name": "Test Co", ... }
```

### 4. View Dashboard
```
GET /superadmin/dashboard/overview
Headers: Authorization: Bearer {superadmin-token}
```

---

## 📚 Additional Resources

- **Prisma Studio**: `pnpm prisma studio` → http://localhost:5555
- **API Documentation**: See `SUPERADMIN_README.md`
- **Authentication Guide**: See `AUTHENTICATION_GUIDE.md`
- **Master Superadmin API**: See `MASTER_SUPERADMIN_API.md`

---

**Generated:** December 21, 2025  
**Version:** 1.0.0  
**Base URL:** http://localhost:3000
