# Superadmin Role Hierarchy Documentation

## Overview
Sistem ERP ini mengimplementasikan role hierarchy untuk superadmin dengan 2 level:
1. **Superadmin Master** - Full control termasuk manage staff
2. **Superadmin Staff** - Full system access tapi tidak bisa manage akun

## Role Structure

### 1. Superadmin-Master
**Role Name:** `superadmin-master`

**Capabilities:**
- ✅ Full system access
- ✅ Create/manage superadmin-staff accounts
- ✅ Manage companies
- ✅ Manage pricing plans
- ✅ Manage subscriptions
- ✅ Access all endpoints
- ✅ View all statistics

**Permissions:**
```json
["all", "superadmin.create", "superadmin.manage"]
```

**How to Create:**
- First superadmin-master created via `/auth/register-superadmin` dengan master key
- Requires `MASTER_SUPER_ADMIN_KEY_2024` (dari .env)

### 2. Superadmin-Staff
**Role Name:** `superadmin-staff`

**Capabilities:**
- ✅ Full system access
- ✅ Manage companies
- ✅ Manage pricing plans  
- ✅ Manage subscriptions
- ❌ **Cannot** create superadmin accounts
- ❌ **Cannot** manage other superadmin staff

**Permissions:**
```json
["all", "companies.all", "plans.all", "subscriptions.all"]
```

**How to Create:**
- Only superadmin-master can create staff
- Via endpoint `/superadmin/staff` (POST)

## Getting Started

### Step 1: Create First Superadmin Master

**Endpoint:** `POST /auth/register-superadmin`

**Request:**
```json
{
  "email": "master@erp.com",
  "password": "MasterAdmin123!",
  "firstName": "Master",
  "lastName": "Admin",
  "masterKey": "MASTER_SUPER_ADMIN_KEY_2024"
}
```

**Response:**
```json
{
  "message": "Superadmin master registered successfully",
  "user": {
    "id": "uuid",
    "email": "master@erp.com",
    "firstName": "Master",
    "lastName": "Admin",
    "role": {
      "name": "superadmin-master"
    }
  }
}
```

### Step 2: Login as Superadmin Master

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "master@erp.com",
  "password": "MasterAdmin123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "uuid",
    "email": "master@erp.com",
    "role": "superadmin-master",
    "isSuperAdmin": true,
    "isSuperAdminMaster": true
  }
}
```

### Step 3: Create Superadmin Staff (as Master)

**Endpoint:** `POST /superadmin/staff`

**Headers:**
```
Authorization: Bearer {master_token}
```

**Request:**
```json
{
  "email": "staff1@erp.com",
  "password": "Staff123!",
  "firstName": "Staff",
  "lastName": "One",
  "phone": "+628123456789"
}
```

**Response:**
```json
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
```

## API Endpoints

### Staff Management (Master Only)

All endpoints require `superadmin-master` role:

#### 1. Create Staff
```
POST /superadmin/staff
```

#### 2. List All Staff
```
GET /superadmin/staff?page=1&limit=10&search=staff
```

#### 3. Get Staff Stats
```
GET /superadmin/staff/stats
```

Response:
```json
{
  "totalStaff": 5,
  "totalMaster": 1,
  "activeStaff": 4,
  "inactiveStaff": 1
}
```

#### 4. Get Staff by ID
```
GET /superadmin/staff/:id
```

#### 5. Update Staff
```
PATCH /superadmin/staff/:id
```

Request:
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "phone": "+628987654321",
  "isActive": true
}
```

#### 6. Delete Staff
```
DELETE /superadmin/staff/:id
```

**Note:** Cannot delete superadmin-master accounts

## Access Control

### Guard Implementation

**SuperadminMasterGuard:**
```typescript
@Controller('superadmin/staff')
@UseGuards(JwtAuthGuard, SuperadminMasterGuard)
@SuperadminMaster()
export class StaffController {
  // Only accessible by superadmin-master
}
```

### Decorator Usage

```typescript
import { SuperadminMaster } from './auth/decorators/superadmin-master.decorator';

@SuperadminMaster()
create() {
  // Only superadmin-master can access
}
```

## Role Comparison

| Feature | Superadmin Master | Superadmin Staff |
|---------|-------------------|------------------|
| Manage Companies | ✅ | ✅ |
| Manage Pricing Plans | ✅ | ✅ |
| Manage Subscriptions | ✅ | ✅ |
| View Statistics | ✅ | ✅ |
| **Create Staff Accounts** | ✅ | ❌ |
| **Update Staff Accounts** | ✅ | ❌ |
| **Delete Staff Accounts** | ✅ | ❌ |
| **Manage Master Account** | ✅ (self) | ❌ |

## Security Features

### 1. Master Key Protection
- First master registration requires `MASTER_SUPER_ADMIN_KEY_2024`
- Key should be stored securely in `.env`
- Change key in production

### 2. Role-Based Access Control
- Guards prevent unauthorized access
- Staff cannot access master-only endpoints
- Cannot escalate privileges

### 3. Account Protection
- Cannot update/delete master accounts
- Staff can only be managed by master
- Soft delete available via `isActive` flag

## Database Schema

### Role Table
```sql
Role {
  id: uuid
  name: "superadmin-master" | "superadmin-staff"
  description: string
  permissions: json
  isSystem: true
}
```

### User Table
```sql
User {
  id: uuid
  email: string
  password: string (hashed)
  firstName: string
  lastName: string
  phone: string?
  avatar: string?
  isActive: boolean
  roleId: uuid (FK)
  companyId: null (for superadmin)
}
```

## Seeding

Run seeder to create roles:

```bash
pnpm run seed
```

This creates:
- `superadmin-master` role
- `superadmin-staff` role
- Other system roles (admin, manager, staff)

## Testing with Postman

### Import Collection
File: `ERP-System-API.postman_collection.json`

### Workflow
1. **Register Master**
   - Use "3. Register Superadmin Master" request
   - Update masterKey if needed

2. **Login**
   - Use "1. Login" request
   - Token auto-saved to collection variable

3. **Create Staff**
   - Navigate to "Superadmin - Staff Management"
   - Use "1. Create Superadmin Staff" request

4. **Test Access**
   - Login as staff
   - Try accessing staff management (should fail)
   - Try accessing companies (should work)

## Error Handling

### Common Errors

**403 Forbidden - Not Master:**
```json
{
  "statusCode": 403,
  "message": "Access denied. This action requires superadmin-master privilege.",
  "error": "Forbidden"
}
```

**400 Bad Request - Cannot Delete Master:**
```json
{
  "statusCode": 400,
  "message": "Cannot delete superadmin-master account",
  "error": "Bad Request"
}
```

**404 Not Found - Role Missing:**
```json
{
  "statusCode": 404,
  "message": "Superadmin-staff role not found. Please run seeder.",
  "error": "Not Found"
}
```

## Best Practices

### 1. Initial Setup
- Create only ONE master account
- Create staff accounts as needed
- Use strong passwords

### 2. Production
- Change master key in production
- Use environment variables
- Enable 2FA if available

### 3. Staff Management
- Assign descriptive names
- Use company email domains
- Regular audit of active accounts

### 4. Security
- Rotate passwords regularly
- Monitor master account usage
- Log all staff management actions

## Migration Guide

### From Old System (single superadmin)

If you have existing `superadmin` role:

1. **Update existing superadmin to master:**
```sql
UPDATE "User" 
SET "roleId" = (SELECT id FROM "Role" WHERE name = 'superadmin-master')
WHERE "roleId" = (SELECT id FROM "Role" WHERE name = 'superadmin');
```

2. **Run seeder to create new roles**

3. **Create staff accounts via API**

## Troubleshooting

### Issue: Cannot create staff
**Solution:** Ensure you're logged in as superadmin-master

### Issue: Role not found
**Solution:** Run `pnpm run seed` to create roles

### Issue: Token invalid
**Solution:** Login again to get fresh token

### Issue: Cannot access endpoints
**Solution:** Check role in token payload

## Summary

✅ **Implemented:**
- Superadmin Master role
- Superadmin Staff role
- CRUD for staff management
- Access control guards
- Postman collection updated

✅ **Features:**
- Role hierarchy
- Protected endpoints
- Staff cannot create accounts
- Master full control

✅ **Security:**
- Master key protection
- Role-based access
- Account protection
- Audit logging ready
