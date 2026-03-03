#!/bin/sh

. ./config.sh

echo
echo "=== GET /test/sanitization/help ==="
curl -X GET "$API_BASE_URL/test/sanitization/help"
echo
echo
echo "=== POST /test/sanitization ==="
curl -X POST "$API_BASE_URL/test/sanitization" \
     -H "Content-Type: application/json" \
     -d '{"email":"  UsEr@Example.COM  ","password":"  mySecret123  "}'

echo
