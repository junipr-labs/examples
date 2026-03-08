# Express Screenshot Proxy

A lightweight microservice that proxies screenshot requests to the Junipr API with built-in rate limiting. Useful for exposing screenshot functionality to your frontend without revealing your API key.

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

Then make requests:

```bash
# Basic screenshot
curl "http://localhost:3000/screenshot?url=https://example.com" -o screenshot.png

# With options
curl "http://localhost:3000/screenshot?url=https://example.com&format=jpeg&width=1920&full_page=true" -o screenshot.jpg
```

## API

### `GET /screenshot`

| Parameter | Default | Description |
|-----------|---------|-------------|
| `url` | (required) | URL to screenshot |
| `format` | `png` | Image format: `png`, `jpeg`, `webp` |
| `width` | `1280` | Viewport width |
| `height` | `720` | Viewport height |
| `full_page` | `false` | Capture full scrollable page |
| `device` | `desktop` | Device preset: `desktop`, `mobile`, `tablet` |

### `GET /health`

Returns `{ "status": "ok" }`.

## Rate Limiting

The proxy includes a simple in-memory rate limiter: 20 requests per minute per IP. Requests beyond the limit receive a `429` response with a `Retry-After` header.
