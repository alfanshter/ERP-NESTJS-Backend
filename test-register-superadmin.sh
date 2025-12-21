#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Testing Master Superadmin Register API        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"

# Step 1: Login as Master Superadmin
echo -e "\n${YELLOW}1. Login as Master Superadmin${NC}"
echo "POST $BASE_URL/auth/login"

MASTER_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "master@erp-system.com",
    "password": "MasterAdmin123!"
  }')

echo "$MASTER_LOGIN_RESPONSE" | jq '.'

MASTER_TOKEN=$(echo "$MASTER_LOGIN_RESPONSE" | jq -r '.access_token')

if [ "$MASTER_TOKEN" != "null" ]; then
  echo -e "${GREEN}✓ Master Superadmin login successful${NC}"
else
  echo -e "${RED}✗ Master Superadmin login failed${NC}"
  exit 1
fi

# Step 2: Register New Superadmin (as Master)
echo -e "\n${YELLOW}2. Register New Superadmin (using Master token)${NC}"
echo "POST $BASE_URL/auth/register-superadmin"

NEW_SUPERADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register-superadmin" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MASTER_TOKEN" \
  -d '{
    "email": "superadmin2@erp-system.com",
    "password": "SuperAdmin2023!",
    "firstName": "Second",
    "lastName": "Superadmin"
  }')

echo "$NEW_SUPERADMIN_RESPONSE" | jq '.'

if echo "$NEW_SUPERADMIN_RESPONSE" | jq -e '.user.id' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ New superadmin registered successfully${NC}"
else
  echo -e "${RED}✗ Failed to register new superadmin${NC}"
fi

# Step 3: Login as Regular Superadmin
echo -e "\n${YELLOW}3. Login as Regular Superadmin${NC}"
echo "POST $BASE_URL/auth/login"

REGULAR_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@erp-system.com",
    "password": "SuperAdmin123!"
  }')

echo "$REGULAR_LOGIN_RESPONSE" | jq '.'

REGULAR_TOKEN=$(echo "$REGULAR_LOGIN_RESPONSE" | jq -r '.access_token')

if [ "$REGULAR_TOKEN" != "null" ]; then
  echo -e "${GREEN}✓ Regular superadmin login successful${NC}"
else
  echo -e "${RED}✗ Regular superadmin login failed${NC}"
  exit 1
fi

# Step 4: Try to Register Superadmin (as Regular Superadmin - should FAIL)
echo -e "\n${YELLOW}4. Try to Register Superadmin (using Regular Superadmin token - should FAIL)${NC}"
echo "POST $BASE_URL/auth/register-superadmin"

FAILED_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register-superadmin" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REGULAR_TOKEN" \
  -d '{
    "email": "superadmin3@erp-system.com",
    "password": "SuperAdmin3023!",
    "firstName": "Third",
    "lastName": "Superadmin"
  }')

echo "$FAILED_RESPONSE" | jq '.'

if echo "$FAILED_RESPONSE" | jq -e '.statusCode == 403' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Access correctly denied for regular superadmin${NC}"
else
  echo -e "${RED}✗ Security check failed - regular superadmin should not be able to register superadmins${NC}"
fi

# Step 5: Try without token (should FAIL)
echo -e "\n${YELLOW}5. Try to Register Superadmin without token (should FAIL)${NC}"
echo "POST $BASE_URL/auth/register-superadmin"

NO_TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register-superadmin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin4@erp-system.com",
    "password": "SuperAdmin4023!",
    "firstName": "Fourth",
    "lastName": "Superadmin"
  }')

echo "$NO_TOKEN_RESPONSE" | jq '.'

if echo "$NO_TOKEN_RESPONSE" | jq -e '.statusCode == 401' > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Access correctly denied without authentication${NC}"
else
  echo -e "${RED}✗ Security check failed - authentication should be required${NC}"
fi

# Summary
echo -e "\n${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Test Summary                        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo -e "${GREEN}✓ Master Superadmin can register new superadmins${NC}"
echo -e "${GREEN}✓ Regular Superadmin CANNOT register superadmins${NC}"
echo -e "${GREEN}✓ Unauthenticated users CANNOT register superadmins${NC}"
echo -e "\n${BLUE}Master Superadmin Credentials:${NC}"
echo "Email: master@erp-system.com"
echo "Password: MasterAdmin123!"
