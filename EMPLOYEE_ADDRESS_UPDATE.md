# Employee Address Fields Update

**Date:** December 27, 2025

## Overview

Employee model sekarang dilengkapi dengan field alamat yang terintegrasi dengan Region (wilayah Indonesia), sama seperti User dan Company.

## What's New

### Database Schema Changes

**New fields in Employee model:**
```typescript
{
  regionId: string;      // Region ID (e.g., "32.73" for Kota Bandung)
  address: string;       // Alamat detail (jalan, nomor, RT/RW)
  postalCode: string;    // Kode pos
}
```

**Migration:** `20251227053542_add_employee_address_fields`

### API Changes

#### 1. Create Employee (POST /company/employees)

**Before:**
```json
{
  "employeeCode": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "+628123456789",
  "position": "Software Engineer",
  "department": "IT",
  "joinDate": "2024-01-15",
  "salary": 15000000,
  "status": "ACTIVE"
}
```

**After (with address):**
```json
{
  "employeeCode": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "phone": "+628123456789",
  "position": "Software Engineer",
  "department": "IT",
  "joinDate": "2024-01-15T00:00:00.000Z",  // ISO DateTime format!
  "salary": 15000000,
  "status": "ACTIVE",
  "regionId": "32.73",                       // NEW: Region ID
  "address": "Jl. Braga No. 123, RT 01/RW 05", // NEW: Detail address
  "postalCode": "40111"                      // NEW: Postal code
}
```

**Response includes region data:**
```json
{
  "id": "uuid",
  "employeeCode": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com",
  "position": "Software Engineer",
  "department": "IT",
  "salary": 15000000,
  "status": "ACTIVE",
  "regionId": "32.73",
  "region": {
    "id": "32.73",
    "name": "Kota Bandung",
    "level": "CITY",
    "parentId": "32"
  },
  "address": "Jl. Braga No. 123, RT 01/RW 05",
  "postalCode": "40111",
  "userId": null,
  "companyId": "uuid",
  "role": { ... },
  "company": { ... }
}
```

#### 2. Update Employee (PATCH /company/employees/:id)

All address fields are now updatable:
```json
{
  "position": "Senior Software Engineer",
  "salary": 20000000,
  "regionId": "32.73",
  "address": "Jl. Asia Afrika No. 8",
  "postalCode": "40111"
}
```

#### 3. Get Employee(s)

All GET endpoints now include region data in response:
- GET /company/employees (list with pagination)
- GET /company/employees/:id (single employee)
- GET /company/employees/stats (statistics)

## How to Use Address Field

### Step 1: Get Region ID

Use Region endpoints to get regionId:

```bash
# 1. Get provinces
GET /regions/list/provinces
# Response: [{ "id": "32", "name": "Jawa Barat", "level": "PROVINCE" }, ...]

# 2. Get cities/regencies in province
GET /regions/children/32
# Response: [{ "id": "32.73", "name": "Kota Bandung", "level": "CITY" }, ...]

# 3. Get districts in city (optional)
GET /regions/children/32.73
# Response: [{ "id": "32.73.01", "name": "Bandung Kulon", "level": "DISTRICT" }, ...]

# 4. Get villages in district (optional)
GET /regions/children/32.73.01
# Response: [{ "id": "32.73.01.1001", "name": "Caringin", "level": "VILLAGE" }, ...]
```

### Step 2: Use Region ID in Employee

Save the selected region ID to `regionId` field:

```json
{
  "regionId": "32.73",              // Kota Bandung
  "address": "Jl. Braga No. 123",   // Detail address
  "postalCode": "40111"             // Postal code (optional)
}
```

### Step 3: Display in UI

Response includes full region data:

```json
{
  "region": {
    "id": "32.73",
    "name": "Kota Bandung",
    "level": "CITY",
    "parentId": "32"
  },
  "address": "Jl. Braga No. 123",
  "postalCode": "40111"
}
```

Display as: **"Jl. Braga No. 123, Kota Bandung, 40111"**

## Important Notes

### 1. joinDate Format Changed

**OLD (Wrong):**
```json
{ "joinDate": "2024-01-15" }  // ❌ ERROR: Invalid ISO-8601 DateTime
```

**NEW (Correct):**
```json
{ "joinDate": "2024-01-15T00:00:00.000Z" }  // ✅ ISO DateTime
```

Or omit it to use default (current date):
```json
{ } // joinDate will be set to now()
```

### 2. All Address Fields are Optional

You can create/update employee without address:
```json
{
  "employeeCode": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@company.com"
  // No address fields = OK
}
```

### 3. RegionId Validation

- Must be a valid region ID from database
- Can be Province, City, District, or Village level
- Use autocomplete/dropdown from `/regions` endpoints
- Invalid regionId will cause error

## Migration Details

**Migration file:** `prisma/migrations/20251227053542_add_employee_address_fields/migration.sql`

```sql
-- AlterTable
ALTER TABLE "Employee" 
ADD COLUMN "regionId" TEXT,
ADD COLUMN "address" TEXT,
ADD COLUMN "postalCode" TEXT;

-- CreateIndex
CREATE INDEX "Employee_regionId_idx" ON "Employee"("regionId");

-- AddForeignKey
ALTER TABLE "Employee" 
ADD CONSTRAINT "Employee_regionId_fkey" 
FOREIGN KEY ("regionId") REFERENCES "Region"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;
```

## Postman Collection Updates

**Updated requests:**
1. ✅ **1. Create Employee** - Added regionId, address, postalCode fields
2. ✅ **5. Update Employee** - Added address fields to example
3. ✅ **Folder description** - Added address documentation

**Example in Postman:**
- Create Employee now includes address fields with Kota Bandung example
- Update Employee shows how to update address
- All responses include region data

## Testing

### Test Create Employee with Address

```bash
curl -X POST http://localhost:3000/company/employees \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeCode": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "phone": "+628123456789",
    "position": "Software Engineer",
    "department": "IT",
    "joinDate": "2024-01-15T00:00:00.000Z",
    "salary": 15000000,
    "status": "ACTIVE",
    "regionId": "32.73",
    "address": "Jl. Braga No. 123, RT 01/RW 05",
    "postalCode": "40111"
  }'
```

### Test Update Employee Address

```bash
curl -X PATCH http://localhost:3000/company/employees/{id} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "regionId": "31.71",
    "address": "Jl. Thamrin No. 45",
    "postalCode": "10110"
  }'
```

## Related Models

Employee address structure is now consistent with:
- ✅ **User** - Has regionId, address, postalCode
- ✅ **Company** - Has regionId, address, postalCode
- ✅ **Employee** - Has regionId, address, postalCode (NEW!)

All three models use the same Region integration for address data.

## See Also

- [EMPLOYEE_LOGIN_GUIDE.md](./EMPLOYEE_LOGIN_GUIDE.md) - Employee login implementation
- [Region Endpoints Documentation](./POSTMAN_DOCUMENTATION.md) - Region API usage
- Schema: `prisma/schema.prisma` - Employee model definition
