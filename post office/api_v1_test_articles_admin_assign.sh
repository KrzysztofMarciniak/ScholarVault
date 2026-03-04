#!/bin/sh

# Load configuration
. ./config.sh
. ./config_login.sh

# ----------------------
# Step 1: Submit article
# ----------------------
AUTHOR_EMAIL="author@example.com"
AUTHOR_PASSWORD="author"

AUTHOR_TOKEN=$(get_bearer_token "$AUTHOR_EMAIL" "$AUTHOR_PASSWORD")

echo "=== POST /api/v1/articles (submit PDF article) ==="

ARTICLE_RESPONSE=$(curl -s -X POST "$API_BASE_URL/articles" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $AUTHOR_TOKEN" \
    -F "title=Test PDF Article" \
    -F "abstract=This is a test PDF article submission." \
    -F "file=@test.pdf" \
    -F "keywords[]=testing" \
    -F "keywords[]=pdf" | jq .)

echo "$ARTICLE_RESPONSE" | jq .
ARTICLE_ID=$(echo "$ARTICLE_RESPONSE" | jq -r '.data.id')

echo
echo "Submission complete. Article ID: $ARTICLE_ID"
echo "Press enter to continue"
read

# ----------------------
# Step 2: Assign reviewers
# ----------------------
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin"

ADMIN_TOKEN=$(get_bearer_token "$ADMIN_EMAIL" "$ADMIN_PASSWORD")

# Reviewer IDs to assign (must exist and have reviewer role)
REVIEWERS="[2]"

echo "=== PATCH /api/v1/articles/$ARTICLE_ID/reviewers (assign reviewers) ==="

curl -s -X PATCH "$API_BASE_URL/articles/$ARTICLE_ID/reviewers" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{
        \"reviewers\": $REVIEWERS
    }" | jq .

echo
echo "Reviewers assignment complete."
echo "Press enter to finish"
read
