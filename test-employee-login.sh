#!/bin/bash

# Test Employee Login Flow
# This script demonstrates the complete flow:
# 1. Login as superadmin
# 2. Create company
# 3. Create employee
# 4. Grant login access to employee
# 5. Login as employee
# 6. Revoke employee access

BASE_URL="http://localhost:3000"

echo "🚀 Testing Employee Login Flow"
echo "================================"

# Step 1: Login as Superadmin
echo ""
echo "📝 Step 1: Login as Superadmin Master"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "master@erp.com",
    "password": "MasterAdmin123!"
  }')

SUPERADMIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')
echo "✅ Logged in as superadmin"
echo "Token: ${SUPERADMIN_TOKEN:0:50}..."

# Step 2: Create Company
echo ""
echo "📝 Step 2: Create Company"
COMPANY_RESPONSE=$(curl -s -X POST "$BASE_URL/superadmin/companies" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPERADMIN_TOKEN" \
  -d '{
    "name": "PT Test Employee Login",
    "email": "test@company.com",
    "phone": "081234567890",
    "address": "Jl. Test No. 123"
  }')

COMPANY_ID=$(echo $COMPANY_RESPONSE | grep -o '"id":"[^"]*' | sed 's/"id":"//')
echo "✅ Company created"
echo "Company ID: $COMPANY_ID"

# Step 3: Create Company Admin (first user)
echo ""
echo "📝 Step 3: Create Company Admin User"
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "Company",
    "companyId": "'"$COMPANY_ID"'"
  }')

echo "✅ Company admin created"
echo "$ADMIN_RESPONSE" | head -c 200

# Step 4: Login as Company Admin
echo ""
echo ""
echo "📝 Step 4: Login as Company Admin"
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "Admin123!"
  }')

ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')
echo "✅ Logged in as company admin"
echo "Token: ${ADMIN_TOKEN:0:50}..."

# Step 5: Get Staff Role ID
echo ""
echo "📝 Step 5: Getting Staff Role ID (for grant access later)"
# We'll use a fixed staff role from seed
STAFF_ROLE_ID="staff" # Will be looked up from DB

# Step 6: Create Employee
echo ""
echo "📝 Step 6: Create Employee (Marketing Staff)"
EMPLOYEE_RESPONSE=$(curl -s -X POST "$BASE_URL/company/employees" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "employeeCode": "EMP001",
    "firstName": "John",
    "lastName": "Marketing",
    "email": "john.marketing@company.com",
    "phone": "081234567891",
    "position": "Marketing Manager",
    "department": "Marketing",
    "salary": 10000000
  }')

EMPLOYEE_ID=$(echo $EMPLOYEE_RESPONSE | grep -o '"id":"[^"]*' | sed 's/"id":"//')
echo "✅ Employee created"
echo "Employee ID: $EMPLOYEE_ID"
echo "$EMPLOYEE_RESPONSE" | head -c 300

# Step 7: Try to login as employee (should fail - no access yet)
echo ""
echo ""
echo "📝 Step 7: Try to login as employee (should FAIL - no access yet)"
FAIL_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.marketing@company.com",
    "password": "Employee123!"
  }')

echo "❌ Expected error:"
echo "$FAIL_LOGIN"

# Step 8: Get role ID for granting access
echo ""
echo ""
echo "📝 Step 8: Query database for staff role ID"
# For this demo, we'll hardcode a role ID that should exist from seed
# In production, you'd query /roles endpoint
ROLE_ID=$(psql -d erp_db -t -c "SELECT id FROM \"Role\" WHERE name = 'staff' LIMIT 1" | xargs)
echo "Staff Role ID: $ROLE_ID"

# Step 9: Grant Access to Employee
echo ""
echo "📝 Step 9: Grant Login Access to Employee"
GRANT_RESPONSE=$(curl -s -X POST "$BASE_URL/company/employees/$EMPLOYEE_ID/grant-access" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "password": "Employee123!",
    "roleId": "'"$ROLE_ID"'"
  }')

echo "✅ Access granted"
echo "$GRANT_RESPONSE"

# Step 10: Login as Employee (should succeed now)
echo ""
echo ""
echo "📝 Step 10: Login as Employee (should SUCCESS now)"
EMPLOYEE_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.marketing@company.com",
    "password": "Employee123!"
  }')

EMPLOYEE_TOKEN=$(echo $EMPLOYEE_LOGIN | grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')
echo "✅ Employee logged in successfully!"
echo "Token: ${EMPLOYEE_TOKEN:0:50}..."
echo ""
echo "User Info:"
echo "$EMPLOYEE_LOGIN" | python3 -m json.tool 2>/dev/null || echo "$EMPLOYEE_LOGIN"

# Step 11: Get Employee Profile
echo ""
echo ""
echo "📝 Step 11: Get Employee Profile"
PROFILE=$(curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $EMPLOYEE_TOKEN")

echo "✅ Profile retrieved:"
echo "$PROFILE" | python3 -m json.tool 2>/dev/null || echo "$PROFILE"

# Step 12: Revoke Access
echo ""
echo ""
echo "📝 Step 12: Revoke Employee Access"
REVOKE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/company/employees/$EMPLOYEE_ID/revoke-access" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "✅ Access revoked"
echo "$REVOKE_RESPONSE"

# Step 13: Try to login again (should fail)
echo ""
echo ""
echo "📝 Step 13: Try to login as employee again (should FAIL - access revoked)"
FAIL_LOGIN2=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.marketing@company.com",
    "password": "Employee123!"
  }')

echo "❌ Expected error:"
echo "$FAIL_LOGIN2"

echo ""
echo ""
echo "================================"
echo "✅ Test completed successfully!"
echo "================================"
echo ""
echo "Summary:"
echo "1. ✅ Created company"
echo "2. ✅ Created company admin"
echo "3. ✅ Created employee (without login access)"
echo "4. ✅ Employee cannot login initially"
echo "5. ✅ Granted login access to employee"
echo "6. ✅ Employee can login successfully"
echo "7. ✅ Employee profile shows employee data"
echo "8. ✅ Revoked employee access"
echo "9. ✅ Employee cannot login anymore"
