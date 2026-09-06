#!/usr/bin/env bash
# Betwixt dependencies installer
set -euo pipefail
cd "$(dirname "$0")"

helper="$(command -v paru || command -v yay || command -v pikaur || command -v trizen || true)"
[ -n "$helper" ] || { echo "No AUR helper found (paru/yay/pikaur/trizen)"; exit 1; }

echo "==> Using helper: $helper"
mapfile -t pkgs < <(grep -vE '^\s*(#|$)' ./requirements.list)
"$helper" -S --needed "${pkgs[@]}"

fc-cache -f
echo "==> Done"