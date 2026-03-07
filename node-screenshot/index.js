#!/usr/bin/env node

// Junipr API — Node.js Screenshot Example
// Captures a screenshot of any URL and saves it to a file.
//
// Usage:
//   export JUNIPR_API_KEY="your_key"
//   node index.js https://example.com [output.png]

import { writeFile } from "node:fs/promises";
import { basename } from "node:path";

const API_BASE = "https://api.junipr.io";
const API_KEY = process.env.JUNIPR_API_KEY;

if (!API_KEY) {
  console.error("Error: JUNIPR_API_KEY environment variable is not set.");
  process.exit(1);
}

const url = process.argv[2];
if (!url) {
  console.error("Usage: node index.js <url> [output.png]");
  process.exit(1);
}

// Output filename defaults to the hostname + .png
const defaultName = new URL(url).hostname.replace(/\./g, "-") + ".png";
const output = process.argv[3] || defaultName;

async function captureScreenshot(targetUrl, options = {}) {
  const body = {
    url: targetUrl,
    format: options.format || "png",
    width: options.width || 1280,
    height: options.height || 720,
    full_page: options.fullPage || false,
    device: options.device || "desktop",
  };

  const response = await fetch(`${API_BASE}/v1/screenshot`, {
    method: "POST",
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`API error ${response.status}: ${error.message}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

// Run
console.log(`Capturing screenshot of ${url}...`);

try {
  const imageBuffer = await captureScreenshot(url);
  await writeFile(output, imageBuffer);
  console.log(`Saved to ${output} (${(imageBuffer.length / 1024).toFixed(1)} KB)`);
} catch (err) {
  console.error(`Failed: ${err.message}`);
  process.exit(1);
}
