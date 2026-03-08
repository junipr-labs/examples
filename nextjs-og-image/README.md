# Next.js OG Image Generator

A Next.js API route that generates dynamic Open Graph images. Pass a title and description as query params, and the route renders an HTML template into a PNG via the Junipr API.

## Requirements

- Next.js 12+ (Pages Router)
- A Junipr API key

## Setup

Add `JUNIPR_API_KEY` to your `.env.local`:

```
JUNIPR_API_KEY=your_key_here
```

Copy `pages/api/og.js` into your Next.js project.

## Usage

```
GET /api/og?title=Hello+World&description=My+awesome+page
```

### Query Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `title` | `"Untitled"` | Main heading text |
| `description` | (empty) | Subtitle text |
| `theme` | `"dark"` | Color theme: `dark` or `light` |

### In your HTML

```html
<meta property="og:image" content="https://yoursite.com/api/og?title=My+Page&description=A+great+page" />
```

The response is cached with `Cache-Control: public, max-age=3600, s-maxage=86400` for efficient CDN caching.
