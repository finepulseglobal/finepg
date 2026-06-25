#!/usr/bin/env bash
# seo_audit.sh – Comprehensive SEO audit for FinePulse static site
# ---------------------------------------------------------------
# Prerequisites (install if missing):
#   npm install -g lighthouse htmlhint
#   Ensure Google Chrome is installed and accessible as "google-chrome" or "chrome".
# ---------------------------------------------------------------
set -e

# Directories
BASE_DIR="$(dirname "$(realpath "$0") )/.."
OUTPUT_DIR="$BASE_DIR/artifacts/seo_audit"
mkdir -p "$OUTPUT_DIR"

# List of pages to audit (add/remove as needed)
PAGES=(
  "index.html"
  "team.html"
  "services.html"
  "blog.html"
  "careers.html"
  "contact.html"
  "faq.html"
  "privacy.html"
  "terms.html"
)

# Base URL for the site (adjust if hosted elsewhere)
BASE_URL="https://finepg.com"

# Run Lighthouse for each page (performance, SEO, best‑practices, accessibility)
for page in "${PAGES[@]}"; do
  url="$BASE_URL/$page"
  echo "Running Lighthouse on $url"
  lighthouse "$url" \
    --quiet \
    --output json \
    --output-path "$OUTPUT_DIR/${page%.*}.report.json" \
    --chrome-flags="--headless" \
    --only-categories=seo,performance,accessibility,best-practices || echo "Lighthouse failed for $url"
done

# Run HTMLHint on raw HTML files to catch markup issues
echo "Running HTMLHint on source files..."
htmlhint "$BASE_DIR"/*.html > "$OUTPUT_DIR/htmlhint_report.txt" || true

# Validate structured data (JSON‑LD) using Google's Structured Data Testing Tool API (if available)
# Note: For offline validation we simply extract <script type="application/ld+json"> blocks.
find "$BASE_DIR" -name "*.html" -exec grep -Poz "<script[^>]*type=\"application/ld\+json\"[^>]*>.*?</script>" {} + | jq . > "$OUTPUT_DIR/structured_data.json" 2>/dev/null || true

# Generate sitemap if missing (simple version)
if [ ! -f "$BASE_DIR/sitemap.xml" ]; then
  echo "Generating basic sitemap..."
  echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" > "$OUTPUT_DIR/sitemap_generated.xml"
  echo "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">" >> "$OUTPUT_DIR/sitemap_generated.xml"
  for page in "${PAGES[@]}"; do
    echo "  <url><loc>$BASE_URL/$page</loc></url>" >> "$OUTPUT_DIR/sitemap_generated.xml"
  done
  echo "</urlset>" >> "$OUTPUT_DIR/sitemap_generated.xml"
fi

# Summary
echo "SEO audit completed. Reports are in $OUTPUT_DIR"
