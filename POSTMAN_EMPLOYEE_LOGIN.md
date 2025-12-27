# 📮 Postman Collection Update - Employee Login

## ✅ What's New

### 🆕 New Collection Variables

```json
{
  "employee_id": "",           // Auto-saved when creating employee
  "employee_token": "",        // Auto-saved when employee logs in
  "staff_role_id": "",        // Role ID for staff role
  "company_admin_token": ""   // Company admin token
}
```

### 🆕 New Endpoints (3)

#### 1. **Grant Login Access**
```
POST /company/employees/:id/grant-access
```
**Purpose:** Give login capability to an employee

**Request:**
```json
{
  "password": "Employee123!",
  "roleId": "{{staff_role_id}}"
}
```

**Response:**
```json
{
  "message": "Login access granted successfully",
  "employee": {
    "id": "uuid",
    "employeeCode": "EMP001",
    "name": "John Doe",
    "email": "john.doe@company.com",
    "hasAccess": true
  }
}
```

#### 2. **Revoke Login Access**
```
DELETE /company/employees/:id/revoke-access
```
**Purpose:** Remove login capability from an employee

**Response:**
```json
{
  "message": "Login access revoked successfully",
  "employee": {
    "id": "uuid",
    "employeeCode": "EMP001",
    "name": "John Doe",
    "email": "john.doe@company.com",
    "hasAccess": false
  }
}
```

#### 3. **Login as Employee**
```
POST /auth/login
```
**Purpose:** Login using employee credentials

**Request:**
```json
{
  "email": "john.doe@company.com",
  "password": "Employee123!"
}
```

**Response:**
```json
{
  "access_token": "jwt-token...",
  "user": {
    "id": "user-id",
    "email": "john.doe@company.com",
    "role": "staff",
    "company": "PT Example Company",
    "employeeCode": "EMP001",      // ← Employee data
    "position": "Marketing Manager",
    "department": "Marketing",
    "isSuperAdmin": false
  }
}
```

### 📝 Updated Endpoints

#### **Create Employee**
Now includes:
- ✅ Auto-save `employee_id` to collection variable
- ✅ Updated description mentioning no login access by default
- ✅ Console log shows if employee has login access

**Test Script:**
```javascript
if (pm.response.code === 201 || pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("employee_id", jsonData.id);
    pm.collectionVariables.set("employee_id", jsonData.id);
    
    console.log('✅ Employee created successfully');
    console.log('Employee ID:', jsonData.id);
    console.log('Employee Code:', jsonData.employeeCode);
    console.log('Has Login Access:', jsonData.userId ? 'Yes' : 'No');
}
```

#### **Updated Folder Description**
```
Company - Employees

Features:
- Create, read, update, delete employees
- Grant/revoke login access to employees  ← NEW!
- Employee statistics
- Search and filter employees
- Employee login with full authentication  ← NEW!

Login Access Flow:
1. Create Employee (no login access)
2. Grant Access (creates User account linked to Employee)
3. Employee can login with email/password
4. (Optional) Revoke Access (deletes User, keeps Employee data)
```

## 🎯 Testing Flow

### Complete Test Sequence

```
1. Login as Superadmin
   POST /auth/login
   ↓ Save token to {{token}}

2. Create Company
   POST /superadmin/companies
   ↓ Save company_id

3. Create Company Admin
   POST /auth/register
   ↓ First user becomes admin automatically

4. Login as Company Admin
   POST /auth/login
   ↓ Save token to {{company_admin_token}}

5. Create Employee
   POST /company/employees
   ↓ Auto-save {{employee_id}}
   ↓ employee.userId = null (no login access)

6. Try Login as Employee (SHOULD FAIL)
   POST /auth/login
   ↓ Error: Invalid credentials

7. Grant Login Access
   POST /company/employees/{{employee_id}}/grant-access
   ↓ Creates User account
   ↓ Links User ↔ Employee

8. Login as Employee (SHOULD SUCCESS)
   POST /auth/login
   ↓ Auto-save {{employee_token}}
   ↓ Response includes employee data

9. Get Employee Profile
   GET /auth/profile
   ↓ Uses {{employee_token}}
   ↓ Shows employee details

10. Revoke Login Access
    DELETE /company/employees/{{employee_id}}/revoke-access
    ↓ Deletes User account
    ↓ Employee data remains

11. Try Login Again (SHOULD FAIL)
    POST /auth/login
    ↓ Error: Invalid credentials
```

## 📋 Environment Variables Setup

### Required Variables

```json
{
  "base_url": "http://localhost:3000",
  "token": "",
  "master_email": "master@erp.com",
  "master_password": "MasterAdmin123!",
  "employee_id": "",
  "employee_token": "",
  "staff_role_id": "",
  "company_admin_token": ""
}
```

### Get Staff Role ID

Run this in PostgreSQL or use Prisma Studio:

```sql
SELECT id FROM "Role" WHERE name = 'staff';
```

Then set the value in Postman:
```
staff_role_id = <uuid-from-query>
```

## 🎨 Request Examples

### 1. Create Employee (No Login Access)

```bash
POST /company/employees
Authorization: Bearer {{company_admin_token}}

{
  "employeeCode": "MKT001",
  "firstName": "Sarah",
  "lastName": "Marketing",
  "email": "sarah@company.com",
  "position": "Marketing Manager",
  "department": "Marketing",
  "salary": 12000000
}
```

### 2. Grant Access with Staff Role

```bash
POST /company/employees/{{employee_id}}/grant-access
Authorization: Bearer {{company_admin_token}}

{
  "password": "Sarah123!@#",
  "roleId": "{{staff_role_id}}"
}
```

### 3. Employee Login

```bash
POST /auth/login

{
  "email": "sarah@company.com",
  "password": "Sarah123!@#"
}
```

### 4. Access Protected Resource as Employee

```bash
GET /auth/profile
Authorization: Bearer {{employee_token}}
```

### 5. Revoke Access

```bash
DELETE /company/employees/{{employee_id}}/revoke-access
Authorization: Bearer {{company_admin_token}}
```

## 🔍 Response Examples

### Grant Access Response

```json
{
  "message": "Login access granted successfully",
  "employee": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "employeeCode": "MKT001",
    "name": "Sarah Marketing",
    "email": "sarah@company.com",
    "hasAccess": true
  }
}
```

### Employee Login Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "firstName": "Sarah",
    "lastName": "Marketing",
    "email": "sarah@company.com",
    "role": "staff",
    "company": "PT Example Company",
    "employeeCode": "MKT001",
    "position": "Marketing Manager",
    "department": "Marketing",
    "isSuperAdmin": false,
    "isSuperAdminMaster": false
  }
}
```

### Revoke Access Response

```json
{
  "message": "Login access revoked successfully",
  "employee": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "employeeCode": "MKT001",
    "name": "Sarah Marketing",
    "email": "sarah@company.com",
    "hasAccess": false
  }
}
```

## 🚨 Common Errors

### Error: "Employee already has login access"

```json
{
  "statusCode": 409,
  "message": "Employee already has login access",
  "error": "Conflict"
}
```

**Solution:** Employee sudah punya User account. Skip grant-access atau revoke dulu.

### Error: "Email already used by another user"

```json
{
  "statusCode": 409,
  "message": "This email is already used by another user account",
  "error": "Conflict"
}
```

**Solution:** Email sudah terpakai di User lain. Gunakan email berbeda atau hapus User yang lama.

### Error: "Cannot grant superadmin roles to employees"

```json
{
  "statusCode": 400,
  "message": "Cannot grant superadmin roles to employees",
  "error": "Bad Request"
}
```

**Solution:** Jangan pakai `superadmin-master` atau `superadmin-staff` role. Gunakan `staff`, `manager`, atau `admin`.

### Error: "Employee does not have login access"

```json
{
  "statusCode": 400,
  "message": "Employee does not have login access",
  "error": "Bad Request"
}
```

**Solution:** Employee belum di-grant access. Pakai endpoint grant-access dulu.

## 📚 Related Documentation

- [EMPLOYEE_LOGIN_GUIDE.md](./EMPLOYEE_LOGIN_GUIDE.md) - Complete implementation guide
- [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) - Authentication overview
- [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md) - General Postman usage

## ✅ Checklist

Untuk testing complete flow:

- [ ] Import updated Postman collection
- [ ] Set environment variables (base_url, staff_role_id)
- [ ] Run "Login as Superadmin"
- [ ] Run "Create Company"
- [ ] Run "Create Company Admin" (register)
- [ ] Run "Login as Company Admin"
- [ ] Run "Create Employee" → auto-save employee_id
- [ ] Run "Grant Login Access" → provide password & roleId
- [ ] Run "Login as Employee" → auto-save employee_token
- [ ] Run "Get Profile" → verify employee data included
- [ ] Run "Revoke Login Access"
- [ ] Try "Login as Employee" again → should fail

## 🎉 Summary

Postman collection sekarang fully support Employee Login flow dengan:

✅ 3 new endpoints (grant, revoke, employee login)  
✅ Auto-save variables (employee_id, employee_token)  
✅ Complete test scripts with console logs  
✅ Comprehensive documentation in each request  
✅ Error handling examples  
✅ Full testing flow coverage  

**Happy Testing! 🚀**
