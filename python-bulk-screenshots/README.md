# Python Bulk Screenshots

Capture screenshots of many URLs concurrently using asyncio and httpx.

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
# Capture screenshots for all URLs in a file
python bulk.py urls.txt

# Custom output directory and concurrency
python bulk.py urls.txt --output-dir ./my-screenshots --concurrency 10
```

Screenshots are saved to the `screenshots/` directory by default, named after each URL's hostname.

## URL File Format

One URL per line. Lines starting with `#` are ignored:

```
https://example.com
https://github.com
# This line is a comment
https://news.ycombinator.com
```
