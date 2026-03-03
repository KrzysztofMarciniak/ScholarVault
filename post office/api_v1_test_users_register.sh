#!/bin/sh

. ./config.sh
. ./config_login.sh

echo "=== GET /register/help ==="
curl -s "$API_BASE_URL/register/help"
echo
echo

# 1. Basic user
echo "=== REGISTER basic_user@test_date_mail@example.com ==="
curl -s "$API_BASE_URL/register" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d '{"email":"basic_user@example.com","password":"password123"}'
echo
echo

echo "enter to continue"
read
# 2. Fail no email
echo "=== REGISTER fail_no_email ==="
curl -s "$API_BASE_URL/register" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d '{"name":"No Email User","password":"password123"}'
echo
echo

echo "enter to continue"
read
# 3. Fail short password
echo "=== REGISTER fail_short_password ==="
curl -s "$API_BASE_URL/register" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d '{"name":"Short Pass User","email":"short_pass@test_date_mail@example.com","password":"123"}'
echo
echo
echo "enter to continue"
read
# 4. Detailed user
echo "=== REGISTER detailed_user@test_date_mail@example.com ==="
curl -s "$API_BASE_URL/register" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d '{"name":"Detailed User","email":"detailed_user@example.com","password":"supersecret","affiliation":"University X","orcid":"0000-0002-1825-0097","bio":"Short bio here"}'
echo
echo
