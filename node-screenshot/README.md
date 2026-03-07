# Node.js Screenshot

Capture a webpage screenshot from the command line using Node.js and the Junipr API. No dependencies required — uses native `fetch`.

## Requirements

- Node.js 18+
- A Junipr API key

## Setup

```bash
export JUNIPR_API_KEY="your_key_here"
```

## Usage

```bash
# Basic screenshot (saves as example-com.png)
node index.js https://example.com

# Custom output filename
node index.js https://example.com my-screenshot.png
```

## Options

You can customize the screenshot by editing the options in `captureScreenshot()`:

| Option | Default | Description |
|--------|---------|-------------|
| `format` | `"png"` | Image format: `png`, `jpeg`, or `webp` |
| `width` | `1280` | Viewport width in pixels (320-3840) |
| `height` | `720` | Viewport height in pixels (240-2160) |
| `fullPage` | `false` | Capture the full scrollable page |
| `device` | `"desktop"` | Device preset: `desktop`, `mobile`, or `tablet` |
