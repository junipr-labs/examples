#!/usr/bin/env bash
# Junipr API — PDF from URL
#
# Generates a PDF from a webpage URL.
#
# Usage:
#   export JUNIPR_API_KEY="your_key"
#   ./pdf-from-url.sh https://example.com [output.pdf]

set -euo pipefail

URL="${1:?Usage: ./pdf-from-url.sh <url> [output.pdf]}"
OUTPUT="${2:-output.pdf}"

curl -s -X POST "https://api.junipr.io/v1/pdf" \
  -H "X-API-Key: ${JUNIPR_API_KEY:?Set JUNIPR_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"${URL}\",
    \"format\": \"A4\",
    \"print_background\": true,
    \"margin\": {
      \"top\": \"1cm\",
      \"right\": \"1cm\",
      \"bottom\": \"1cm\",
      \"left\": \"1cm\"
    }
  }" \
  -o "${OUTPUT}"

echo "Saved to ${OUTPUT}"
