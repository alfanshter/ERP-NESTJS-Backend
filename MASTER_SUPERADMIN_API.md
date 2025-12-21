# Master Superadmin API - Quick Reference

## 📖 Overview

Sistem hierarchical superadmin dengan 2 level:
- **Master Superadmin**: Dapat mendaftarkan superadmin baru
- **Regular Superadmin**: Tidak dapat mendaftarkan superadmin baru

## 🔐 Credentials

### Master Superadmin
```
Email: master@erp-system.com
Password: MasterAdmin123!
```

### Regular Superadmin
```
Email: superadmin@erp-system.com
Password: SuperAdmin123!
```

## 🚀 API Endpoint

### Register Superadmin

**Endpoint:** `POST /auth/register-superadmin`

**Authentication:** Required - Master Superadmin only

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {master-superadmin-token}
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

**Success Response (201):**
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
      "description": "Super Administrator - Full system access (cannot register superadmins)",
      "permissions": ["all"]
    }
  }
}
```

**Error Responses:**

- **401 Unauthorized** - No token provided
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

- **403 Forbidden** - Not Master Superadmin
```json
{
  "statusCode": 403,
  "message": "Only Master Superadmin can perform this action"
}
```

- **409 Conflict** - Email already exists
```json
{
  "statusCode": 409,
  "message": "Email already registered"
}
```

## 🔒 Security Rules

| User Type | Can Register Superadmin? |
|-----------|-------------------------|
| Master Superadmin | ✅ Yes |
| Regular Superadmin | ❌ No (403 Forbidden) |
| Company Admin | ❌ No (403 Forbidden) |
| Unauthenticated | ❌ No (401 Unauthorized) |

## 🧪 Testing

### Automated Test
```bash
./test-register-superadmin.sh
```

### Manual Test Steps

**1. Login as Master Superadmin**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "master@erp-system.com",
    "password": "MasterAdmin123!"
  }'
```

**2. Copy `access_token` from response**

**3. Register New Superadmin**
```bash
curl -X POST http://localhost:3000/auth/register-superadmin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "email": "newsuperadmin@erp-system.com",
    "password": "SecurePassword123!",
    "firstName": "New",
    "lastName": "Superadmin"
  }'
```

**Expected:** Success (201)

**4. Test with Regular Superadmin (Should Fail)**
```bash
# Login as regular superadmin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@erp-system.com",
    "password": "SuperAdmin123!"
  }'

# Try to register (use token from above)
curl -X POST http://localhost:3000/auth/register-superadmin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer REGULAR_SUPERADMIN_TOKEN" \
  -d '{
    "email": "another@erp-system.com",
    "password": "Password123!",
    "firstName": "Another",
    "lastName": "Admin"
  }'
```

**Expected:** Error 403 - "Only Master Superadmin can perform this action"

## 📊 Role Hierarchy

```
master-superadmin (Role)
    ↓ can create
superadmin (Role)
    ↓ manages
Companies & Users
```

## 🎯 Best Practices

1. **Limit Master Superadmin**
   - Keep ONLY 1 Master Superadmin in production
   - Secure the credentials properly
   - Use 2FA if available

2. **Regular Superadmins**
   - Create multiple for redundancy
   - Give to trusted team members
   - Each has their own credentials

3. **Password Requirements**
   - Minimum 8 characters
   - Include uppercase, lowercase, numbers, and symbols
   - Change periodically

4. **Monitoring**
   - Log all superadmin registrations
   - Set up alerts for new registrations
   - Regular access review

## 🔧 Implementation Details

**Files Modified/Created:**
- `prisma/seed.ts` - Added master-superadmin role
- `src/auth/dto/register-superadmin.dto.ts` - New DTO
- `src/auth/decorators/master-superadmin.decorator.ts` - New decorator
- `src/auth/guards/master-superadmin.guard.ts` - New guard
- `src/auth/auth.service.ts` - Added registerSuperadmin method
- `src/auth/auth.controller.ts` - Added endpoint
- `src/auth/auth.module.ts` - Registered guard

**Database Schema:**
```typescript
Role {
  name: 'master-superadmin' | 'superadmin' | 'admin' | 'manager' | 'staff'
  permissions: ['all', 'superadmin.register'] // for master
}

User {
  roleId: string  // Link to Role
  companyId: null // Superadmins have no company
}
```

## 📞 Support

Untuk dokumentasi lengkap, lihat:
- `SUPERADMIN_README.md` - Full superadmin documentation
- `AUTHENTICATION_GUIDE.md` - Authentication details
- `AUTH_IMPLEMENTATION_SUMMARY.md` - Technical implementation
