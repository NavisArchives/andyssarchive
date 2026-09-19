#!/usr/bin/env bash
# Assemble dist/ — only the files the live site needs.
# The project root is ~4.2 GB (video + photo masters); dist/ is ~192 MB.
set -euo pipefail
cd "$(dirname "$0")"

# Pick up anything new in assets/videos/ before packaging.
# Skip with SKIP_SYNC=1 if you only want to repackage.
if [ "${SKIP_SYNC:-0}" != "1" ]; then
  node tools/sync-videos.mjs
fi

rm -rf dist
mkdir -p dist/assets

cp index.html styles.css script.js _headers robots.txt sitemap.xml dist/
cp ./*.txt dist/ 2>/dev/null || true       # robots + IndexNow key
cp assets/og.jpg          dist/assets/og.jpg
cp -R assets/logos        dist/assets/logos
cp -R assets/posters      dist/assets/posters
mkdir -p dist/assets/photos dist/assets/videos
cp -R assets/photos/web   dist/assets/photos/web
cp -R assets/videos/web   dist/assets/videos/web

# strip junk that sneaks in from Finder
find dist -name '.DS_Store' -delete

echo "dist/ built — $(du -sh dist | cut -f1), $(find dist -type f | wc -l | tr -d ' ') files"
big=$(find dist -type f -size +25M)
if [ -n "$big" ]; then
  echo "WARNING: over Cloudflare's 25 MiB per-file limit:"; echo "$big"; exit 1
fi
