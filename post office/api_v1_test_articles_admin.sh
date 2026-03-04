#!/bin/sh

. ./config.sh
. ./config_login.sh

ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin"

ADMIN_TOKEN=$(get_bearer_token "$ADMIN_EMAIL" "$ADMIN_PASSWORD")

echo "=== GET /api/v1/articles (admin list all) ==="

curl -s -X GET "$API_BASE_URL/articles" \
    -H "Accept: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN"

echo
echo
echo "Press enter to continue"
read

