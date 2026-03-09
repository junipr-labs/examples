#!/usr/bin/env bash
# Junipr API — Bulk Screenshots
#
# Reads URLs from a file and captures a screenshot of each one.
# Processes URLs sequentially — see the Python example for concurrent capture.
#
# Usage:
#   export JUNIPR_API_KEY="your_key"
#   ./bulk-screenshots.sh urls.txt [output_dir]

set -euo pipefail

URLS_FILE="${1:?Usage: ./bulk-screenshots.sh <urls_file> [output_dir]}"
OUTPUT_DIR="${2:-screenshots}"

if [[ ! -f "${URLS_FILE}" ]]; then
  echo "Error: File not found: ${URLS_FILE}" >&2
  exit 1
fi

mkdir -p "${OUTPUT_DIR}"

TOTAL=0
OK=0
FAIL=0

while IFS= read -r url; do
  # Skip empty lines and comments
  [[ -z "${url}" || "${url}" == \#* ]] && continue

  TOTAL=$((TOTAL + 1))

  # Generate filename from hostname
  hostname=$(echo "${url}" | sed -E 's|https?://||; s|/.*||; s/\./-/g')
  output="${OUTPUT_DIR}/${hostname}.png"

  # Avoid overwriting
  counter=1
  while [[ -f "${output}" ]]; do
    output="${OUTPUT_DIR}/${hostname}-${counter}.png"
    counter=$((counter + 1))
  done

  printf "  [%d] %s ... " "${TOTAL}" "${url}"

  HTTP_CODE=$(curl -s -w "%{http_code}" -X POST "https://api.junipr.io/v1/screenshot" \
    -H "X-API-Key: ${JUNIPR_API_KEY:?Set JUNIPR_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"url\": \"${url}\", \"format\": \"png\", \"width\": 1280, \"height\": 720}" \
    -o "${output}")

  if [[ "${HTTP_CODE}" == "200" ]]; then
    SIZE=$(du -h "${output}" | cut -f1)
    echo "OK (${SIZE})"
    OK=$((OK + 1))
  else
    echo "FAIL (HTTP ${HTTP_CODE})"
    rm -f "${output}"
    FAIL=$((FAIL + 1))
  fi
done < "${URLS_FILE}"

echo ""
echo "Done: ${OK} succeeded, ${FAIL} failed out of ${TOTAL} URLs"
