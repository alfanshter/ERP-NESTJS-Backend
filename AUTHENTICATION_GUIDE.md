# 🔐 Authentication Guide - ERP Backend System

## Overview
Sistem autentikasi JWT (JSON Web Token) telah diimplementasikan untuk mengamankan endpoint API. Semua endpoint superadmin sekarang memerlukan autentikasi dan role validation.

## 📋 Authentication Endpoints

### 1. Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "superadmin@erp-system.com",
  "password": "SuperAdmin123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "superadmin@erp-system.com",
    "name": "Super Admin",
    "roleId": "role-uuid"
  }
}
```

### 2. Register (New User)
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "name": "New User",
  "roleId": "role-uuid"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "new-uuid",
    "email": "newuser@example.com",
    "name": "New User",
    "roleId": "role-uuid"
  }
}
```

### 3. Get Current User Profile
**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "superadmin@erp-system.com",
  "name": "Super Admin",
  "roleId": "role-uuid",
  "role": {
    "id": "role-uuid",
    "name": "superadmin",
    "description": "Super Administrator",
    "permissions": ["all"]
  }
}
```

## 🔒 Protected Endpoints

Semua endpoint berikut memerlukan:
1. **JWT Token** dalam header `Authorization: Bearer <token>`
2. **Role** = `superadmin`

### Companies Endpoints
- `POST /superadmin/companies` - Create company
- `GET /superadmin/companies` - List all companies
- `GET /superadmin/companies/stats` - Get company statistics
- `GET /superadmin/companies/:id` - Get company by ID
- `PATCH /superadmin/companies/:id` - Update company
- `DELETE /superadmin/companies/:id` - Delete company

### Pricing Plans Endpoints
- `POST /superadmin/pricing-plans` - Create pricing plan
- `GET /superadmin/pricing-plans` - List all pricing plans
- `GET /superadmin/pricing-plans/:id` - Get pricing plan by ID
- `PATCH /superadmin/pricing-plans/:id` - Update pricing plan
- `DELETE /superadmin/pricing-plans/:id` - Delete pricing plan

### Dashboard Endpoints
- `GET /superadmin/dashboard/overview` - Get dashboard overview
- `GET /superadmin/dashboard/company-growth` - Get company growth data
- `GET /superadmin/dashboard/subscription-breakdown` - Get subscription breakdown
- `GET /superadmin/dashboard/company-status` - Get company status distribution

## 🧪 Testing dengan cURL

### Step 1: Login dan Dapatkan Token
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@erp-system.com",
    "password": "SuperAdmin123!"
  }'
```

**Simpan `access_token` dari response!**

### Step 2: Test Protected Endpoint
```bash
# Ganti <YOUR_TOKEN> dengan token dari Step 1
curl -X GET http://localhost:3000/superadmin/companies \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### Step 3: Test Unauthorized Access
```bash
# Tanpa token (akan return 401 Unauthorized)
curl -X GET http://localhost:3000/superadmin/companies
```

## 🔧 Testing dengan Postman/Thunder Client

### 1. Setup Collection Variable
- Nama: `token`
- Value: (akan diisi otomatis dari login response)

### 2. Login Request
- **Method:** POST
- **URL:** `http://localhost:3000/auth/login`
- **Headers:** 
  - `Content-Type: application/json`
- **Body:**
```json
{
  "email": "superadmin@erp-system.com",
  "password": "SuperAdmin123!"
}
```
- **Tests (Optional - auto save token):**
```javascript
pm.test("Save token", function () {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.access_token);
});
```

### 3. Protected Request
- **Method:** GET
- **URL:** `http://localhost:3000/superadmin/companies`
- **Headers:**
  - `Authorization: Bearer {{token}}`

## 🛡️ Security Features

### 1. JWT Token Configuration
- **Algorithm:** HS256
- **Expiration:** 7 days
- **Secret:** Configured in `.env` file

### 2. Password Security
- **Hashing:** bcrypt with salt rounds
- **Validation:** Minimum 6 characters required

### 3. Role-Based Access Control (RBAC)
- Guards: `JwtAuthGuard` + `RolesGuard`
- Decorators: `@Roles('superadmin')`
- Automatic role validation from JWT payload

### 4. Request Validation
- DTOs with class-validator
- Email format validation
- Required field validation

## 📝 Environment Variables

Pastikan `.env` file memiliki:
```env
DATABASE_URL="postgresql://macbook@localhost:5432/erp_db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-2024-erp-system"
```

⚠️ **IMPORTANT:** Ganti `JWT_SECRET` di production dengan key yang lebih secure!

## 🔄 Token Workflow

```
1. User Login
   ↓
2. Validate credentials (email + password)
   ↓
3. Generate JWT token dengan payload:
   {
     sub: user.id,
     email: user.email,
     roleId: user.roleId
   }
   ↓
4. Return token ke client
   ↓
5. Client menyimpan token (localStorage/cookie)
   ↓
6. Client mengirim token di header setiap request:
   Authorization: Bearer <token>
   ↓
7. Server validate token dengan JwtStrategy
   ↓
8. Server validate role dengan RolesGuard
   ↓
9. Request diproses atau ditolak (401/403)
```

## 🚨 Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Cause:** Token tidak ada, invalid, atau expired

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```
**Cause:** User tidak memiliki role yang required (bukan superadmin)

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password is required"],
  "error": "Bad Request"
}
```
**Cause:** Request body validation gagal

## 🎯 Default Credentials

### Superadmin Account
- **Email:** `superadmin@erp-system.com`
- **Password:** `SuperAdmin123!`
- **Role:** superadmin
- **Permissions:** Full access to all endpoints

### Demo Company Users
Check `prisma/seed.ts` untuk credentials lainnya.

## 🔍 Debugging Tips

### 1. Check if Token is Valid
```bash
# Decode JWT token (tanpa verify signature)
echo "YOUR_TOKEN_HERE" | cut -d'.' -f2 | base64 -d | jq .
```

### 2. Check Server Logs
Server akan log setiap request yang masuk. Check terminal untuk:
- Authentication errors
- Database queries
- Validation errors

### 3. Test dengan Browser Console
```javascript
// Login
const loginResponse = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'superadmin@erp-system.com',
    password: 'SuperAdmin123!'
  })
});
const { access_token } = await loginResponse.json();

// Use token
const companiesResponse = await fetch('http://localhost:3000/superadmin/companies', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
const companies = await companiesResponse.json();
console.log(companies);
```

## 📚 Implementation Details

### Guards
- **JwtAuthGuard:** Validates JWT token using Passport strategy
- **RolesGuard:** Checks if user has required role(s)

### Strategies
- **JwtStrategy:** Extracts and validates JWT from Bearer token
- **LocalStrategy:** Validates username/password for login

### Decorators
- **@Roles(...):** Specifies required roles for endpoint
- **@CurrentUser():** Injects current user object from request

### DTOs
- **LoginDto:** Email + Password validation
- **RegisterDto:** Email + Password + Name + RoleId validation

## 🚀 Next Steps

1. ✅ Authentication system implemented
2. ✅ All superadmin endpoints protected
3. ⏳ Implement tenant-specific authentication
4. ⏳ Add refresh token mechanism
5. ⏳ Implement password reset flow
6. ⏳ Add 2FA/MFA support
7. ⏳ Setup rate limiting
8. ⏳ Add API documentation (Swagger)

---

**Last Updated:** December 21, 2025  
**Version:** 1.0.0
