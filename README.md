# Junipr API Examples

Copy-paste-ready integration examples for the [Junipr API](https://junipr.io) — screenshots, PDFs, and metadata extraction.

## Getting Started

1. Sign up at [junipr.io](https://junipr.io) and grab your API key
2. Set it as an environment variable:

```bash
export JUNIPR_API_KEY="your_api_key_here"
```

3. Pick an example below and run it

## Examples

| Example | Description | Language |
|---------|-------------|----------|
| [node-screenshot](./node-screenshot) | Capture a screenshot from the command line | Node.js |
| [node-pdf](./node-pdf) | Generate a PDF from a URL or HTML file | Node.js |
| [python-bulk-screenshots](./python-bulk-screenshots) | Bulk screenshot capture with async concurrency | Python |
| [python-metadata](./python-metadata) | Scrape metadata from URLs and export as CSV | Python |
| [express-proxy](./express-proxy) | Screenshot proxy microservice with rate limiting | Node.js / Express |
| [nextjs-og-image](./nextjs-og-image) | Dynamic OG image generation via API route | Next.js |
| [webhook-to-pdf](./webhook-to-pdf) | Convert incoming webhook payloads to PDF documents | Node.js / Express |
| [curl-examples](./curl-examples) | Shell scripts for every API endpoint | Bash / curl |

## API Reference

**Base URL:** `https://api.junipr.io`

**Authentication:** Pass your API key in the `X-API-Key` header.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/screenshot` | Capture a webpage screenshot |
| `POST` | `/v1/pdf` | Generate a PDF from a URL or raw HTML |
| `GET`  | `/v1/metadata?url=...` | Extract metadata from a URL |

See the [full documentation](https://junipr.io/docs) for all parameters and options.

## License

[MIT](./LICENSE)
