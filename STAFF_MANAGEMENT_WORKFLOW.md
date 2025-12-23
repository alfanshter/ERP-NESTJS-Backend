# Staff Management Workflow Guide

## 🎯 Overview

This guide explains the complete workflow for superadmin role hierarchy and staff management in the ERP system.

## 📋 Role Hierarchy

```
superadmin-master (Top Level)
├─ Full system access
├─ Can create/manage superadmin-staff accounts
└─ Access to /superadmin/staff endpoints

superadmin-staff (Regular Level)  
├─ Full system access (companies, pricing, etc)
├─ Cannot create other superadmin accounts
└─ Cannot access /superadmin/staff endpoints
```

## 🚀 Quick Start Workflow

### Step 1: Register Master Account

**Endpoint:** `POST /auth/register/superadmin`

**Headers:**
```
x-master-key: MASTER_SUPER_ADMIN_KEY_2024
Content-Type: application/json
```

**Body:**
```json
{
  "email": "master@erp.com",
  "password": "MasterAdmin123!",
  "firstName": "Master",
  "lastName": "Admin",
  "phone": "+628123456789"
}
```

**Response:** 201 Created
```json
{
  "id": "uuid",
  "email": "master@erp.com",
  "firstName": "Master",
  "lastName": "Admin",
  "role": {
    "id": "uuid",
    "name": "superadmin-master"
  },
  "isActive": true
}
```

⚠️ **Important:** 
- Master key required in header
- Only one master account recommended per system
- This is the highest privilege account

---

### Step 2: Login as Master

**Endpoint:** `POST /auth/login`

**Body:**
```json
{
  "email": "master@erp.com",
  "password": "MasterAdmin123!"
}
```

**Response:** 200 OK
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "master@erp.com",
    "firstName": "Master",
    "role": {
      "id": "uuid",
      "name": "superadmin-master"
    },
    "isSuperAdminMaster": true,
    "isSuperAdmin": true
  }
}
```

💡 **Store the token:** Save `access_token` for subsequent requests

---

### Step 3: Verify Profile & Role

**Endpoint:** `GET /auth/profile`

**Headers:**
```
Authorization: Bearer {your_token}
```

**Response:** 200 OK
```json
{
  "id": "uuid",
  "email": "master@erp.com",
  "firstName": "Master",
  "lastName": "Admin",
  "role": {
    "id": "uuid",
    "name": "superadmin-master",
    "description": "Master Super Administrator"
  },
  "isActive": true
}
```

✅ **Confirm:** Check that `role.name === "superadmin-master"`

---

### Step 4: Create Staff Account

**Endpoint:** `POST /superadmin/staff`

**Headers:**
```
Authorization: Bearer {master_token}
Content-Type: application/json
```

**Body:**
```json
{
  "email": "staff1@erp.com",
  "password": "Staff123!",
  "firstName": "Staff",
  "lastName": "One",
  "phone": "+628123456789"
}
```

**Response:** 201 Created
```json
{
  "id": "uuid",
  "email": "staff1@erp.com",
  "firstName": "Staff",
  "lastName": "One",
  "role": {
    "id": "uuid",
    "name": "superadmin-staff",
    "description": "Super Administrator Staff"
  },
  "isActive": true
}
```

🔒 **Access Control:**
- ✅ Master can create staff
- ❌ Staff cannot create other accounts
- ❌ Regular users cannot access this endpoint

---

### Step 5: Test Staff Access

**5a. Login as Staff**

**Endpoint:** `POST /auth/login`

**Body:**
```json
{
  "email": "staff1@erp.com",
  "password": "Staff123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "role": {
      "name": "superadmin-staff"
    },
    "isSuperAdminMaster": false,
    "isSuperAdmin": true
  }
}
```

**5b. Try Accessing Staff Management (Should Fail)**

**Endpoint:** `GET /superadmin/staff`

**Headers:**
```
Authorization: Bearer {staff_token}
```

**Response:** 403 Forbidden
```json
{
  "message": "Only Master Super Admin can access this resource",
  "error": "Forbidden",
  "statusCode": 403
}
```

✅ **Expected:** Staff cannot access staff management endpoints

---

## 📊 Staff Management CRUD Operations

### List All Staff

```http
GET /superadmin/staff?page=1&limit=10&search=staff
Authorization: Bearer {master_token}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "staff1@erp.com",
      "firstName": "Staff",
      "lastName": "One",
      "role": {
        "name": "superadmin-staff"
      },
      "isActive": true
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

### Get Staff Statistics

```http
GET /superadmin/staff/stats
Authorization: Bearer {master_token}
```

**Response:**
```json
{
  "totalStaff": 5,
  "activeStaff": 4,
  "inactiveStaff": 1,
  "byRole": {
    "superadmin-master": 1,
    "superadmin-staff": 4
  }
}
```

---

### Get Staff by ID

```http
GET /superadmin/staff/{staffId}
Authorization: Bearer {master_token}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "staff1@erp.com",
  "firstName": "Staff",
  "lastName": "One",
  "phone": "+628123456789",
  "role": {
    "id": "uuid",
    "name": "superadmin-staff"
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### Update Staff

```http
PATCH /superadmin/staff/{staffId}
Authorization: Bearer {master_token}
Content-Type: application/json

{
  "firstName": "Updated",
  "lastName": "Name",
  "phone": "+628987654321",
  "isActive": false
}
```

⚠️ **Cannot update:**
- Email (unique identifier)
- Password (use separate endpoint if needed)
- Role (staff always stays as superadmin-staff)
- Master accounts (protected)

---

### Delete Staff

```http
DELETE /superadmin/staff/{staffId}
Authorization: Bearer {master_token}
```

**Response:** 200 OK
```json
{
  "message": "Staff deleted successfully"
}
```

⚠️ **Cannot delete:**
- Master accounts (superadmin-master)
- Your own account
- Already deleted accounts

---

## 🔐 Security Features

### Access Control Guards

1. **JwtAuthGuard** - Validates JWT token
2. **SuperadminMasterGuard** - Ensures user is superadmin-master
3. **RolesGuard** - Checks user roles for endpoints

### Master Key Protection

- Required only for master registration
- Stored in `.env` as `MASTER_SUPER_ADMIN_KEY`
- Never expose in client-side code
- Rotate periodically for security

### Role-Based Restrictions

| Action | Master | Staff |
|--------|--------|-------|
| Create companies | ✅ | ✅ |
| Update pricing plans | ✅ | ✅ |
| View subscriptions | ✅ | ✅ |
| **Create staff** | ✅ | ❌ |
| **Update staff** | ✅ | ❌ |
| **Delete staff** | ✅ | ❌ |

---

## 🐛 Troubleshooting

### 403 Forbidden on /superadmin/staff

**Problem:** Staff trying to access master-only endpoints

**Solution:**
1. Check your token with `GET /auth/profile`
2. Confirm `role.name === "superadmin-master"`
3. Login with master account if needed
4. Postman: Use "Login" with `{{master_email}}` and `{{master_password}}`

---

### 401 Unauthorized

**Problem:** Invalid or expired token

**Solution:**
1. Login again to get fresh token
2. Check token is in `Authorization: Bearer {token}` header
3. Verify token hasn't expired (default 1 day)

---

### 409 Conflict on Staff Creation

**Problem:** Email already exists

**Solution:**
1. Use unique email address
2. Check existing staff with `GET /superadmin/staff?search=email`
3. Delete old account if no longer needed

---

### Cannot Register Master (403)

**Problem:** Missing or invalid master key

**Solution:**
1. Add header: `x-master-key: MASTER_SUPER_ADMIN_KEY_2024`
2. Check `.env` file has correct `MASTER_SUPER_ADMIN_KEY`
3. Restart server after changing `.env`
4. Postman: Use `{{master_key}}` variable

---

## 📱 Postman Collection Variables

Update your Postman collection variables:

| Variable | Value | Usage |
|----------|-------|-------|
| `base_url` | `http://localhost:3000` | API endpoint |
| `token` | *(auto-set after login)* | JWT authentication |
| `master_key` | `MASTER_SUPER_ADMIN_KEY_2024` | Master registration |
| `master_email` | `master@erp.com` | Master login |
| `master_password` | `MasterAdmin123!` | Master login |

---

## 🧪 Testing Checklist

- [ ] Register master account successfully
- [ ] Login as master and get token
- [ ] Verify profile shows superadmin-master role
- [ ] Create staff account successfully
- [ ] Staff account has superadmin-staff role
- [ ] Login as staff successfully
- [ ] Staff gets 403 on /superadmin/staff endpoints
- [ ] Master can list all staff
- [ ] Master can view staff statistics
- [ ] Master can update staff details
- [ ] Master can deactivate staff
- [ ] Master can delete staff
- [ ] Cannot delete master accounts
- [ ] Cannot update master to staff

---

## 📚 Related Documentation

- [SUPERADMIN_HIERARCHY.md](./SUPERADMIN_HIERARCHY.md) - Technical implementation details
- [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) - JWT and auth flow
- [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md) - Postman collection usage
- [MASTER_SUPERADMIN_API.md](./MASTER_SUPERADMIN_API.md) - API reference

---

## 💡 Best Practices

1. **One Master Per System**
   - Create only one superadmin-master account
   - Use staff accounts for daily operations
   - Master for administrative tasks only

2. **Secure Master Key**
   - Never commit master key to git
   - Store in environment variables
   - Rotate periodically
   - Share securely with authorized personnel only

3. **Staff Management**
   - Create staff with unique emails
   - Use descriptive names for identification
   - Deactivate instead of delete when possible
   - Monitor staff activity regularly

4. **Token Management**
   - Store tokens securely (HttpOnly cookies in production)
   - Implement refresh token rotation
   - Set appropriate expiration times
   - Clear tokens on logout

5. **Error Handling**
   - Always check HTTP status codes
   - Read error messages for troubleshooting
   - Use Postman console for debugging
   - Enable test scripts for automatic feedback

---

**Last Updated:** December 21, 2024  
**Version:** 1.0.0
