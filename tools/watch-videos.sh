#!/usr/bin/env bash
# Watch assets/videos/ and sync the moment a master is added or removed.
#
#   ./tools/watch-videos.sh            # sync only
#   ./tools/watch-videos.sh --deploy   # sync, then build + publish
#
# Ctrl-C to stop. Polls every 5s — no dependencies, no fswatch needed.
set -uo pipefail
cd "$(dirname "$0")/.."

DEPLOY=0
[ "${1:-}" = "--deploy" ] && DEPLOY=1

fingerprint() {
  # names + sizes of the masters; changes when a file is added, removed or replaced
  find assets/videos -maxdepth 1 -type f \
    \( -iname '*.mov' -o -iname '*.mp4' -o -iname '*.m4v' \) \
    -exec stat -f '%N %z' {} \; 2>/dev/null | sort
}

echo "watching assets/videos/ — drop a clip in and it goes up$([ $DEPLOY = 1 ] && echo ' and live')"
echo "(ctrl-c to stop)"
prev=$(fingerprint)

while true; do
  sleep 5
  curr=$(fingerprint)
  [ "$curr" = "$prev" ] && continue

  # let a big file finish copying before touching it
  until [ "$curr" = "$(sleep 3; fingerprint)" ]; do curr=$(fingerprint); done

  echo
  echo "── change detected $(date '+%H:%M:%S') ──"
  if node tools/sync-videos.mjs; then
    if [ $DEPLOY = 1 ]; then
      SKIP_SYNC=1 ./build.sh && npx wrangler deploy
    fi
  else
    echo "sync failed — fix the error above; still watching"
  fi
  prev=$(fingerprint)
done
