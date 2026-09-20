#!/usr/bin/env bash
# Start the local admin and open it.
#   ./tools/admin.sh
set -euo pipefail
cd "$(dirname "$0")/.."
URL=http://127.0.0.1:4180
( sleep 1; command -v open >/dev/null && open "$URL" || true ) &
exec node tools/admin-server.mjs
