#!/usr/bin/env bash
# Junipr API — PDF from Raw HTML
#
# Generates a PDF from an inline HTML string.
# Useful for invoices, reports, or any custom document.
#
# Usage:
#   export JUNIPR_API_KEY="your_key"
#   ./pdf-from-html.sh [output.pdf]

set -euo pipefail

OUTPUT="${1:-output.pdf}"

# Example HTML — replace with your own
HTML='<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 40px; }
    h1 { color: #1a1a1a; }
    .info { color: #666; margin-top: 8px; }
  </style>
</head>
<body>
  <h1>Hello from Junipr</h1>
  <p class="info">This PDF was generated from raw HTML using the Junipr API.</p>
</body>
</html>'

# Use a temp file to handle complex HTML without escaping issues
TMPFILE=$(mktemp)
trap 'rm -f "${TMPFILE}"' EXIT

jq -n --arg html "${HTML}" '{
  html: $html,
  format: "A4",
  print_background: true,
  margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" }
}' > "${TMPFILE}"

curl -s -X POST "https://api.junipr.io/v1/pdf" \
  -H "X-API-Key: ${JUNIPR_API_KEY:?Set JUNIPR_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @"${TMPFILE}" \
  -o "${OUTPUT}"

echo "Saved to ${OUTPUT}"
