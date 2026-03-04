#!/bin/sh

. ./config.sh
. ./config_login.sh

# Admin / Author credentials
AUTHOR_EMAIL="author@example.com"
AUTHOR_PASSWORD="author"

# Get bearer token
AUTHOR_TOKEN=$(get_bearer_token "$AUTHOR_EMAIL" "$AUTHOR_PASSWORD")

echo "=== POST /api/v1/articles (submit PDF article) ==="

curl -s -X POST "$API_BASE_URL/articles" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $AUTHOR_TOKEN" \
    -F "title=Test PDF Article" \
    -F "abstract=This is a test PDF article submission." \
    -F "file=@test.pdf" \
    -F "keywords[]=testing" \
    -F "keywords[]=pdf" | jq .

echo
echo "Submission complete."
echo "press any key to continue"
read

# === GET own articles (paginated) ===
echo "=== GET /api/v1/articles/my?page=1&per_page=10 ==="
curl -s -X GET "$API_BASE_URL/articles/my?page=1&per_page=10" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $AUTHOR_TOKEN" \
    | jq .

echo
echo "Listing complete."
echo "Enter to continue"
read

echo "=== GET /api/v1/articles/my/4 ==="

curl -s -X GET "$API_BASE_URL/articles/my/4" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $AUTHOR_TOKEN" \
    | jq .

echo "=== GET /api/v1/articles/my/999 ==="

curl -s -X GET "$API_BASE_URL/articles/my/999" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $AUTHOR_TOKEN" \
    | jq .
