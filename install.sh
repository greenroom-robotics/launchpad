#!/usr/bin/env sh
# Install the latest Greenroom Launchpad on Linux (.deb) or macOS (Apple Silicon .dmg).
#
#   curl -fsSL https://raw.githubusercontent.com/greenroom-robotics/launchpad/main/install.sh | sh
#
# Pin a version:  curl -fsSL <url> | LAUNCHPAD_VERSION=v0.0.14 sh
# Windows users: see install.ps1.
set -eu

REPO="greenroom-robotics/launchpad"
BASE="https://github.com/${REPO}/releases"

info() { printf '==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || die "'$1' is required but not installed"; }

need curl

# Resolve the tag: pinned via LAUNCHPAD_VERSION, otherwise follow the /releases/latest redirect.
if [ -n "${LAUNCHPAD_VERSION:-}" ]; then
  TAG="$LAUNCHPAD_VERSION"
  case "$TAG" in v*) ;; *) TAG="v$TAG" ;; esac
else
  TAG="$(curl -fsSLI -o /dev/null -w '%{url_effective}' "${BASE}/latest")" || die "could not reach GitHub"
  TAG="${TAG##*/}"
fi
printf '%s' "$TAG" | grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+([-.][0-9A-Za-z.]+)?$' \
  || die "invalid or unresolvable release tag '$TAG' (expected e.g. v0.0.14)"
VERSION="${TAG#v}"

OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Linux)
    case "$ARCH" in
      x86_64 | amd64) ;;
      *) die "unsupported architecture '$ARCH' (only x86_64 .deb builds are published)" ;;
    esac
    command -v apt-get >/dev/null 2>&1 || die "only Debian/Ubuntu (.deb) is supported on Linux"
    FILE="greenroom-launchpad-${VERSION}-linux-amd64.deb"
    ;;
  Darwin)
    [ "$ARCH" = "arm64" ] || die "unsupported architecture '$ARCH' (only Apple Silicon builds are published)"
    FILE="greenroom-launchpad-${VERSION}-mac-arm64.dmg"
    ;;
  *)
    die "unsupported OS '$OS'. On Windows run install.ps1 (see README)."
    ;;
esac

TMP="$(mktemp -d)"
MNT=""
cleanup() {
  [ -n "$MNT" ] && hdiutil detach "$MNT" -quiet >/dev/null 2>&1 || true
  rm -rf "$TMP"
}
trap cleanup EXIT INT TERM

info "Downloading Greenroom Launchpad ${TAG}"
curl -fL --progress-bar -o "${TMP}/${FILE}" "${BASE}/download/${TAG}/${FILE}" \
  || die "download failed: ${BASE}/download/${TAG}/${FILE}"

info "Verifying checksum"
curl -fsSL -o "${TMP}/SHA256SUMS" "${BASE}/download/${TAG}/SHA256SUMS" \
  || die "could not download SHA256SUMS for ${TAG}; refusing to install an unverified build"
SHA="sha256sum"
command -v sha256sum >/dev/null 2>&1 || SHA="shasum -a 256"
# Only our file's line is checked; empty input (no entry) makes -c fail.
(cd "$TMP" && grep " ${FILE}\$" SHA256SUMS | $SHA -c - >/dev/null) \
  || die "checksum verification failed for ${FILE}"

if [ "$OS" = "Linux" ]; then
  SUDO=""
  if [ "$(id -u)" -ne 0 ]; then
    need sudo
    SUDO="sudo"
  fi
  info "Installing ${FILE}"
  $SUDO apt-get install -y "${TMP}/${FILE}"
else
  info "Installing to /Applications"
  MNT="${TMP}/mnt"
  mkdir -p "$MNT"
  hdiutil attach "${TMP}/${FILE}" -mountpoint "$MNT" -nobrowse -quiet
  APP="$(find "$MNT" -maxdepth 1 -name '*.app' | head -n 1)"
  [ -n "$APP" ] || die "no .app found in disk image"
  DEST="/Applications/$(basename "$APP")"
  if [ -d "$DEST" ]; then rm -rf "$DEST" 2>/dev/null || sudo rm -rf "$DEST"; fi
  cp -R "$APP" /Applications/ 2>/dev/null || sudo cp -R "$APP" /Applications/
  # Builds are unsigned; clear the quarantine flag so Gatekeeper doesn't block launch.
  xattr -dr com.apple.quarantine "$DEST" 2>/dev/null || sudo xattr -dr com.apple.quarantine "$DEST" 2>/dev/null || true
fi

info "Greenroom Launchpad ${TAG} installed."
