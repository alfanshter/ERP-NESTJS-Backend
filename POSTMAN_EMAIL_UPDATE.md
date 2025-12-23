# Postman Collection - Email Update Feature

## 📝 Summary of Changes

Updated Postman collection to support **email update** feature for Staff and Company management.

---

## 🔄 Staff Management Updates

### **5. Update Staff** (JSON)
**Endpoint:** `PATCH /superadmin/staff/:id`

**Updated Body:**
```json
{
  "email": "updatedemail@example.com",     // ← NEW: Can update email
  "firstName": "Updated Staff",
  "lastName": "Name",
  "phone": "+628987654321",
  "country": "Indonesia",
  "address": "Jl. Updated Address No. 99",
  "city": "Jakarta",
  "postalCode": "12345",
  "isActive": true
}
```

**Updated Description:**
- ✅ Email now updatable with uniqueness validation
- ✅ Returns 409 Conflict if email already used
- ✅ Cannot update superadmin-master accounts
- ✅ All fields optional (partial update)

---

### **5b. Update Staff with Avatar** (form-data)
**Endpoint:** `PATCH /superadmin/staff/:id`

**Updated Form Data:**
- ✅ **email** field added (first field)
- Value: `updatedemail@example.com`
- Description: "New email (must be unique)"

**Features:**
- Update email + upload new avatar in single request
- Email uniqueness validation (409 if duplicate)
- Old avatar automatically deleted
- Automatic compression (500x500px, JPEG 85%)

---

## 🏢 Company Management Updates

### **5. Update Company** (form-data)
**Endpoint:** `PATCH /superadmin/companies/:id`

**Existing Email Field - Updated Description:**
```
key: "email"
value: "newemail@techindo.com"
description: "Company email (optional)"
```

**Updated Documentation:**
```markdown
**Email Update:**
- Email must be unique across all companies
- Returns 409 Conflict if email already used by another company
- Validation skips current company when checking uniqueness

**Logo Update:**
- Upload new logo to replace existing one
- Old logo file will be automatically deleted
- Format: JPEG, PNG only
- Max Size: 1MB
```

---

## 🧪 Testing Guide

### Test Staff Email Update

**Scenario 1: Success**
```bash
PATCH /superadmin/staff/{{staff_id}}
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "email": "newemail@example.com",
  "firstName": "John"
}
```

**Expected Response: 200 OK**
```json
{
  "id": "...",
  "email": "newemail@example.com",
  "firstName": "John",
  "lastName": "...",
  "createdAt": "2025-12-23T10:00:00.000Z",
  "updatedAt": "2025-12-23T11:00:00.000Z"
}
```

---

**Scenario 2: Duplicate Email**
```bash
PATCH /superadmin/staff/{{staff_id}}

{
  "email": "master@erp.com"  // Already used by another user
}
```

**Expected Response: 409 Conflict**
```json
{
  "statusCode": 409,
  "message": "Email already registered",
  "error": "Conflict"
}
```

---

### Test Company Email Update

**Scenario 1: Success**
```bash
PATCH /superadmin/companies/{{company_id}}
Authorization: Bearer {{token}}
Content-Type: multipart/form-data

email: newcompany@example.com
name: Updated Company Name
```

**Expected Response: 200 OK**
```json
{
  "id": "...",
  "name": "Updated Company Name",
  "email": "newcompany@example.com",
  "createdAt": "2025-12-23T10:00:00.000Z",
  "updatedAt": "2025-12-23T11:00:00.000Z"
}
```

---

**Scenario 2: Duplicate Email**
```bash
PATCH /superadmin/companies/{{company_id}}

email: existing@company.com  // Already used by another company
```

**Expected Response: 409 Conflict**
```json
{
  "statusCode": 409,
  "message": "Email already used by another company",
  "error": "Conflict"
}
```

---

## 📋 Validation Rules

### Staff Email Update
| Rule | Description | Error |
|------|-------------|-------|
| **Unique** | Email must not be used by another user | 409 Conflict |
| **Format** | Must be valid email format | 400 Bad Request |
| **Optional** | Can be omitted in update request | - |
| **Master Protection** | Cannot update superadmin-master | 400 Bad Request |

### Company Email Update
| Rule | Description | Error |
|------|-------------|-------|
| **Unique** | Email must not be used by another company | 409 Conflict |
| **Format** | Must be valid email format | 400 Bad Request |
| **Optional** | Can be omitted in update request | - |
| **Self-Exclusion** | Can use same email as current company | - |

---

## 🔐 Authorization

Both endpoints require:
- ✅ Valid JWT token in Authorization header
- ✅ **superadmin-master** role for Staff endpoints
- ✅ **superadmin** role for Company endpoints

---

## 📌 Summary

### What Changed:
1. ✅ Staff JSON update request now includes `email` field
2. ✅ Staff form-data update request now includes `email` field (first position)
3. ✅ Company update documentation enhanced with email validation info
4. ✅ All descriptions updated to reflect email update capability
5. ✅ Added 409 Conflict error documentation

### Benefits:
- 🎯 Users can now change email addresses
- 🔒 Email uniqueness enforced at API level
- 📝 Clear error messages for duplicate emails
- ⚡ Single request to update email + other fields
- 🖼️ Can combine email update with avatar/logo upload

---

## 🚀 Next Steps

1. Import updated Postman collection
2. Test email update with valid data → Should succeed
3. Test with duplicate email → Should return 409
4. Test combined update (email + avatar) → Should succeed
5. Verify old avatar deleted when uploading new one

---

**Last Updated:** December 23, 2025  
**Collection Version:** 1.4.0
