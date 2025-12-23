# Postman Collection Updates

## 📋 Summary

Postman collection `ERP-System-API.postman_collection.json` has been enhanced with better variables, test scripts, and workflow documentation.

## 🔄 What Was Updated

### 1. Collection Variables Added

New variables at collection level for easier testing:

```json
{
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000",
      "type": "string"
    },
    {
      "key": "token",
      "value": "",
      "type": "string"
    },
    {
      "key": "master_key",
      "value": "MASTER_SUPER_ADMIN_KEY_2024",
      "type": "string"
    },
    {
      "key": "master_email",
      "value": "master@erp.com",
      "type": "string"
    },
    {
      "key": "master_password",
      "value": "MasterAdmin123!",
      "type": "string"
    }
  ]
}
```

**Benefits:**
- No need to manually edit request bodies
- Quick switching between accounts
- Centralized configuration

---

### 2. Enhanced "1. Login" Request

**Added Test Script:**
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.access_token);
    pm.collectionVariables.set("token", jsonData.access_token);
    
    console.log("\n✅ Login Successful!");
    console.log("📧 Email:", jsonData.user.email);
    console.log("🎭 Role:", jsonData.user.role.name);
    
    if (jsonData.user.isSuperAdminMaster) {
        console.log("\n🎖️  SUPERADMIN MASTER - Full access to staff management!");
    } else if (jsonData.user.isSuperAdmin) {
        console.log("\n⭐ SUPERADMIN STAFF - Cannot access staff management");
    }
}
```

**Updated Body:**
```json
{
  "email": "{{master_email}}",
  "password": "{{master_password}}"
}
```

**Enhanced Description:**
```
🔑 **Login to ERP System**

**Quick Login as Master:**
This request uses collection variables:
- Email: {{master_email}} = master@erp.com  
- Password: {{master_password}} = MasterAdmin123!

**Steps:**
1. Send this request
2. Token automatically saved to {{token}} variable
3. Check console for role information

**Role Detection:**
- 🎖️ superadmin-master → Can access /superadmin/staff
- ⭐ superadmin-staff → Cannot access /superadmin/staff

**Manual Login:**
You can edit the body to login with different accounts.
```

**Features:**
- ✅ Auto-saves token to collection variable
- ✅ Shows role information in console
- ✅ Indicates permission level
- ✅ Uses variables for quick testing

---

### 3. Enhanced "3. Register Superadmin Master" Request

**Added Test Script:**
```javascript
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    console.log("\n✅ Master Account Created Successfully!");
    console.log("📧 Email:", jsonData.email);
    console.log("🎭 Role:", jsonData.role.name);
    console.log("\n💡 Next Step: Use '1. Login' to get access token");
}
```

**Updated Body:**
```json
{
  "email": "{{master_email}}",
  "password": "{{master_password}}",
  "firstName": "Master",
  "lastName": "Admin",
  "phone": "+628123456789"
}
```

**Updated Headers:**
```
x-master-key: {{master_key}}
```

**Enhanced Description:**
```
🔐 **Register Master Superadmin**

⚠️ **FIRST TIME SETUP ONLY**

**Steps:**
1. Ensure database is seeded (`pnpm run seed`)
2. Send this request
3. Master account created with full privileges
4. Use "1. Login" to get access token

**Default Values (from variables):**
- Master Key: {{master_key}}
- Email: {{master_email}}  
- Password: {{master_password}}

**Security:**
- Master key required (x-master-key header)
- Only create ONE master account per system
- Highest privilege level

**After Registration:**
- Login with master credentials
- Check role in "4. Get Profile"
- Start creating staff accounts
```

**Features:**
- ✅ Uses collection variables
- ✅ Shows success confirmation
- ✅ Guides next steps
- ✅ Security warnings

---

### 4. Enhanced "4. Get Profile" Request

**Added Test Script:**
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    console.log("\n👤 User Profile:");
    console.log("📧 Email:", jsonData.email);
    console.log("👔 Role:", jsonData.role.name);
    console.log("✅ Active:", jsonData.isActive);
    
    if (jsonData.role.name === 'superadmin-master') {
        console.log("\n🎖️  MASTER ACCESS:");
        console.log("   ✅ Can create superadmin staff");
        console.log("   ✅ Can access /superadmin/staff endpoints");
    } else if (jsonData.role.name === 'superadmin-staff') {
        console.log("\n⭐ STAFF ACCESS:");
        console.log("   ✅ Full system access");
        console.log("   ❌ Cannot access /superadmin/staff endpoints");
    }
}
```

**Enhanced Description:**
```
🔍 **Check user profile and role**

Use this to verify:
- Current role (superadmin-master vs superadmin-staff)
- User details
- Active status

**Response example:**
{
  "id": "uuid",
  "email": "master@erp.com",
  "firstName": "Master",
  "role": {
    "name": "superadmin-master"
  },
  "isActive": true
}

**Role Check:**
- `superadmin-master` ✅ Can access staff management
- `superadmin-staff` ❌ Cannot access staff management

**Troubleshooting 403 Error:**
If you get 403 on `/superadmin/staff`, check role here!
```

**Features:**
- ✅ Shows profile details in console
- ✅ Explains permission differences
- ✅ Helps troubleshoot 403 errors
- ✅ Example response provided

---

### 5. Enhanced "1. Create Superadmin Staff" Request

**Added Test Script:**
```javascript
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    console.log("\n✅ Staff Created Successfully!");
    console.log("📧 Email:", jsonData.email);
    console.log("👤 Name:", jsonData.firstName, jsonData.lastName);
    console.log("🎭 Role:", jsonData.role.name);
    console.log("🆔 ID:", jsonData.id);
} else if (pm.response.code === 403) {
    console.log("\n❌ ACCESS DENIED!");
    console.log("Only superadmin-master can create staff.");
    console.log("\n💡 Solution:");
    console.log("1. Register as master using 'Register Superadmin Master'");
    console.log("2. Login with master account");
    console.log("3. Check role in 'Get Profile'");
} else if (pm.response.code === 409) {
    console.log("\n⚠️  Email already exists!");
    console.log("Try different email address.");
}
```

**Features:**
- ✅ Success confirmation with details
- ✅ 403 error troubleshooting guide
- ✅ Duplicate email detection
- ✅ Step-by-step solution

---

## 📊 Staff Management Section Structure

The "Superadmin - Staff Management" folder now includes:

```
📁 Superadmin - Staff Management
├── 1. Create Superadmin Staff (POST /superadmin/staff)
├── 2. Get All Superadmin Staff (GET /superadmin/staff)
├── 3. Get Staff Statistics (GET /superadmin/staff/stats)
├── 4. Get Staff by ID (GET /superadmin/staff/:id)
├── 5. Update Staff (PATCH /superadmin/staff/:id)
└── 6. Delete Staff (DELETE /superadmin/staff/:id)
```

All requests:
- ✅ Use bearer token authentication (`{{token}}`)
- ✅ Have clear descriptions
- ✅ Include example request/response
- ✅ Document access restrictions

---

## 🎯 How to Use Updated Collection

### First Time Setup

1. **Start Server**
   ```bash
   cd backend/erp-backend
   pnpm run start:dev
   ```

2. **Check Variables**
   - Click collection name
   - Go to "Variables" tab
   - Verify values are set:
     - `master_key`: MASTER_SUPER_ADMIN_KEY_2024
     - `master_email`: master@erp.com
     - `master_password`: MasterAdmin123!

3. **Register Master** (One-time only)
   - Run: `3. Register Superadmin Master`
   - Check console for success message
   - Confirm role is `superadmin-master`

4. **Login as Master**
   - Run: `1. Login`
   - Token automatically saved to `{{token}}`
   - Console shows role information

5. **Verify Profile**
   - Run: `4. Get Profile`
   - Confirm you see "MASTER ACCESS" in console

6. **Create Staff**
   - Run: `1. Create Superadmin Staff`
   - Edit email if needed
   - Staff created with `superadmin-staff` role

### Testing Access Control

1. **Login as Master**
   ```
   POST /auth/login
   Body: {
     "email": "{{master_email}}",
     "password": "{{master_password}}"
   }
   ```

2. **Access Staff Endpoints** (Should Work ✅)
   ```
   GET /superadmin/staff
   Authorization: Bearer {{token}}
   ```

3. **Login as Staff**
   ```
   POST /auth/login
   Body: {
     "email": "staff1@erp.com",
     "password": "Staff123!"
   }
   ```

4. **Try Staff Endpoints** (Should Fail ❌)
   ```
   GET /superadmin/staff
   Response: 403 Forbidden
   ```

---

## 🔧 Console Output Examples

### Successful Login as Master
```
✅ Login Successful!
📧 Email: master@erp.com
🎭 Role: superadmin-master

🎖️  SUPERADMIN MASTER - Full access to staff management!
```

### Successful Login as Staff
```
✅ Login Successful!
📧 Email: staff1@erp.com
🎭 Role: superadmin-staff

⭐ SUPERADMIN STAFF - Cannot access staff management
```

### Get Profile (Master)
```
👤 User Profile:
📧 Email: master@erp.com
👔 Role: superadmin-master
✅ Active: true

🎖️  MASTER ACCESS:
   ✅ Can create superadmin staff
   ✅ Can access /superadmin/staff endpoints
```

### Get Profile (Staff)
```
👤 User Profile:
📧 Email: staff1@erp.com
👔 Role: superadmin-staff
✅ Active: true

⭐ STAFF ACCESS:
   ✅ Full system access
   ❌ Cannot access /superadmin/staff endpoints
```

### Staff Creation Success
```
✅ Staff Created Successfully!
📧 Email: staff2@erp.com
👤 Name: Staff Two
🎭 Role: superadmin-staff
🆔 ID: 550e8400-e29b-41d4-a716-446655440000
```

### Staff Creation Failed (403)
```
❌ ACCESS DENIED!
Only superadmin-master can create staff.

💡 Solution:
1. Register as master using 'Register Superadmin Master'
2. Login with master account
3. Check role in 'Get Profile'
```

---

## 📝 Variable Reference

| Variable | Purpose | Default Value | Auto-Set? |
|----------|---------|---------------|-----------|
| `base_url` | API endpoint | http://localhost:3000 | No |
| `token` | JWT token | *(empty)* | Yes (after login) |
| `master_key` | Master registration key | MASTER_SUPER_ADMIN_KEY_2024 | No |
| `master_email` | Master account email | master@erp.com | No |
| `master_password` | Master account password | MasterAdmin123! | No |

**How to Change:**
1. Click collection name
2. Go to "Variables" tab
3. Edit "Current value" column
4. Click "Save"

---

## 🐛 Troubleshooting with Postman

### Problem: Token not saving after login

**Solution:**
1. Check test script in "1. Login" request
2. Verify response is 200 OK
3. Check Postman console (View > Show Postman Console)
4. Manually set: `{{token}}` in collection variables

### Problem: 403 on staff endpoints

**Solution:**
1. Run "4. Get Profile"
2. Check console output
3. If role is not "superadmin-master":
   - Register new master account
   - Login with master credentials
   - Retry staff endpoint

### Problem: Master registration fails

**Solution:**
1. Check header `x-master-key: {{master_key}}`
2. Verify `.env` has matching key
3. Restart server after .env changes
4. Check server logs for errors

### Problem: Variables not working

**Solution:**
1. Collection variables vs Environment variables
2. Click collection → Variables tab
3. Verify "Current value" column filled
4. Save after editing
5. Use `{{variable_name}}` syntax in requests

---

## 📚 Related Files

- **STAFF_MANAGEMENT_WORKFLOW.md** - Complete workflow guide
- **SUPERADMIN_HIERARCHY.md** - Role hierarchy documentation  
- **MASTER_SUPERADMIN_API.md** - API reference
- **POSTMAN_GUIDE.md** - General Postman usage
- **.env** - Environment variables (master key)

---

## ✅ Testing Checklist

After updating collection:

- [ ] Variables visible in collection settings
- [ ] Login request uses `{{master_email}}` and `{{master_password}}`
- [ ] Login test script saves token automatically
- [ ] Console shows role information after login
- [ ] Get Profile shows permission details
- [ ] Create Staff has error handling in console
- [ ] All staff endpoints use `{{token}}` for auth
- [ ] Master registration uses `{{master_key}}`

---

## 🎓 Best Practices

1. **Use Console for Debugging**
   - View > Show Postman Console
   - See all test script outputs
   - Check request/response details

2. **Organize Requests in Folders**
   - Authentication requests together
   - Staff management in separate folder
   - Makes workflow clearer

3. **Use Test Scripts**
   - Auto-save important values
   - Provide user feedback
   - Handle errors gracefully

4. **Document with Descriptions**
   - Explain what request does
   - Include example responses
   - Note access requirements

5. **Use Collection Variables**
   - Centralized configuration
   - Easy to switch environments
   - Reduce manual editing

---

**Last Updated:** December 21, 2024  
**Collection Version:** 2.1.0  
**Changes:** Added variables, test scripts, and enhanced documentation
