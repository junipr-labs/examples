# Node.js PDF Generator

Generate PDFs from URLs or local HTML files using the Junipr API. No dependencies required — uses native `fetch`.

## Requirements

- Node.js 18+
- A Junipr API key

## Setup

```bash
export JUNIPR_API_KEY="your_key_here"
```

## Usage

```bash
# PDF from a URL
node index.js https://example.com

# PDF from a local HTML file
node index.js --html invoice.html

# Custom output filename
node index.js https://example.com report.pdf
```

## Options

Edit the `generatePdf()` call to customize output:

| Option | Default | Description |
|--------|---------|-------------|
| `format` | `"A4"` | Page size: `A4`, `Letter`, `Legal`, `Tabloid`, `A3`, `A5` |
| `landscape` | `false` | Landscape orientation |
| `printBackground` | `true` | Include CSS backgrounds |
| `margin` | `1cm` all sides | Page margins (`top`, `right`, `bottom`, `left`) |
