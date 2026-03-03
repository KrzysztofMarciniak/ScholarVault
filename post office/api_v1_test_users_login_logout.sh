#!/bin/sh

. ./config.sh

echo
echo "=== GET /login/help ==="
curl -s -X GET "$API_BASE_URL/login/help"
echo
echo

USERS='
admin@example.com:admin
reviewer@example.com:reviewer
author@example.com:author
'

for USER in $USERS; do
    EMAIL=$(echo $USER | cut -d':' -f1)
    PASSWORD=$(echo $USER | cut -d':' -f2)

    echo "=== LOGIN for $EMAIL ==="
    LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE_URL/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"  $EMAIL  \",\"password\":\"  $PASSWORD  \"}")

    echo "$LOGIN_RESPONSE"
    echo

    TOKEN=$(echo "$LOGIN_RESPONSE" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

    if [ -n "$TOKEN" ]; then
        echo "=== LOGOUT for $EMAIL ==="
        LOGOUT_RESPONSE=$(curl -s -X POST "$API_BASE_URL/login/logout" \
            -H "Authorization: Bearer $TOKEN")
        echo "$LOGOUT_RESPONSE"
        echo

        # --- SECOND LOGOUT CHECK ---
        echo "=== SECOND LOGOUT CHECK for $EMAIL ==="
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_BASE_URL/login/logout" \
            -H "Authorization: Bearer $TOKEN")

        if [ "$HTTP_CODE" -eq 500 ]; then
            echo "Token correctly revoked: $HTTP_CODE"
        elif [ "$HTTP_CODE" -eq 200 ]; then
            echo "WARNING: Token still valid: $HTTP_CODE"
        else
            echo "Unexpected response: $HTTP_CODE"
        fi
        echo
        echo
    else
        echo "Login failed for $EMAIL, skipping logout."
        echo
    fi
done
