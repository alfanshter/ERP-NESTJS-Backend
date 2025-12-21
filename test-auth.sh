#!/bin/bash

BASE_URL="http://localhost:3000"
echo "🔐 Testing ERP Backend Authentication System"
echo "=========================================="
echo ""

# Test 1: Try accessing protected endpoint without token (should fail)
echo "1️⃣ Testing protected endpoint WITHOUT token (should get 401)"
echo "GET /superadmin/companies"
curl -s -w "\nStatus: %{http_code}\n" "$BASE_URL/superadmin/companies"
echo ""
echo "---"
echo ""

# Test 2: Login with superadmin credentials
echo "2️⃣ Testing login with superadmin credentials"
echo "POST /auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@erp-system.com",
    "password": "SuperAdmin123!"
  }')
echo "$LOGIN_RESPONSE" | jq .
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')
echo "🎫 Token extracted: ${TOKEN:0:50}..."
echo ""
echo "---"
echo ""

# Test 3: Get current user profile
echo "3️⃣ Testing authenticated endpoint: GET /auth/me"
curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo "---"
echo ""

# Test 4: Access protected endpoint with token (should work)
echo "4️⃣ Testing protected endpoint WITH token (should work)"
echo "GET /superadmin/companies"
curl -s "$BASE_URL/superadmin/companies" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo "---"
echo ""

# Test 5: Get dashboard overview
echo "5️⃣ Testing dashboard endpoint: GET /superadmin/dashboard/overview"
curl -s "$BASE_URL/superadmin/dashboard/overview" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo "---"
echo ""

# Test 6: Get pricing plans
echo "6️⃣ Testing pricing plans endpoint: GET /superadmin/pricing-plans"
curl -s "$BASE_URL/superadmin/pricing-plans" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo "---"
echo ""

# Test 7: Try with wrong password (should fail)
echo "7️⃣ Testing login with WRONG password (should fail)"
echo "POST /auth/login"
curl -s -w "\nStatus: %{http_code}\n" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@erp-system.com",
    "password": "WrongPassword123!"
  }'
echo ""
echo "---"
echo ""

echo "✅ Authentication testing complete!"
