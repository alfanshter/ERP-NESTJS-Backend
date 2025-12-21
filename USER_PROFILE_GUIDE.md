# 👤 User Profile Endpoints - Complete Guide

## Overview
Sistem menyediakan 2 endpoint untuk mendapatkan informasi user yang sedang login dengan data yang lengkap.

---

## 🔐 Authentication Required
Semua endpoint memerlukan JWT token di header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📋 Endpoints

### 1. GET /auth/profile
**Deskripsi:** Mendapatkan profile lengkap user dengan relasi role dan company

**Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Success (200):**
```json
{
  "id": "75dde71e-511d-481b-a54e-46fd5e587164",
  "email": "superadmin@erp-system.com",
  "firstName": "Super",
  "lastName": "Admin",
  "roleId": "70249e53-c5fc-49dd-9ed0-e511654ed86f",
  "companyId": null,
  "createdAt": "2024-12-19T12:57:49.000Z",
  "updatedAt": "2024-12-19T12:57:49.000Z",
  "role": {
    "id": "70249e53-c5fc-49dd-9ed0-e511654ed86f",
    "name": "superadmin",
    "description": "Super Administrator",
    "permissions": ["all"],
    "createdAt": "2024-12-19T12:57:49.000Z",
    "updatedAt": "2024-12-19T12:57:49.000Z"
  },
  "company": null
}
```

**Response untuk User dengan Company:**
```json
{
  "id": "uuid-user",
  "email": "admin@democorp.com",
  "firstName": "Demo",
  "lastName": "Admin",
  "roleId": "uuid-role",
  "companyId": "uuid-company",
  "createdAt": "2024-12-19T12:57:49.000Z",
  "updatedAt": "2024-12-19T12:57:49.000Z",
  "role": {
    "id": "uuid-role",
    "name": "admin",
    "description": "Company Administrator",
    "permissions": ["manage_users", "view_reports"],
    "createdAt": "2024-12-19T12:57:49.000Z",
    "updatedAt": "2024-12-19T12:57:49.000Z"
  },
  "company": {
    "id": "uuid-company",
    "name": "Demo Corporation",
    "email": "contact@democorp.com",
    "phone": "+1234567890",
    "address": "123 Business St",
    "subscriptionStatus": "ACTIVE",
    "subscriptionStartDate": "2024-01-01T00:00:00.000Z",
    "subscriptionEndDate": "2025-01-01T00:00:00.000Z",
    "createdAt": "2024-12-19T12:57:49.000Z",
    "updatedAt": "2024-12-19T12:57:49.000Z"
  }
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | User unique identifier |
| `email` | string | User email address |
| `firstName` | string | User first name |
| `lastName` | string | User last name |
| `roleId` | string (UUID) | Reference to role |
| `companyId` | string \| null | Reference to company (null for superadmin) |
| `createdAt` | datetime | Account creation timestamp |
| `updatedAt` | datetime | Last update timestamp |
| `role` | object | Complete role information |
| `role.name` | string | Role name (superadmin, admin, manager, etc.) |
| `role.description` | string | Role description |
| `role.permissions` | array | List of permissions |
| `company` | object \| null | Company details (null for superadmin) |
| `company.name` | string | Company name |
| `company.subscriptionStatus` | string | ACTIVE, SUSPENDED, CANCELLED, TRIAL |

---

### 2. GET /auth/me
**Deskripsi:** Mendapatkan data user dari JWT token (quick access, minimal data)

**Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Success (200):**
```json
{
  "userId": "75dde71e-511d-481b-a54e-46fd5e587164",
  "email": "superadmin@erp-system.com",
  "roleId": "70249e53-c5fc-49dd-9ed0-e511654ed86f",
  "companyId": null,
  "isSuperAdmin": true,
  "iat": 1734612615,
  "exp": 1735217415
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string (UUID) | User ID from JWT payload |
| `email` | string | Email from JWT payload |
| `roleId` | string (UUID) | Role ID from JWT payload |
| `companyId` | string \| null | Company ID from JWT payload |
| `isSuperAdmin` | boolean | Quick check if user is superadmin |
| `iat` | number | Token issued at (Unix timestamp) |
| `exp` | number | Token expiration (Unix timestamp) |

---

## 🧪 Testing dengan cURL

### Test Profile Endpoint (Lengkap)

```bash
# 1. Login dulu
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@erp-system.com",
    "password": "SuperAdmin123!"
  }')

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

# 2. Get full profile
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Output:**
```json
{
  "id": "75dde71e-511d-481b-a54e-46fd5e587164",
  "email": "superadmin@erp-system.com",
  "firstName": "Super",
  "lastName": "Admin",
  "roleId": "70249e53-c5fc-49dd-9ed0-e511654ed86f",
  "companyId": null,
  "createdAt": "2024-12-19T12:57:49.000Z",
  "updatedAt": "2024-12-19T12:57:49.000Z",
  "role": {
    "id": "70249e53-c5fc-49dd-9ed0-e511654ed86f",
    "name": "superadmin",
    "description": "Super Administrator",
    "permissions": ["all"],
    "createdAt": "2024-12-19T12:57:49.000Z",
    "updatedAt": "2024-12-19T12:57:49.000Z"
  },
  "company": null
}
```

### Test Me Endpoint (Quick)

```bash
# Using same token from above
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Output:**
```json
{
  "userId": "75dde71e-511d-481b-a54e-46fd5e587164",
  "email": "superadmin@erp-system.com",
  "roleId": "70249e53-c5fc-49dd-9ed0-e511654ed86f",
  "companyId": null,
  "isSuperAdmin": true,
  "iat": 1734612615,
  "exp": 1735217415
}
```

---

## 📊 Comparison

| Aspect | GET /auth/profile | GET /auth/me |
|--------|------------------|--------------|
| Data Source | Database query | JWT payload only |
| Performance | Slower (DB query) | Faster (no DB query) |
| Data Completeness | **Full** (with relations) | Minimal (token data) |
| Use Case | Display profile page | Quick auth check |
| Includes Role Details | ✅ Yes | ❌ No (only roleId) |
| Includes Company Details | ✅ Yes | ❌ No (only companyId) |
| firstName/lastName | ✅ Yes | ❌ No |
| Timestamps | ✅ Yes | ✅ Yes (iat, exp) |

---

## 💡 Use Cases

### Use `/auth/profile` when:
- ✅ Displaying user profile page
- ✅ Need complete user information
- ✅ Need role permissions list
- ✅ Need company subscription details
- ✅ Editing user profile
- ✅ Showing detailed user info in dashboard

### Use `/auth/me` when:
- ✅ Quick authentication check
- ✅ Verifying token validity
- ✅ Checking if user is superadmin
- ✅ Getting basic user IDs
- ✅ Middleware/guard validation
- ✅ Performance-critical operations

---

## 🎯 Frontend Integration

### Using in React/Next.js

```typescript
// Get full profile
async function getUserProfile(token: string) {
  const response = await fetch('http://localhost:3000/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const profile = await response.json();
  
  // Access all fields
  console.log(`Name: ${profile.firstName} ${profile.lastName}`);
  console.log(`Email: ${profile.email}`);
  console.log(`Role: ${profile.role.name}`);
  console.log(`Company: ${profile.company?.name || 'No Company'}`);
  console.log(`Created: ${new Date(profile.createdAt).toLocaleDateString()}`);
  
  return profile;
}

// Quick check from token
async function checkAuth(token: string) {
  const response = await fetch('http://localhost:3000/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  // Quick checks
  if (data.isSuperAdmin) {
    console.log('User is superadmin');
  }
  
  // Check token expiry
  const expiresAt = new Date(data.exp * 1000);
  console.log(`Token expires at: ${expiresAt}`);
  
  return data;
}
```

---

## 🚨 Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Cause:** Token tidak ada, invalid, atau expired

### 404 Not Found (profile endpoint only)
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```
**Cause:** User ID dari token tidak ditemukan di database

---

## 🔒 Security Notes

1. **Password Never Returned:** Password hash tidak pernah dikembalikan dalam response
2. **Token in Header Only:** Token hanya dikirim via Authorization header, bukan query params
3. **HTTPS in Production:** Selalu gunakan HTTPS di production
4. **Token Expiry:** Token expired setelah 7 hari
5. **Sensitive Data:** Company financial data tidak di-expose di profile endpoint

---

## 📅 Login Response Data

Saat login, Anda juga mendapat summary user:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "75dde71e-511d-481b-a54e-46fd5e587164",
    "firstName": "Super",
    "lastName": "Admin",
    "email": "superadmin@erp-system.com",
    "role": "superadmin",
    "company": null,
    "isSuperAdmin": true
  }
}
```

Ini adalah summary, untuk data lengkap gunakan `/auth/profile`.

---

**Last Updated:** December 21, 2025  
**API Version:** 1.0.0
