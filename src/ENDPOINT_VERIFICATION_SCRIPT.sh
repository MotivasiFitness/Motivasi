#!/bin/bash

# API Endpoint Verification Script
# This script tests all three API endpoints to ensure they're working correctly
# Usage: ./ENDPOINT_VERIFICATION_SCRIPT.sh https://your-deployed-domain.com YOUR_AUTH_TOKEN

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="${1:-http://localhost:3000}"
AUTH_TOKEN="${2:-}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}API Endpoint Verification Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Domain: ${YELLOW}${DOMAIN}${NC}"
echo -e "Auth Token: ${YELLOW}${AUTH_TOKEN:0:20}...${NC}"
echo ""

# Function to check if response is JSON
is_json() {
  local response="$1"
  if echo "$response" | jq . >/dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

# Function to extract status code from curl response
get_status_code() {
  local response="$1"
  echo "$response" | grep "< HTTP" | awk '{print $3}'
}

# Function to extract content-type from curl response
get_content_type() {
  local response="$1"
  echo "$response" | grep "< content-type" | awk '{print $3}' | tr -d '\r'
}

# Function to extract body from curl response
get_body() {
  local response="$1"
  echo "$response" | tail -1
}

# Test 1: Diagnostic Endpoint
echo -e "${BLUE}Test 1: GET /api/generate-program (Diagnostic)${NC}"
echo -e "${YELLOW}Testing diagnostic endpoint...${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${DOMAIN}/api/generate-program" \
  -H "Content-Type: application/json" \
  -v 2>&1)

STATUS=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)
CONTENT_TYPE=$(echo "$BODY" | grep "< content-type" | awk '{print $3}' | tr -d '\r')
JSON_BODY=$(echo "$BODY" | tail -1)

echo -e "Status Code: ${YELLOW}${STATUS}${NC}"
echo -e "Content-Type: ${YELLOW}${CONTENT_TYPE}${NC}"
echo -e "Response: ${YELLOW}${JSON_BODY}${NC}"

if [ "$STATUS" = "200" ]; then
  echo -e "${GREEN}✓ Status code is 200${NC}"
else
  echo -e "${RED}✗ Status code is ${STATUS} (expected 200)${NC}"
fi

if [[ "$CONTENT_TYPE" == *"application/json"* ]]; then
  echo -e "${GREEN}✓ Content-Type is application/json${NC}"
else
  echo -e "${RED}✗ Content-Type is ${CONTENT_TYPE} (expected application/json)${NC}"
fi

if is_json "$JSON_BODY"; then
  echo -e "${GREEN}✓ Response is valid JSON${NC}"
else
  echo -e "${RED}✗ Response is not valid JSON${NC}"
fi

if [[ "$JSON_BODY" == *"\"ok\":true"* ]] || [[ "$JSON_BODY" == *"\"ok\": true"* ]]; then
  echo -e "${GREEN}✓ Response contains { \"ok\": true }${NC}"
else
  echo -e "${RED}✗ Response does not contain { \"ok\": true }${NC}"
fi

echo ""

# Test 2: Missing Authentication
echo -e "${BLUE}Test 2: POST /api/generate-program (Missing Auth)${NC}"
echo -e "${YELLOW}Testing missing authentication...${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${DOMAIN}/api/generate-program" \
  -H "Content-Type: application/json" \
  -d '{
    "programGoal": "Build muscle",
    "trainerId": "trainer-123"
  }' \
  -v 2>&1)

STATUS=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)
CONTENT_TYPE=$(echo "$BODY" | grep "< content-type" | awk '{print $3}' | tr -d '\r')
JSON_BODY=$(echo "$BODY" | tail -1)

echo -e "Status Code: ${YELLOW}${STATUS}${NC}"
echo -e "Content-Type: ${YELLOW}${CONTENT_TYPE}${NC}"
echo -e "Response: ${YELLOW}${JSON_BODY:0:100}...${NC}"

if [ "$STATUS" = "401" ]; then
  echo -e "${GREEN}✓ Status code is 401${NC}"
else
  echo -e "${RED}✗ Status code is ${STATUS} (expected 401)${NC}"
fi

if [[ "$CONTENT_TYPE" == *"application/json"* ]]; then
  echo -e "${GREEN}✓ Content-Type is application/json${NC}"
else
  echo -e "${RED}✗ Content-Type is ${CONTENT_TYPE} (expected application/json)${NC}"
fi

if is_json "$JSON_BODY"; then
  echo -e "${GREEN}✓ Response is valid JSON${NC}"
else
  echo -e "${RED}✗ Response is not valid JSON${NC}"
fi

if [[ "$JSON_BODY" == *"\"success\":false"* ]] || [[ "$JSON_BODY" == *"\"success\": false"* ]]; then
  echo -e "${GREEN}✓ Response indicates failure${NC}"
else
  echo -e "${RED}✗ Response does not indicate failure${NC}"
fi

echo ""

# Test 3: Invalid Equipment Array
echo -e "${BLUE}Test 3: POST /api/generate-program (Invalid Equipment)${NC}"
echo -e "${YELLOW}Testing invalid equipment array...${NC}"

if [ -z "$AUTH_TOKEN" ]; then
  echo -e "${YELLOW}Skipping (no auth token provided)${NC}"
else
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${DOMAIN}/api/generate-program" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -d '{
      "programGoal": "Build muscle",
      "programLength": "8 weeks",
      "daysPerWeek": 4,
      "experienceLevel": "intermediate",
      "equipment": [],
      "timePerWorkout": 60,
      "trainerId": "trainer-123"
    }' \
    -v 2>&1)

  STATUS=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | head -n -1)
  CONTENT_TYPE=$(echo "$BODY" | grep "< content-type" | awk '{print $3}' | tr -d '\r')
  JSON_BODY=$(echo "$BODY" | tail -1)

  echo -e "Status Code: ${YELLOW}${STATUS}${NC}"
  echo -e "Content-Type: ${YELLOW}${CONTENT_TYPE}${NC}"
  echo -e "Response: ${YELLOW}${JSON_BODY:0:100}...${NC}"

  if [ "$STATUS" = "400" ]; then
    echo -e "${GREEN}✓ Status code is 400${NC}"
  else
    echo -e "${RED}✗ Status code is ${STATUS} (expected 400)${NC}"
  fi

  if [[ "$CONTENT_TYPE" == *"application/json"* ]]; then
    echo -e "${GREEN}✓ Content-Type is application/json${NC}"
  else
    echo -e "${RED}✗ Content-Type is ${CONTENT_TYPE} (expected application/json)${NC}"
  fi

  if is_json "$JSON_BODY"; then
    echo -e "${GREEN}✓ Response is valid JSON${NC}"
  else
    echo -e "${RED}✗ Response is not valid JSON${NC}"
  fi
fi

echo ""

# Test 4: Generate Program (with auth)
echo -e "${BLUE}Test 4: POST /api/generate-program (Valid Request)${NC}"
echo -e "${YELLOW}Testing program generation...${NC}"

if [ -z "$AUTH_TOKEN" ]; then
  echo -e "${YELLOW}Skipping (no auth token provided)${NC}"
  echo -e "${YELLOW}To test this endpoint, provide your auth token:${NC}"
  echo -e "${YELLOW}./ENDPOINT_VERIFICATION_SCRIPT.sh ${DOMAIN} YOUR_TOKEN${NC}"
else
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${DOMAIN}/api/generate-program" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -d '{
      "programGoal": "Build muscle",
      "programLength": "8 weeks",
      "daysPerWeek": 4,
      "experienceLevel": "intermediate",
      "equipment": ["dumbbells", "barbell"],
      "timePerWorkout": 60,
      "injuries": "",
      "trainingStyle": "Hypertrophy",
      "trainerId": "trainer-123"
    }' \
    -v 2>&1)

  STATUS=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | head -n -1)
  CONTENT_TYPE=$(echo "$BODY" | grep "< content-type" | awk '{print $3}' | tr -d '\r')
  JSON_BODY=$(echo "$BODY" | tail -1)

  echo -e "Status Code: ${YELLOW}${STATUS}${NC}"
  echo -e "Content-Type: ${YELLOW}${CONTENT_TYPE}${NC}"
  echo -e "Response Length: ${YELLOW}${#JSON_BODY}${NC} characters"

  if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Status code is 200${NC}"
  else
    echo -e "${RED}✗ Status code is ${STATUS} (expected 200)${NC}"
  fi

  if [[ "$CONTENT_TYPE" == *"application/json"* ]]; then
    echo -e "${GREEN}✓ Content-Type is application/json${NC}"
  else
    echo -e "${RED}✗ Content-Type is ${CONTENT_TYPE} (expected application/json)${NC}"
  fi

  if is_json "$JSON_BODY"; then
    echo -e "${GREEN}✓ Response is valid JSON${NC}"
    
    # Check for required fields
    if [[ "$JSON_BODY" == *"\"success\":true"* ]] || [[ "$JSON_BODY" == *"\"success\": true"* ]]; then
      echo -e "${GREEN}✓ Response indicates success${NC}"
    else
      echo -e "${RED}✗ Response does not indicate success${NC}"
    fi
    
    if [[ "$JSON_BODY" == *"\"programName\""* ]]; then
      echo -e "${GREEN}✓ Response contains programName${NC}"
    else
      echo -e "${RED}✗ Response missing programName${NC}"
    fi
    
    if [[ "$JSON_BODY" == *"\"workoutDays\""* ]]; then
      echo -e "${GREEN}✓ Response contains workoutDays${NC}"
    else
      echo -e "${RED}✗ Response missing workoutDays${NC}"
    fi
    
    if [[ "$JSON_BODY" == *"\"aiGenerated\":true"* ]] || [[ "$JSON_BODY" == *"\"aiGenerated\": true"* ]]; then
      echo -e "${GREEN}✓ Response contains aiGenerated: true${NC}"
    else
      echo -e "${RED}✗ Response missing aiGenerated: true${NC}"
    fi
  else
    echo -e "${RED}✗ Response is not valid JSON${NC}"
    echo -e "${RED}Response: ${JSON_BODY:0:200}${NC}"
  fi
fi

echo ""

# Test 5: Regenerate Section
echo -e "${BLUE}Test 5: POST /api/regenerate-program-section${NC}"
echo -e "${YELLOW}Testing section regeneration...${NC}"

if [ -z "$AUTH_TOKEN" ]; then
  echo -e "${YELLOW}Skipping (no auth token provided)${NC}"
else
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${DOMAIN}/api/regenerate-program-section" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -d '{
      "section": "workout-day",
      "context": "Current workout context",
      "prompt": "Regenerate with more compound exercises",
      "trainerPreferences": {},
      "currentProgram": {}
    }' \
    -v 2>&1)

  STATUS=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | head -n -1)
  CONTENT_TYPE=$(echo "$BODY" | grep "< content-type" | awk '{print $3}' | tr -d '\r')
  JSON_BODY=$(echo "$BODY" | tail -1)

  echo -e "Status Code: ${YELLOW}${STATUS}${NC}"
  echo -e "Content-Type: ${YELLOW}${CONTENT_TYPE}${NC}"
  echo -e "Response Length: ${YELLOW}${#JSON_BODY}${NC} characters"

  if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Status code is 200${NC}"
  else
    echo -e "${RED}✗ Status code is ${STATUS} (expected 200)${NC}"
  fi

  if [[ "$CONTENT_TYPE" == *"application/json"* ]]; then
    echo -e "${GREEN}✓ Content-Type is application/json${NC}"
  else
    echo -e "${RED}✗ Content-Type is ${CONTENT_TYPE} (expected application/json)${NC}"
  fi

  if is_json "$JSON_BODY"; then
    echo -e "${GREEN}✓ Response is valid JSON${NC}"
  else
    echo -e "${RED}✗ Response is not valid JSON${NC}"
  fi
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Verification Complete${NC}"
echo -e "${BLUE}========================================${NC}"
