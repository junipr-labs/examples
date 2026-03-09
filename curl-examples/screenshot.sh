#!/usr/bin/env bash
# Junipr API — Basic Screenshot
#
# Captures a screenshot of a URL and saves it as a PNG file.
#
# Usage:
#   export JUNIPR_API_KEY="your_key"
#   ./screenshot.sh https://example.com [output.png]

set -euo pipefail

URL="${1:?Usage: ./screenshot.sh <url> [output.png]}"
OUTPUT="${2:-screenshot.png}"

curl -s -X POST "https://api.junipr.io/v1/screenshot" \
  -H "X-API-Key: ${JUNIPR_API_KEY:?Set JUNIPR_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"${URL}\",
    \"format\": \"png\",
    \"width\": 1280,
    \"height\": 720,
    \"full_page\": false
  }" \
  -o "${OUTPUT}"

echo "Saved to ${OUTPUT}"
