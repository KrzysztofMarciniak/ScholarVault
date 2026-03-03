#!/bin/sh

# API server configuration
API_HOST="127.0.0.1"
API_PORT="8000"
API_VERSION="v1"

# Construct full API base URL
API_BASE_URL="http://$API_HOST:$API_PORT/api/$API_VERSION"
