// Junipr API — Express Screenshot Proxy
//
// A lightweight microservice that proxies screenshot requests to the Junipr API
// with built-in rate limiting. Useful for exposing screenshot functionality to
// your frontend without revealing your API key.
//
// Usage:
//   export JUNIPR_API_KEY="your_key"
//   npm install
//   node server.js
//
// Then:
//   GET http://localhost:3000/screenshot?url=https://example.com&format=png

import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE = "https://api.junipr.io";
const API_KEY = process.env.JUNIPR_API_KEY;

if (!API_KEY) {
  console.error("Error: JUNIPR_API_KEY environment variable is not set.");
  process.exit(1);
}

// --- Simple in-memory rate limiter ---

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 20; // requests per window per IP
const rateLimitStore = new Map();

function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  const entry = rateLimitStore.get(ip);

  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
    return next();
  }

  entry.count++;

  if (entry.count > RATE_LIMIT_MAX) {
    res.set("Retry-After", Math.ceil((entry.resetAt - now) / 1000).toString());
    return res.status(429).json({ error: "Rate limit exceeded. Try again later." });
  }

  next();
}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore) {
    if (now > entry.resetAt) rateLimitStore.delete(ip);
  }
}, 5 * 60_000);

// --- Routes ---

app.get("/screenshot", rateLimit, async (req, res) => {
  const { url, format = "png", width = "1280", height = "720", full_page = "false", device = "desktop" } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing required 'url' query parameter." });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL format." });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return res.status(400).json({ error: "Only http and https URLs are allowed." });
  }

  try {
    const response = await fetch(`${API_BASE}/v1/screenshot`, {
      method: "POST",
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        format,
        width: parseInt(width, 10),
        height: parseInt(height, 10),
        full_page: full_page === "true",
        device,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      return res.status(response.status).json({ error: error.message });
    }

    const contentType = response.headers.get("content-type");
    res.set("Content-Type", contentType || "image/png");
    res.set("Cache-Control", "public, max-age=900");

    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(502).json({ error: "Failed to capture screenshot." });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Screenshot proxy running on http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/screenshot?url=https://example.com`);
});
