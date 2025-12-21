# 📮 Postman Quick Start Guide

## 🚀 Setup Postman

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select file: `ERP-System-API.postman_collection.json`
4. Collection akan muncul di sidebar

### 2. Import Environment
1. Click **Import** button
2. Select file: `ERP-System-Local.postman_environment.json`
3. Select environment **"ERP System - Local"** di top-right dropdown

### 3. Verify Setup
- Environment: **ERP System - Local** (selected)
- Base URL: `http://localhost:3000`
- Token: (empty - will be auto-filled after login)

---

## 🎯 Testing Workflow

### Step 1: Login as Master Superadmin

**Collection:** Authentication → 1. Login

**Body:**
```json
{
  "email": "{{master_email}}",
  "password": "{{master_password}}"
}
```

**Click Send** ✅

**Result:** Token otomatis tersimpan di environment variable `{{token}}`

---

### Step 2: Test Protected Endpoint

**Collection:** Superadmin - Dashboard → 1. Get Dashboard Overview

**Headers:** Authorization otomatis menggunakan `{{token}}`

**Click Send** ✅

**Result:** Anda akan mendapat dashboard overview data

---

### Step 3: Register New Superadmin (Master Only)

**Collection:** Authentication → 3. Register Superadmin (Master Only)

**Body:**
```json
{
  "email": "newsuperadmin@erp-system.com",
  "password": "StrongPassword123!",
  "firstName": "New",
  "lastName": "Superadmin"
}
```

**Click Send** ✅

**Result:** New superadmin created

---

### Step 4: Create Company

**Collection:** Superadmin - Companies → 1. Create Company

**Body:**
```json
{
  "name": "Test Company",
  "email": "test@company.com",
  "phone": "+628123456789",
  "address": "Jakarta",
  "status": "TRIAL"
}
```

**Click Send** ✅

**Result:** Company created, copy the `id` for next steps

---

### Step 5: Get All Companies

**Collection:** Superadmin - Companies → 2. Get All Companies

**Query Params:**
- page: 1
- limit: 10
- search: (optional)
- status: (optional)

**Click Send** ✅

**Result:** List of all companies with pagination

---

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | API base URL | http://localhost:3000 |
| `token` | JWT token (auto-filled) | eyJhbGc... |
| `master_email` | Master superadmin email | master@erp-system.com |
| `master_password` | Master superadmin password | MasterAdmin123! |
| `superadmin_email` | Regular superadmin email | superadmin@erp-system.com |
| `superadmin_password` | Regular superadmin password | SuperAdmin123! |
| `admin_email` | Company admin email | admin@demo.com |
| `admin_password` | Company admin password | Admin123! |

---

## 🔧 Collection Structure

```
📦 ERP System API
├── 🔐 Authentication (5 endpoints)
│   ├── 1. Login
│   ├── 2. Register User
│   ├── 3. Register Superadmin (Master Only)
│   ├── 4. Get Profile
│   └── 5. Get Current User
│
├── 🏢 Superadmin - Companies (6 endpoints)
│   ├── 1. Create Company
│   ├── 2. Get All Companies
│   ├── 3. Get Company Stats
│   ├── 4. Get Single Company
│   ├── 5. Update Company
│   └── 6. Delete Company
│
├── 💰 Superadmin - Pricing Plans (5 endpoints)
│   ├── 1. Create Pricing Plan
│   ├── 2. Get All Pricing Plans
│   ├── 3. Get Single Pricing Plan
│   ├── 4. Update Pricing Plan
│   └── 5. Delete Pricing Plan
│
└── 📊 Superadmin - Dashboard (4 endpoints)
    ├── 1. Get Dashboard Overview
    ├── 2. Get Company Growth
    ├── 3. Get Subscription Breakdown
    └── 4. Get Company Status Distribution
```

**Total: 20 Endpoints**

---

## 🎓 Pro Tips

### 1. Auto-Save Token
Login request sudah ada **Test Script** yang otomatis save token:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.collectionVariables.set("token", jsonData.access_token);
}
```

### 2. Use Variables
Gunakan `{{variable_name}}` di:
- URL: `{{base_url}}/auth/login`
- Headers: `Bearer {{token}}`
- Body: `"email": "{{master_email}}"`

### 3. Test Different Roles
```bash
# Master Superadmin (can register superadmins)
{{master_email}} / {{master_password}}

# Regular Superadmin (cannot register superadmins)
{{superadmin_email}} / {{superadmin_password}}

# Company Admin
{{admin_email}} / {{admin_password}}
```

### 4. Response Examples
Klik tab **Save Response** setelah request success untuk dokumentasi

### 5. Collection Runner
Test semua endpoints sekaligus:
1. Click collection name
2. Click **Run**
3. Select requests to run
4. Click **Run ERP System API**

---

## 🔍 Common Issues

### Issue: 401 Unauthorized
**Solution:** Login ulang untuk refresh token
```
1. Run: Authentication → 1. Login
2. Token akan auto-saved
3. Retry request
```

### Issue: 403 Forbidden
**Solution:** Role tidak memiliki akses
```
- Gunakan Master Superadmin untuk register superadmin
- Gunakan Superadmin untuk company management
```

### Issue: Variable not found
**Solution:** Pastikan environment selected
```
1. Top-right dropdown
2. Select "ERP System - Local"
```

### Issue: Connection refused
**Solution:** Start backend server
```bash
cd backend
pnpm start:dev
```

---

## 📊 Testing Checklist

### Authentication Tests
- [ ] Login as Master Superadmin
- [ ] Login as Regular Superadmin
- [ ] Login as Company Admin
- [ ] Register new user
- [ ] Register new superadmin (with master token)
- [ ] Try register superadmin with regular token (should fail)
- [ ] Get profile
- [ ] Get current user

### Company Management Tests
- [ ] Create company
- [ ] Get all companies
- [ ] Get company stats
- [ ] Get single company
- [ ] Update company
- [ ] Delete company

### Pricing Plan Tests
- [ ] Create pricing plan
- [ ] Get all plans
- [ ] Get single plan
- [ ] Update plan
- [ ] Delete plan

### Dashboard Tests
- [ ] Get dashboard overview
- [ ] Get company growth
- [ ] Get subscription breakdown
- [ ] Get company status distribution

---

## 🚀 Advanced Usage

### 1. Pre-request Scripts
Add to collection/folder level:
```javascript
// Set timestamp
pm.collectionVariables.set("timestamp", Date.now());

// Check token expiry
const token = pm.collectionVariables.get("token");
if (!token) {
    console.log("No token found, please login first");
}
```

### 2. Tests Scripts
Validate responses:
```javascript
// Check status code
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Check response time
pm.test("Response time < 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// Check JSON structure
pm.test("Has access_token", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('access_token');
});
```

### 3. Dynamic Variables
```javascript
// Generate random email
pm.collectionVariables.set("random_email", 
    "user" + Math.random().toString(36).substring(7) + "@test.com"
);

// Use in body:
{
  "email": "{{random_email}}",
  ...
}
```

---

## 📚 Additional Resources

- **Full Documentation**: `POSTMAN_DOCUMENTATION.md`
- **API Endpoints**: `SUPERADMIN_README.md`
- **Auth Guide**: `AUTHENTICATION_GUIDE.md`
- **Master Superadmin**: `MASTER_SUPERADMIN_API.md`

---

## 🎉 Ready to Test!

1. ✅ Import Collection
2. ✅ Import Environment
3. ✅ Select Environment
4. ✅ Start Backend Server
5. ✅ Run Login Request
6. ✅ Test All Endpoints

**Happy Testing!** 🚀
