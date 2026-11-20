#!/usr/bin/env bash
# Downloads this skill's assets/ folder (about 490 MB: audio library, fonts, style references,
# approved sample films) on demand, so the GitHub repo that carries the skill stays small.
# Pinned to the upstream commit this copy was taken from. Safe to run again: it skips if present.
#
#   bash scripts/fetch-assets.sh
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
REPO="https://github.com/kaomei/stickman-video-director"
COMMIT="8ea0e91134e15da1eed2f38ef9856dff436c87cd"
SUB="skills/directing-stickman-videos/assets"

if [ -f "$HERE/assets/.fetched-$COMMIT" ]; then
  echo "assets already present ($HERE/assets)"; exit 0
fi

TMP="$(mktemp -d)"
trap 'rm -rf -- "$TMP"' EXIT
git -C "$TMP" init -q
git -C "$TMP" remote add origin "$REPO"
git -C "$TMP" config core.sparseCheckout true
echo "$SUB/" > "$TMP/.git/info/sparse-checkout"
git -C "$TMP" fetch -q --depth 1 --filter=blob:none origin "$COMMIT"
git -C "$TMP" checkout -q FETCH_HEAD
mkdir -p "$HERE/assets"
cp -r "$TMP/$SUB/." "$HERE/assets/"
touch "$HERE/assets/.fetched-$COMMIT"
echo "assets ready: $(du -sh "$HERE/assets" | cut -f1) in $HERE/assets"
