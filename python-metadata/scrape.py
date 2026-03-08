#!/usr/bin/env python3
"""
Junipr API — Metadata Scraper

Extracts metadata (title, description, OG tags, etc.) from a list of URLs
and outputs the results as CSV.

Usage:
    export JUNIPR_API_KEY="your_key"
    pip install httpx
    python scrape.py urls.txt                     # Print CSV to stdout
    python scrape.py urls.txt -o metadata.csv     # Save to file
"""

import argparse
import asyncio
import csv
import io
import os
import sys
from pathlib import Path

import httpx

API_BASE = "https://api.junipr.io"
API_KEY = os.environ.get("JUNIPR_API_KEY")

# CSV columns to extract from the API response
CSV_FIELDS = [
    "url",
    "title",
    "description",
    "og:title",
    "og:description",
    "og:image",
    "og:type",
    "twitter:card",
    "twitter:title",
    "favicon",
    "canonical",
    "language",
    "response_time_ms",
]


async def fetch_metadata(client: httpx.AsyncClient, url: str) -> dict:
    """Fetch metadata for a single URL."""
    try:
        response = await client.get(
            f"{API_BASE}/v1/metadata",
            params={"url": url},
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()

        # Flatten nested OG and Twitter fields into a single dict
        flat = {
            "url": data.get("url", url),
            "title": data.get("title"),
            "description": data.get("description"),
            "favicon": data.get("favicon"),
            "canonical": data.get("canonical"),
            "language": data.get("language"),
            "response_time_ms": data.get("response_time_ms"),
        }

        for key, value in data.get("og", {}).items():
            flat[f"og:{key}"] = value

        for key, value in data.get("twitter", {}).items():
            flat[f"twitter:{key}"] = value

        return flat

    except httpx.HTTPStatusError as e:
        print(f"  FAIL {url} -> HTTP {e.response.status_code}", file=sys.stderr)
        return {"url": url, "title": f"ERROR: HTTP {e.response.status_code}"}
    except Exception as e:
        print(f"  FAIL {url} -> {e}", file=sys.stderr)
        return {"url": url, "title": f"ERROR: {e}"}


async def main():
    if not API_KEY:
        print("Error: JUNIPR_API_KEY environment variable is not set.", file=sys.stderr)
        sys.exit(1)

    parser = argparse.ArgumentParser(description="Extract metadata from URLs using the Junipr API")
    parser.add_argument("urls_file", help="File containing one URL per line")
    parser.add_argument("-o", "--output", help="Output CSV file (default: stdout)")
    args = parser.parse_args()

    # Read URLs
    urls_path = Path(args.urls_file)
    if not urls_path.exists():
        print(f"Error: File not found: {urls_path}", file=sys.stderr)
        sys.exit(1)

    urls = [
        line.strip()
        for line in urls_path.read_text().splitlines()
        if line.strip() and not line.strip().startswith("#")
    ]

    if not urls:
        print("No URLs found in file.", file=sys.stderr)
        sys.exit(1)

    print(f"Fetching metadata for {len(urls)} URLs...\n", file=sys.stderr)

    async with httpx.AsyncClient(
        headers={"X-API-Key": API_KEY},
    ) as client:
        tasks = [fetch_metadata(client, url) for url in urls]
        results = await asyncio.gather(*tasks)

    # Write CSV
    output_stream = open(args.output, "w", newline="") if args.output else sys.stdout
    try:
        writer = csv.DictWriter(output_stream, fieldnames=CSV_FIELDS, extrasaction="ignore")
        writer.writeheader()
        for row in results:
            writer.writerow(row)
    finally:
        if args.output:
            output_stream.close()
            print(f"\nSaved to {args.output}", file=sys.stderr)

    print(f"\nDone: {len(results)} URLs processed", file=sys.stderr)


if __name__ == "__main__":
    asyncio.run(main())
