#!/usr/bin/env node

// Junipr API — Node.js PDF Generator
// Generates a PDF from a URL or a local HTML file.
//
// Usage:
//   export JUNIPR_API_KEY="your_key"
//   node index.js https://example.com                  # PDF from URL
//   node index.js --html invoice.html                  # PDF from local HTML file
//   node index.js https://example.com output.pdf       # Custom output name

import { readFile, writeFile } from "node:fs/promises";

const API_BASE = "https://api.junipr.io";
const API_KEY = process.env.JUNIPR_API_KEY;

if (!API_KEY) {
  console.error("Error: JUNIPR_API_KEY environment variable is not set.");
  process.exit(1);
}

async function generatePdf(options) {
  const body = {
    url: options.url,
    html: options.html,
    format: options.format || "A4",
    landscape: options.landscape || false,
    print_background: options.printBackground !== false,
    margin: options.margin || { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
  };

  const response = await fetch(`${API_BASE}/v1/pdf`, {
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

// Parse arguments
const args = process.argv.slice(2);
let options = {};
let output = "output.pdf";

if (args.length === 0) {
  console.error("Usage:");
  console.error("  node index.js <url> [output.pdf]");
  console.error("  node index.js --html <file.html> [output.pdf]");
  process.exit(1);
}

if (args[0] === "--html") {
  // Read HTML from a local file
  const htmlPath = args[1];
  if (!htmlPath) {
    console.error("Error: Provide an HTML file path after --html");
    process.exit(1);
  }
  const htmlContent = await readFile(htmlPath, "utf-8");
  options.html = htmlContent;
  output = args[2] || htmlPath.replace(/\.html?$/i, ".pdf") || "output.pdf";
  console.log(`Generating PDF from ${htmlPath}...`);
} else {
  // URL mode
  options.url = args[0];
  output = args[1] || new URL(args[0]).hostname.replace(/\./g, "-") + ".pdf";
  console.log(`Generating PDF from ${options.url}...`);
}

try {
  const pdfBuffer = await generatePdf(options);
  await writeFile(output, pdfBuffer);
  console.log(`Saved to ${output} (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);
} catch (err) {
  console.error(`Failed: ${err.message}`);
  process.exit(1);
}
