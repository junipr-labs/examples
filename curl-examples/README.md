# curl Examples

Shell scripts for every Junipr API endpoint. No dependencies beyond `curl` and `jq`.

## Setup

```bash
export JUNIPR_API_KEY="your_key_here"
chmod +x *.sh
```

## Scripts

### `screenshot.sh` — Basic Screenshot

```bash
./screenshot.sh https://example.com
./screenshot.sh https://example.com my-screenshot.png
```

### `pdf-from-url.sh` — PDF from URL

```bash
./pdf-from-url.sh https://example.com
./pdf-from-url.sh https://example.com report.pdf
```

### `pdf-from-html.sh` — PDF from Raw HTML

```bash
./pdf-from-html.sh
./pdf-from-html.sh invoice.pdf
```

Requires `jq` to safely encode the HTML payload.

### `metadata.sh` — Metadata Extraction

```bash
./metadata.sh https://example.com
```

Outputs formatted JSON with title, description, OG tags, Twitter cards, favicon, and more.

### `bulk-screenshots.sh` — Bulk Screenshots

```bash
./bulk-screenshots.sh urls.txt
./bulk-screenshots.sh urls.txt ./my-screenshots
```

Reads one URL per line from a file and saves screenshots to the output directory.
