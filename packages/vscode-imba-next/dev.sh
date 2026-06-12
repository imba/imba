#!/usr/bin/env bash
# Rebuild the tooling track and launch a VS Code extension-development host
# with the Imba Next preview. Prefers Insiders when installed (so the stable
# VS Code + old extension can keep running side by side).
#
#   ./dev.sh [project-dir]    (default: apps/imba.io in this repo)
set -e

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
PROJECT="${1:-$ROOT/apps/imba.io}"

INSIDERS="/Applications/Visual Studio Code - Insiders.app/Contents/Resources/app/bin/code"
if command -v code-insiders >/dev/null 2>&1; then
	CODE="code-insiders"
elif [ -x "$INSIDERS" ]; then
	CODE="$INSIDERS"
else
	CODE="code"
fi

echo "building tooling packages..."
(cd "$ROOT" && npx tsc -b \
	packages/imba-language-core \
	packages/imba-language-server \
	packages/imba-typescript-plugin \
	packages/vscode-imba-next)

echo "launching $CODE with extension dev host on $PROJECT"
# the old extension would double-serve .imba files — disable just that one
"$CODE" \
	--extensionDevelopmentPath="$HERE" \
	--disable-extension scrimba.vsimba \
	"$PROJECT"
