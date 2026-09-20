#!/usr/bin/env bash
# Assemble dist/ — only the files the live site needs.
# The project root is ~4.2 GB (video + photo masters); dist/ is ~192 MB.
set -euo pipefail
cd "$(dirname "$0")"

# launchd starts the admin server with an absolute node path but a minimal
# PATH (/usr/bin:/bin:/usr/sbin:/sbin), so `node` and `npx` are not on it.
# Publishing from the admin shells out to this script and died on
# "node: command not found". Put the usual Homebrew bins back first.
case ":$PATH:" in
  *:/opt/homebrew/bin:*) ;;
  *) PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"; export PATH ;;
esac
command -v node >/dev/null || { echo "build.sh: node not found on PATH ($PATH)" >&2; exit 1; }

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

# strip junk: Finder metadata, and the .sb-* sidecars the macOS sandbox
# leaves behind when a file is removed or replaced mid-operation
find dist \( -name '.DS_Store' -o -name '*.sb-*' -o -name '*.part' \) -delete

echo "dist/ built — $(du -sh dist | cut -f1), $(find dist -type f | wc -l | tr -d ' ') files"
big=$(find dist -type f -size +25M)
if [ -n "$big" ]; then
  echo "WARNING: over Cloudflare's 25 MiB per-file limit:"; echo "$big"; exit 1
fi
