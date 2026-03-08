// Junipr API — Next.js OG Image Generator
//
// Generates dynamic Open Graph images by rendering an HTML template
// and capturing a screenshot via the Junipr API.
//
// Usage:
//   GET /api/og?title=Hello+World&description=My+awesome+page
//
// Deploy as part of a Next.js app. Set JUNIPR_API_KEY in your environment.

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const API_KEY = process.env.JUNIPR_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "JUNIPR_API_KEY is not configured" });
  }

  const { title = "Untitled", description = "", theme = "dark" } = req.query;

  // Build an HTML template for the OG image
  const bgColor = theme === "light" ? "#ffffff" : "#0a0a0a";
  const textColor = theme === "light" ? "#111111" : "#fafafa";
  const mutedColor = theme === "light" ? "#666666" : "#a1a1a1";

  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px;
      height: 630px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 80px;
      background: ${bgColor};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    h1 {
      font-size: 64px;
      font-weight: 700;
      color: ${textColor};
      line-height: 1.1;
      margin-bottom: 24px;
    }
    p {
      font-size: 28px;
      color: ${mutedColor};
      line-height: 1.4;
      max-width: 900px;
    }
    .footer {
      position: absolute;
      bottom: 40px;
      left: 80px;
      font-size: 20px;
      color: ${mutedColor};
      opacity: 0.6;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${description ? `<p>${escapeHtml(description)}</p>` : ""}
  <div class="footer">Generated with Junipr</div>
</body>
</html>`;

  try {
    const response = await fetch("https://api.junipr.io/v1/screenshot", {
      method: "POST",
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html,
        width: 1200,
        height: 630,
        format: "png",
        device: "desktop",
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return res.status(502).json({ error: error.message || "Screenshot generation failed" });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
    res.send(buffer);
  } catch (err) {
    console.error("OG image error:", err);
    res.status(500).json({ error: "Failed to generate OG image" });
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
