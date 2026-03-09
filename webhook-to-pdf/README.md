# Webhook to PDF

A microservice that receives webhook JSON payloads, renders them as HTML documents, and returns PDFs via the Junipr API. Useful for generating invoices, reports, or receipts on the fly.

## Requirements

- Node.js 18+
- A Junipr API key

## Setup

```bash
npm install
export JUNIPR_API_KEY="your_key_here"
```

## Usage

```bash
npm start
```

Then send a webhook payload:

```bash
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Invoice #123",
    "date": "2026-03-10",
    "items": [
      { "name": "Widget", "qty": 2, "price": 9.99 },
      { "name": "Gadget", "qty": 1, "price": 24.50 }
    ],
    "notes": "Payment due within 30 days."
  }' \
  -o invoice.pdf
```

## Payload Format

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Document title (default: "Document") |
| `date` | string | Display date (default: today) |
| `items` | array | Line items with `name`, `qty`, `price` |
| `notes` | string | Footer notes |

If no `items` array is provided, the full JSON payload is rendered as a formatted code block.

## Customization

Edit the `buildHtml()` function in `server.js` to match your document template. The HTML is sent to Junipr's PDF API, so you can use any CSS that works in a browser.
