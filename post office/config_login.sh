#!/bin/sh
# config_login.sh

. ./config.sh

get_bearer_token() {
    EMAIL="$1"
    PASSWORD="$2"

    if [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
        echo "Usage: get_bearer_token <email> <password>" >&2
        return 1
    fi

    RESPONSE=$(curl -s -X POST "$API_BASE_URL/login" \
        -H "Content-Type: application/json" \
        -d "$(printf '{"email":"%s","password":"%s"}' "$EMAIL" "$PASSWORD")")

    TOKEN=$(echo "$RESPONSE" | tr -d '[:space:]' | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')

    if [ -z "$TOKEN" ]; then
        echo "Login failed for $EMAIL" >&2
        return 1
    fi

    echo "$TOKEN"
}
