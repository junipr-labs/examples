#!/usr/bin/env bash
# Junipr API — Metadata Extraction
#
# Extracts title, description, OG tags, Twitter cards, favicon, and more
# from any URL. Returns JSON.
#
# Usage:
#   export JUNIPR_API_KEY="your_key"
#   ./metadata.sh https://example.com

set -euo pipefail

URL="${1:?Usage: ./metadata.sh <url>}"

# URL-encode the target URL
ENCODED_URL=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${URL}', safe=''))" 2>/dev/null \
  || printf '%s' "${URL}" | jq -sRr @uri 2>/dev/null \
  || printf '%s' "${URL}")

curl -s "https://api.junipr.io/v1/metadata?url=${ENCODED_URL}" \
  -H "X-API-Key: ${JUNIPR_API_KEY:?Set JUNIPR_API_KEY}" | jq .
