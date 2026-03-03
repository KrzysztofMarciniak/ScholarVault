#!/bin/sh

. ./config.sh

echo
echo
curl -X GET "$API_BASE_URL/test/help"
echo
echo
curl -X GET "$API_BASE_URL/test"
