# Python Metadata Scraper

Extract metadata (title, description, OG tags, Twitter cards, favicons, etc.) from a list of URLs and export as CSV.

## Requirements

- Python 3.8+
- A Junipr API key

## Setup

```bash
pip install -r requirements.txt
export JUNIPR_API_KEY="your_key_here"
```

## Usage

```bash
# Print CSV to stdout
python scrape.py urls.txt

# Save to a file
python scrape.py urls.txt -o metadata.csv
```

## Output

The CSV includes these columns:

| Column | Description |
|--------|-------------|
| `url` | Final URL (after redirects) |
| `title` | Page title |
| `description` | Meta description |
| `og:title` | Open Graph title |
| `og:description` | Open Graph description |
| `og:image` | Open Graph image URL |
| `og:type` | Open Graph type |
| `twitter:card` | Twitter card type |
| `twitter:title` | Twitter card title |
| `favicon` | Favicon URL |
| `canonical` | Canonical URL |
| `language` | Page language |
| `response_time_ms` | API response time |

## URL File Format

One URL per line. Lines starting with `#` are ignored.
