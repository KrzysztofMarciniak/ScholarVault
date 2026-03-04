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

PER_PAGE=10
PAGE=1

echo "=== GET /api/v1/users (paginated list) ==="

while :; do
    RESPONSE=$(curl -s -G "$API_BASE_URL/users" \
        -H "Accept: application/json" \
        --data-urlencode "per_page=$PER_PAGE" \
        --data-urlencode "page=$PAGE")

    echo "=== Page $PAGE ==="
    echo "$RESPONSE" | jq .

    # Extract last_page from meta
    LAST_PAGE=$(echo "$RESPONSE" | jq -r '.meta.last_page')

    if [ "$PAGE" -ge "$LAST_PAGE" ]; then
        break
    fi

    PAGE=$((PAGE + 1))
    echo "Fetching next page..."
done

echo "All pages fetched."

PER_PAGE=10

echo "=== GET /api/v1/users/search (successful search: Administrator) ==="

PAGE=1
QUERY="Admin"

while :; do
    RESPONSE=$(curl -s -G "$API_BASE_URL/users/search" \
        -H "Accept: application/json" \
        --data-urlencode "q=$QUERY" \
        --data-urlencode "per_page=$PER_PAGE" \
        --data-urlencode "page=$PAGE")

    echo "=== Page $PAGE ==="
    echo "$RESPONSE" | jq .

    NEXT_URL=$(echo "$RESPONSE" | jq -r '.next_page_url')
    if [ "$NEXT_URL" = "null" ]; then
        break
    fi

    PAGE=$((PAGE + 1))
done

echo
echo "=== GET /api/v1/users/search (fail: single character query) ==="
PAGE=1
QUERY="A" # too short, should fail

RESPONSE=$(curl -s -G "$API_BASE_URL/users/search" \
    -H "Accept: application/json" \
    --data-urlencode "q=$QUERY" \
    --data-urlencode "per_page=$PER_PAGE")

echo "$RESPONSE" | jq .

ADMIN_TOKEN=$(get_bearer_token "$ADMIN_EMAIL" "$ADMIN_PASSWORD")

PER_PAGE=10
PAGE=1
QUERY="Author"  # adjust to match an existing user

echo "=== GET /api/v1/users/search?admin=1 (admin info) ==="

while :; do
    RESPONSE=$(curl -s -G "$API_BASE_URL/users/search" \
        -H "Accept: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        --data-urlencode "q=$QUERY" \
        --data-urlencode "per_page=$PER_PAGE" \
        --data-urlencode "page=$PAGE" \
        --data-urlencode "admin=1")

    echo "=== Page $PAGE ==="
    echo "$RESPONSE" | jq .

    NEXT_URL=$(echo "$RESPONSE" | jq -r '.next_page_url')
    if [ "$NEXT_URL" = "null" ]; then
        break
    fi

    PAGE=$((PAGE + 1))
done

# Get bearer token
ADMIN_TOKEN=$(get_bearer_token "$ADMIN_EMAIL" "$ADMIN_PASSWORD")

echo "=== PUT /api/v1/users/self (update bio) ==="

curl -s -X PUT "$API_BASE_URL/users/self" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{
        "bio": "test bio SELF"
    }' | jq .

# Get bearer token
ADMIN_TOKEN=$(get_bearer_token "$ADMIN_EMAIL" "$ADMIN_PASSWORD")

# Target user ID (Author)
AUTHOR_ID=1

echo "=== PATCH /api/v1/users/$AUTHOR_ID (change bio as admin) ==="

curl -s -X PATCH "$API_BASE_URL/users/$AUTHOR_ID" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{
        "bio": "Changed by admin."
    }' | jq .
# Get bearer token
ADMIN_TOKEN=$(get_bearer_token "$ADMIN_EMAIL" "$ADMIN_PASSWORD")

TARGET_USER_ID=5

echo "=== DELETE /api/v1/users/$TARGET_USER_ID (deactivate user as admin) ==="

curl -s -X DELETE "$API_BASE_URL/users/$TARGET_USER_ID" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq .


REVIEWER_EMAIL="reviewer@example.com"
REVIEWER_TOKEN=$(get_bearer_token "$REVIEWER_EMAIL" "reviewer")
echo "=== DELETE /api/v1/users/self (Reviewer deactivates self) ==="
curl -s -X DELETE "$API_BASE_URL/users/self" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $REVIEWER_TOKEN" | jq .

# Author credentials
AUTHOR_EMAIL="author@example.com"
AUTHOR_CURRENT_PASSWORD="author"

# Login as Author
AUTHOR_TOKEN=$(get_bearer_token "$AUTHOR_EMAIL" "$AUTHOR_CURRENT_PASSWORD")

# New password
NEW_PASSWORD="newauthorpass"

echo "=== PATCH /api/v1/users/self/password (Author changes password) ==="

curl -s -X PATCH "$API_BASE_URL/users/self/password" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $AUTHOR_TOKEN" \
    -d "{
        \"current_password\": \"$AUTHOR_CURRENT_PASSWORD\",
        \"new_password\": \"$NEW_PASSWORD\",
        \"password_confirmation\": \"$NEW_PASSWORD\"
    }" | jq .
