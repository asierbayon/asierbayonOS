#!/usr/bin/env bash
# Renders scripts/og/template.html to public/og.png (1200x630).
# Captured at 2x and downscaled so text and icon edges stay crisp.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

"$CHROME" \
  --headless=new \
  --hide-scrollbars \
  --force-device-scale-factor=2 \
  --window-size=1200,630 \
  --virtual-time-budget=8000 \
  --allow-file-access-from-files \
  --screenshot="$TMP/og@2x.png" \
  "file://$ROOT/scripts/og/template.html" >/dev/null 2>&1

sips --resampleHeightWidth 630 1200 "$TMP/og@2x.png" --out "$ROOT/public/og.png" >/dev/null
echo "Wrote public/og.png"
