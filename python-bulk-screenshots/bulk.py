#!/usr/bin/env python3
"""
Junipr API — Bulk Screenshot Tool

Reads URLs from a file and captures screenshots concurrently using asyncio + httpx.

Usage:
    export JUNIPR_API_KEY="your_key"
    pip install httpx
    python bulk.py urls.txt [--output-dir screenshots] [--concurrency 5]
"""

import argparse
import asyncio
import os
import sys
from pathlib import Path
from urllib.parse import urlparse

import httpx

API_BASE = "https://api.junipr.io"
API_KEY = os.environ.get("JUNIPR_API_KEY")


async def capture_screenshot(
    client: httpx.AsyncClient,
    url: str,
    output_dir: Path,
    semaphore: asyncio.Semaphore,
) -> dict:
    """Capture a single screenshot and save it to disk."""
    async with semaphore:
        hostname = urlparse(url).hostname or "unknown"
        filename = hostname.replace(".", "-") + ".png"
        output_path = output_dir / filename

        # Avoid overwriting — add a suffix if needed
        counter = 1
        while output_path.exists():
            output_path = output_dir / f"{hostname.replace('.', '-')}-{counter}.png"
            counter += 1

        try:
            response = await client.post(
                f"{API_BASE}/v1/screenshot",
                json={
                    "url": url,
                    "format": "png",
                    "width": 1280,
                    "height": 720,
                    "full_page": False,
                },
                timeout=60.0,
            )
            response.raise_for_status()

            output_path.write_bytes(response.content)
            size_kb = len(response.content) / 1024
            print(f"  OK  {url} -> {output_path.name} ({size_kb:.1f} KB)")
            return {"url": url, "status": "ok", "file": str(output_path)}

        except httpx.HTTPStatusError as e:
            print(f"  FAIL {url} -> HTTP {e.response.status_code}")
            return {"url": url, "status": "error", "error": str(e)}
        except Exception as e:
            print(f"  FAIL {url} -> {e}")
            return {"url": url, "status": "error", "error": str(e)}


async def main():
    if not API_KEY:
        print("Error: JUNIPR_API_KEY environment variable is not set.", file=sys.stderr)
        sys.exit(1)

    parser = argparse.ArgumentParser(description="Bulk screenshot capture with the Junipr API")
    parser.add_argument("urls_file", help="File containing one URL per line")
    parser.add_argument("--output-dir", default="screenshots", help="Output directory (default: screenshots)")
    parser.add_argument("--concurrency", type=int, default=5, help="Max concurrent requests (default: 5)")
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

    # Prepare output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Capturing {len(urls)} screenshots (concurrency: {args.concurrency})...\n")

    semaphore = asyncio.Semaphore(args.concurrency)

    async with httpx.AsyncClient(
        headers={
            "X-API-Key": API_KEY,
            "Content-Type": "application/json",
        },
    ) as client:
        tasks = [capture_screenshot(client, url, output_dir, semaphore) for url in urls]
        results = await asyncio.gather(*tasks)

    # Summary
    ok = sum(1 for r in results if r["status"] == "ok")
    failed = sum(1 for r in results if r["status"] == "error")
    print(f"\nDone: {ok} succeeded, {failed} failed")


if __name__ == "__main__":
    asyncio.run(main())
