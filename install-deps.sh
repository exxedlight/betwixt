#!/usr/bin/env bash
# Betwixt dependencies installer
set -euo pipefail
cd "$(dirname "$0")"

helper="$(command -v paru || command -v yay || command -v pikaur || command -v trizen || true)"
[ -n "$helper" ] || { echo "No AUR helper found (paru/yay/pikaur/trizen)"; exit 1; }

echo "==> Using helper: $helper"
grep -vE '^\s*(#|$)' ./requirements.list | xargs "$helper" -S --needed

fc-cache -f
echo "==> Done"
