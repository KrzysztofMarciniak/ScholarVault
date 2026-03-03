#!/bin/sh

# Load configuration
. ./config.sh
. ./config_login.sh
# Admin credentials
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin"


ADMIN_TOKEN=$(get_bearer_token "$ADMIN_EMAIL" "$ADMIN_PASSWORD")

echo "=== POST /api/v1/users (create new user) ==="

# 1. Create basic user
curl -s -X POST "$API_BASE_URL/users" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{
        "name": "Basic User",
        "email": "basic_user@example.com",
        "password": "password123",
        "role_id": 2,
        "affiliation": "Company X",
        "orcid": "0000-0002-1825-0097",
        "bio": "A simple test user"
    }'
echo
echo
echo "Press enter to continue"
read

# 2. Fail: missing email
echo "=== POST /api/v1/users fail_no_email ==="
curl -s -X POST "$API_BASE_URL/users" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{
        "name": "No Email User",
        "password": "password123",
        "role_id": 2
    }'
echo
echo
echo "Press enter to continue"
read

# 3. Success: short password
echo "=== POST /api/v1/users success_short_password ==="
curl -s -X POST "$API_BASE_URL/users" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{
        "name": "Short Pass User",
        "email": "short_pass@example.com",
        "password": "123",
        "role_id": 2
    }'
echo
echo
echo "Press enter to continue"
read

# 4. Create detailed user
echo "=== POST /api/v1/users detailed_user ==="
curl -s -X POST "$API_BASE_URL/users" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{
        "name": "Detailed User",
        "email": "detailed_user@example.com",
        "password": "supersecret",
        "role_id": 2,
        "affiliation": "University X",
        "orcid": "0000-0002-1825-0097",
        "bio": "Short bio here"
    }'
echo
echo
