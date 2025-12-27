# 🎯 Employee Login System - Implementation Guide

## 📋 Overview

Sistem Employee Login memungkinkan karyawan (Employee) untuk memiliki akses login ke sistem ERP. Implementasi ini menggunakan arsitektur **Employee ↔ User relation** yang flexible dan secure.

## 🏗️ Architecture

### Model Relationship

```
Employee (Data Master Kepegawaian)
    ↓ (optional one-to-one)
User (Login Credential)
```

### Key Concepts

1. **Employee** = Data kepegawaian lengkap (gaji, posisi, department, join date, dll)
2. **User** = Akun login sistem (email, password, role, permissions)
3. **Relationship** = Optional - tidak semua employee perlu login access

### Benefits

✅ **Separation of Concerns**
- HR data terpisah dari authentication data
- Mudah maintain dan scale

✅ **Flexibility**
- Satpam/cleaning service gak perlu login? Don't grant access
- Staff marketing butuh login? Grant access dengan role "staff" atau "marketing"

✅ **Security**
- Password hanya di tabel User
- Bisa revoke access tanpa hapus data employee
- Audit trail jelas (siapa login, siapa cuma data employee)

✅ **Scalability**
- Bisa assign different roles ke setiap employee
- Support RBAC (Role-Based Access Control)

## 🔄 How It Works

### Flow Diagram

```
1. CREATE EMPLOYEE
   ↓
   Employee created with NO login access
   (employeeId, name, email, position, salary, etc)
   
2. GRANT ACCESS (Optional)
   ↓
   POST /company/employees/:id/grant-access
   { password, roleId }
   ↓
   Creates User account → Links to Employee
   
3. LOGIN
   ↓
   POST /auth/login
   { email, password }
   ↓
   Returns: access_token + employee data
   
4. REVOKE ACCESS (Optional)
   ↓
   DELETE /company/employees/:id/revoke-access
   ↓
   Deletes User account → Employee remains
```

## 🛠️ Implementation Details

### 1. Database Schema

```prisma
model Employee {
  id           String    @id @default(uuid())
  employeeCode String    @unique
  firstName    String
  lastName     String
  email        String    @unique
  position     String?
  department   String?
  salary       Float?
  
  // 🔗 Optional relation to User
  userId       String?   @unique
  user         User?     @relation(fields: [userId], references: [id])
  
  companyId    String
  company      Company   @relation(...)
  roleId       String    // Default role for employee (e.g., "staff")
  role         Role      @relation(...)
}

model User {
  id          String    @id @default(uuid())
  email       String    @unique
  password    String    // 🔒 Hashed with bcrypt
  isActive    Boolean   @default(true)
  
  // 🔗 Back relation to Employee
  employee    Employee?
  
  roleId      String
  role        Role      @relation(...)
  companyId   String?
  company     Company?  @relation(...)
}
```

### 2. API Endpoints

#### A. Create Employee (Company Admin/Manager)

```http
POST /company/employees
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "employeeCode": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "081234567890",
  "position": "Marketing Manager",
  "department": "Marketing",
  "salary": 10000000
}
```

**Response:**
```json
{
  "id": "uuid-employee",
  "employeeCode": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "position": "Marketing Manager",
  "department": "Marketing",
  "userId": null,  // ← No login access yet
  "hasAccess": false
}
```

#### B. Grant Login Access

```http
POST /company/employees/:employeeId/grant-access
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "password": "Employee123!",
  "roleId": "uuid-of-staff-role"
}
```

**Response:**
```json
{
  "message": "Login access granted successfully",
  "employee": {
    "id": "uuid-employee",
    "employeeCode": "EMP001",
    "name": "John Doe",
    "email": "john.doe@company.com",
    "hasAccess": true
  }
}
```

**What happens:**
1. ✅ Validates employee exists
2. ✅ Checks employee doesn't already have access
3. ✅ Validates email not used by another user
4. ✅ Validates role exists and not superadmin
5. ✅ Hashes password
6. ✅ Creates User account
7. ✅ Links User ↔ Employee

#### C. Employee Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john.doe@company.com",
  "password": "Employee123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-user",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "role": "staff",
    "company": "PT Example Company",
    "employeeCode": "EMP001",      // ← Employee data
    "position": "Marketing Manager", // ← Employee data
    "department": "Marketing",       // ← Employee data
    "isSuperAdmin": false,
    "isSuperAdminMaster": false
  }
}
```

**JWT Payload includes:**
```json
{
  "sub": "user-id",
  "email": "john.doe@company.com",
  "roleId": "role-id",
  "companyId": "company-id",
  "employeeId": "employee-id",  // ← New!
  "isSuperAdmin": false,
  "isSuperAdminMaster": false
}
```

#### D. Get Profile

```http
GET /auth/profile
Authorization: Bearer <employee_token>
```

**Response includes employee data:**
```json
{
  "id": "uuid-user",
  "email": "john.doe@company.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": {
    "id": "role-id",
    "name": "staff"
  },
  "company": {
    "id": "company-id",
    "name": "PT Example Company"
  },
  "employee": {                    // ← Employee data
    "id": "employee-id",
    "employeeCode": "EMP001",
    "position": "Marketing Manager",
    "department": "Marketing",
    "salary": 10000000,
    "joinDate": "2024-01-15T00:00:00.000Z"
  }
}
```

#### E. Revoke Login Access

```http
DELETE /company/employees/:employeeId/revoke-access
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "Login access revoked successfully",
  "employee": {
    "id": "uuid-employee",
    "employeeCode": "EMP001",
    "name": "John Doe",
    "email": "john.doe@company.com",
    "hasAccess": false
  }
}
```

**What happens:**
1. ✅ Validates employee exists
2. ✅ Checks employee has login access
3. ✅ Deletes User account
4. ✅ Employee.userId automatically set to null (database constraint)
5. ✅ Employee data remains intact

## 🔐 Security Features

### Password Requirements

- Minimum 8 characters
- Must contain:
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (@$!%*?&)

### Access Control

- ❌ Cannot grant `superadmin-master` or `superadmin-staff` roles to employees
- ✅ Can grant: `staff`, `manager`, `admin` (company-level)
- ✅ Only company admin/manager can grant/revoke access
- ✅ Employee email must be unique across all users

### Authentication

- ✅ JWT token with 7 days expiry
- ✅ Token includes employee ID for quick lookups
- ✅ Last login tracked automatically
- ✅ Account can be deactivated (User.isActive = false)

## 📊 Use Cases

### Use Case 1: Marketing Staff Login

```bash
# 1. Create employee
POST /company/employees
{ employeeCode: "MKT001", email: "sarah@company.com", department: "Marketing" }

# 2. Grant access
POST /company/employees/:id/grant-access
{ password: "Sarah123!", roleId: "<staff-role-id>" }

# 3. Sarah can now login
POST /auth/login
{ email: "sarah@company.com", password: "Sarah123!" }

# 4. Sarah accesses marketing features
GET /company/customers (with token)
POST /company/leads (with token)
```

### Use Case 2: Warehouse Staff (No Login Needed)

```bash
# 1. Create employee
POST /company/employees
{ employeeCode: "WH001", email: "warehouse@company.com", department: "Warehouse" }

# 2. Don't grant access - employee stays as data only
# Warehouse staff managed manually, no system access needed
```

### Use Case 3: Project Manager Login

```bash
# 1. Create employee
POST /company/employees
{ employeeCode: "PM001", email: "manager@company.com", position: "Project Manager" }

# 2. Grant access with manager role
POST /company/employees/:id/grant-access  
{ password: "Manager123!", roleId: "<manager-role-id>" }

# 3. Manager can login and manage projects
POST /auth/login
{ email: "manager@company.com", password: "Manager123!" }

# 4. Manager assigns tasks to employees
POST /projects/:id/tasks
{ assigneeId: "<employee-id>", ... }
```

### Use Case 4: Employee Termination

```bash
# 1. Revoke login access
DELETE /company/employees/:id/revoke-access

# 2. Update employee status
PATCH /company/employees/:id
{ status: "TERMINATED" }

# Employee cannot login anymore, but HR data preserved for records
```

## 🧪 Testing

### Manual Testing Script

```bash
./test-employee-login.sh
```

This script will:
1. ✅ Login as superadmin
2. ✅ Create company
3. ✅ Create company admin
4. ✅ Create employee (without access)
5. ✅ Try login (should fail)
6. ✅ Grant access to employee
7. ✅ Login as employee (should success)
8. ✅ Get employee profile
9. ✅ Revoke access
10. ✅ Try login again (should fail)

### cURL Examples

```bash
# Create Employee
curl -X POST http://localhost:3000/company/employees \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeCode": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@company.com",
    "position": "Staff",
    "department": "IT"
  }'

# Grant Access
curl -X POST http://localhost:3000/company/employees/<employee_id>/grant-access \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "Employee123!",
    "roleId": "<role_id>"
  }'

# Login as Employee
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@company.com",
    "password": "Employee123!"
  }'

# Revoke Access
curl -X DELETE http://localhost:3000/company/employees/<employee_id>/revoke-access \
  -H "Authorization: Bearer <admin_token>"
```

## 📝 Migration Log

### Migration: `20251227112457_add_employee_user_relation`

**Changes:**
- Added `Employee.userId` (String?, unique)
- Added `Employee.email` unique constraint
- Added `Employee → User` foreign key relation
- Added index on `Employee.userId`

**Impact:**
- ✅ No breaking changes
- ✅ Existing employees can be granted access later
- ✅ Existing users unchanged

## 🎯 Best Practices

### When to Grant Access

✅ **Grant access for:**
- Office staff (admin, marketing, sales, finance)
- Managers and team leads
- Remote workers
- Anyone who needs to input/view data

❌ **Don't grant access for:**
- Security guards
- Cleaning service
- Drivers (unless using delivery app)
- Factory floor workers (unless needed)

### Role Assignment

- **Staff** → Basic access, can view assigned tasks
- **Manager** → Can create/assign tasks, view team data
- **Admin** → Full company access, manage employees
- **Superadmin** → System-wide access (never assign to employees)

### Password Management

- ✅ Use strong passwords
- ✅ Reset password flow (TODO: implement)
- ✅ Expire old passwords periodically
- ✅ Force password change on first login (TODO: implement)

## 🔮 Future Enhancements

### Planned Features

1. **Password Reset Flow**
   - Forgot password endpoint
   - Email verification
   - Reset token expiry

2. **Employee Self-Service**
   - Update own profile
   - Change password
   - View payslips

3. **Advanced RBAC**
   - Custom permissions per employee
   - Department-based access
   - Resource-level permissions

4. **Audit Logging**
   - Track who granted/revoked access
   - Login history per employee
   - Failed login attempts

5. **Bulk Operations**
   - Grant access to multiple employees
   - Import employees from CSV with access
   - Bulk role assignment

## 📚 Related Documentation

- [Authentication Guide](./AUTHENTICATION_GUIDE.md)
- [Staff Management Workflow](./STAFF_MANAGEMENT_WORKFLOW.md)
- [Superadmin Hierarchy](./SUPERADMIN_HIERARCHY.md)

## 🆘 Troubleshooting

### Employee cannot login

**Check:**
1. Has employee been granted access? (`Employee.userId` should not be null)
2. Is User account active? (`User.isActive = true`)
3. Is password correct? (case-sensitive)
4. Is email exactly the same?

**Solution:**
```bash
# Check employee access
GET /company/employees/:id

# Grant access if needed
POST /company/employees/:id/grant-access
```

### Error: "Email already used"

**Cause:** Another user account exists with this email

**Solution:**
- Use different email for employee
- Or delete/deactivate the existing user first

### Error: "Cannot grant superadmin roles"

**Cause:** Trying to assign `superadmin-master` or `superadmin-staff` role

**Solution:**
- Use `staff`, `manager`, or `admin` role instead
- Superadmin roles are for system administrators only

---

## ✅ Summary

Employee Login System berhasil diimplementasikan dengan arsitektur yang:
- ✅ **Flexible** - tidak semua employee perlu login
- ✅ **Secure** - password terenkripsi, role-based access
- ✅ **Maintainable** - separation of concerns (HR vs Auth)
- ✅ **Scalable** - support ribuan employees dengan role berbeda

**Happy coding! 🚀**
