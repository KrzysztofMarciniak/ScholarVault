#!/bin/sh

# Load configuration
. ./config.sh

# Example test request
curl -X GET "$API_BASE_URL/test"
