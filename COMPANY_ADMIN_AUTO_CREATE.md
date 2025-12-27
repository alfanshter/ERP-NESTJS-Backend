# Auto-Create Admin User on Company Creation

## Overview
When creating a new company, the system automatically creates an admin user for that company. This ensures every company has an admin account ready to use immediately.

## Features

### 1. Default Password
- **Default Password:** `admin123`
- Simple and easy to remember for initial setup
- Should be changed by admin after first login (recommended)

### 2. Auto-Generated Fields
When you create a company with minimal information:
```json
{
  "name": "PT Example Company",
  "email": "admin@example.com",
  "phone": "+628123456789",
  "address": "Jakarta",
  "regionId": "31.71"
}
```

The system automatically creates:
- **Admin User** with email from company
- **Default Password:** `admin123`
- **Role:** `admin` (Company Administrator)
- **Name:** Generated from company name
  - firstName: "Admin"
  - lastName: Company name (e.g., "PT Example Company")

### 3. Custom Admin Details (Optional)
You can customize admin user details during company creation:

```json
{
  "name": "PT Example Company",
  "email": "admin@example.com",
  "phone": "+628123456789",
  "address": "Jakarta",
  "regionId": "31.71",
  "adminPassword": "MySecurePass123!",
  "adminFirstName": "John",
  "adminLastName": "Doe"
}
```

**Optional Fields:**
- `adminPassword` - Custom password (min 8 characters)
- `adminFirstName` - Admin's first name
- `adminLastName` - Admin's last name

## API Response

### Successful Company Creation
```json
{
  "id": "uuid",
  "name": "PT Test Default Password",
  "email": "admin@testdefault.com",
  "phone": "+6281234567890",
  "status": "ACTIVE",
  "region": {
    "id": "31.71",
    "name": "Kota Administrasi Jakarta Pusat",
    "parent": {
      "id": "31",
      "name": "Daerah Khusus Ibukota Jakarta"
    }
  },
  "users": [
    {
      "id": "uuid",
      "email": "admin@testdefault.com",
      "firstName": "Admin",
      "lastName": "PT Test Default Password",
      "role": {
        "name": "admin",
        "description": "Company Administrator - Full company access"
      }
    }
  ],
  "adminCreated": {
    "id": "uuid",
    "email": "admin@testdefault.com",
    "firstName": "Admin",
    "lastName": "PT Test Default Password",
    "role": "admin",
    "temporaryPassword": "admin123"
  }
}
```

**Key Points:**
- `adminCreated` object contains the created admin user details
- `temporaryPassword` shows the password (either default `admin123` or custom if provided)
- Admin user is immediately active and can login

## Usage Examples

### Example 1: Create Company with Default Admin
**Request:**
```bash
POST /superadmin/companies
Authorization: Bearer <superadmin_token>

{
  "name": "PT New Business",
  "email": "admin@newbusiness.com",
  "phone": "+6281234567890",
  "address": "Jakarta",
  "regionId": "31.71"
}
```

**Result:**
- Company created
- Admin user: `admin@newbusiness.com`
- Password: `admin123` (default)
- Name: "Admin PT New Business"

### Example 2: Create Company with Custom Admin
**Request:**
```bash
POST /superadmin/companies
Authorization: Bearer <superadmin_token>

{
  "name": "PT Custom Admin",
  "email": "admin@customadmin.com",
  "phone": "+6281234567890",
  "address": "Jakarta",
  "regionId": "31.71",
  "adminPassword": "SecurePass123!",
  "adminFirstName": "Budi",
  "adminLastName": "Santoso"
}
```

**Result:**
- Company created
- Admin user: `admin@customadmin.com`
- Password: `SecurePass123!` (custom)
- Name: "Budi Santoso"

### Example 3: Login as Company Admin
After company creation, the admin can immediately login:

**Request:**
```bash
POST /auth/login

{
  "email": "admin@testdefault.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "firstName": "Admin",
    "lastName": "PT Test Default Password",
    "email": "admin@testdefault.com",
    "role": "admin",
    "company": "PT Test Default Password",
    "isSuperAdmin": false,
    "isSuperAdminMaster": false
  }
}
```

## Security Considerations

### 1. Password Security
- Default password `admin123` is simple for initial setup
- **Recommended:** Change password after first login
- Custom passwords must be minimum 8 characters

### 2. Email Validation
- Email must be unique across all users
- Cannot create company if email already exists
- Email is used as username for login

### 3. Transaction Safety
Company and admin user creation uses database transaction:
- If admin creation fails, company is not created
- If company creation fails, admin is not created
- Ensures data consistency

### 4. Role Assignment
- Admin user automatically gets `admin` role
- Admin role has full company access:
  - `company.all` - All company operations
  - `employee.all` - Manage employees
  - `project.all` - Manage projects
  - `finance.all` - Manage finance

## Implementation Details

### Code Location
File: `src/superadmin/companies/companies.service.ts`

### Key Methods

**1. getDefaultPassword()**
```typescript
private getDefaultPassword(): string {
  return 'admin123';
}
```

**2. create() with Transaction**
```typescript
async create(createCompanyDto: CreateCompanyDto) {
  // Use default password if not provided
  const plainPassword = 
    createCompanyDto.adminPassword || this.getDefaultPassword();
  
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  
  // Create company and admin in transaction
  const result = await this.prisma.$transaction(async (tx) => {
    // 1. Create company
    const company = await tx.company.create({ ... });
    
    // 2. Create admin user
    const adminUser = await tx.user.create({
      data: {
        email: createCompanyDto.email,
        password: hashedPassword,
        firstName: adminFirstName || 'Admin',
        lastName: adminLastName || createCompanyDto.name,
        roleId: adminRole.id,
        companyId: company.id,
        isActive: true,
      }
    });
    
    return { company, adminUser, plainPassword };
  });
  
  // Return response with admin credentials
  return {
    ...company,
    adminCreated: {
      id: result.adminUser.id,
      email: result.adminUser.email,
      firstName: result.adminUser.firstName,
      lastName: result.adminUser.lastName,
      role: 'admin',
      temporaryPassword: result.plainPassword,
    }
  };
}
```

## Best Practices

### For Superadmin (Creating Company)
1. ✅ Use company email for admin account
2. ✅ Inform company admin about their credentials
3. ✅ Recommend changing password after first login
4. ✅ Use custom password for better security
5. ✅ Provide admin's real name when known

### For Company Admin (First Login)
1. ✅ Login with provided email and password
2. ✅ Change password immediately (recommended)
3. ✅ Update profile with correct personal information
4. ✅ Set up company details (logo, website, etc.)
5. ✅ Start adding employees

## Testing Results ✅

### Test 1: Default Password
**Input:**
```json
{
  "name": "PT Test Default Password",
  "email": "admin@testdefault.com",
  "phone": "+6281234567890",
  "address": "Jakarta",
  "regionId": "31.71"
}
```

**Output:**
- ✅ Company created successfully
- ✅ Admin user created with email: `admin@testdefault.com`
- ✅ Password: `admin123` (default)
- ✅ Login successful with default credentials

### Test 2: Custom Password
**Input:**
```json
{
  "name": "PT New Company Auto Admin",
  "email": "admin@newcompany.com",
  "adminPassword": "CustomPass123!",
  "adminFirstName": "John",
  "adminLastName": "Doe"
}
```

**Output:**
- ✅ Company created successfully
- ✅ Admin user created with custom details
- ✅ Password: `CustomPass123!` (custom)
- ✅ Name: "John Doe"
- ✅ Login successful with custom credentials

## Summary

| Feature | Status | Details |
|---------|--------|---------|
| Auto-create admin | ✅ Implemented | Automatic on company creation |
| Default password | ✅ `admin123` | Simple and memorable |
| Custom password | ✅ Supported | Min 8 characters |
| Custom admin name | ✅ Supported | Optional fields |
| Email validation | ✅ Working | Must be unique |
| Transaction safety | ✅ Working | All-or-nothing creation |
| Immediate login | ✅ Working | Admin can login right away |

**Status:** Production-ready! 🚀

**Recommendation:** Consider adding email notification to send credentials to company admin automatically.
