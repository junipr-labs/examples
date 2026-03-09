// Junipr API — Webhook to PDF
//
// Receives a webhook JSON payload, renders it as an HTML document,
// and returns a PDF. Useful for converting invoices, reports, or
// notifications into PDF format on the fly.
//
// Usage:
//   export JUNIPR_API_KEY="your_key"
//   npm install
//   node server.js
//
// Then POST a JSON payload:
//   curl -X POST http://localhost:3001/webhook \
//     -H "Content-Type: application/json" \
//     -d '{"title":"Invoice #123","items":[{"name":"Widget","qty":2,"price":9.99}]}' \
//     -o invoice.pdf

import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const API_BASE = "https://api.junipr.io";
const API_KEY = process.env.JUNIPR_API_KEY;

if (!API_KEY) {
  console.error("Error: JUNIPR_API_KEY environment variable is not set.");
  process.exit(1);
}

/**
 * Build an HTML document from the webhook payload.
 * Customize this template to match your use case.
 */
function buildHtml(data) {
  const title = data.title || "Document";
  const date = data.date || new Date().toLocaleDateString();
  const items = data.items || [];

  const rows = items
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(item.name || "")}</td>
        <td style="text-align:center">${item.qty || 1}</td>
        <td style="text-align:right">$${(item.price || 0).toFixed(2)}</td>
        <td style="text-align:right">$${((item.qty || 1) * (item.price || 0)).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const total = items.reduce((sum, item) => sum + (item.qty || 1) * (item.price || 0), 0);

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 40px;
      color: #1a1a1a;
      line-height: 1.6;
    }
    h1 { font-size: 28px; margin-bottom: 4px; }
    .date { color: #666; margin-bottom: 32px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 10px 12px; border-bottom: 1px solid #e5e5e5; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
    .total { font-weight: 700; font-size: 18px; text-align: right; margin-top: 20px; }
    .notes { margin-top: 40px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="date">${escapeHtml(date)}</div>
  ${
    items.length > 0
      ? `<table>
        <thead>
          <tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="total">Total: $${total.toFixed(2)}</div>`
      : `<pre style="background:#f5f5f5;padding:20px;border-radius:8px;overflow-x:auto">${escapeHtml(JSON.stringify(data, null, 2))}</pre>`
  }
  ${data.notes ? `<div class="notes">${escapeHtml(data.notes)}</div>` : ""}
</body>
</html>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// --- Routes ---

app.post("/webhook", async (req, res) => {
  const data = req.body;

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ error: "Empty payload. Send a JSON body." });
  }

  const html = buildHtml(data);

  try {
    const response = await fetch(`${API_BASE}/v1/pdf`, {
      method: "POST",
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html,
        format: "A4",
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
        print_background: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return res.status(502).json({ error: error.message || "PDF generation failed" });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    res.set("Content-Type", "application/pdf");
    res.set("Content-Disposition", 'attachment; filename="document.pdf"');
    res.send(buffer);
  } catch (err) {
    console.error("PDF generation error:", err.message);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Webhook-to-PDF server running on http://localhost:${PORT}`);
  console.log(`\nTry:`);
  console.log(`  curl -X POST http://localhost:${PORT}/webhook \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"title":"Invoice #123","items":[{"name":"Widget","qty":2,"price":9.99}]}' \\`);
  console.log(`    -o invoice.pdf`);
});
