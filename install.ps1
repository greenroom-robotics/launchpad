# Install the latest Greenroom Launchpad on Windows (x64).
#
#   irm https://raw.githubusercontent.com/greenroom-robotics/launchpad/main/install.ps1 | iex
#
# Pin a version: $env:LAUNCHPAD_VERSION = 'v0.0.14'; irm <url> | iex
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$repo = 'greenroom-robotics/launchpad'
$base = "https://github.com/$repo/releases"

if (-not [Environment]::Is64BitOperatingSystem) { throw 'Only 64-bit Windows is supported.' }

if ($env:LAUNCHPAD_VERSION) {
  $tag = $env:LAUNCHPAD_VERSION
  if ($tag -notmatch '^v') { $tag = "v$tag" }
  if ($tag -notmatch '^v\d+\.\d+\.\d+([-.][0-9A-Za-z.]+)?$') { throw "Invalid LAUNCHPAD_VERSION '$tag' (expected e.g. v0.0.14)." }
} else {
  $tag = (Invoke-RestMethod "https://api.github.com/repos/$repo/releases/latest").tag_name
}
if ($tag -notmatch '^v\d+\.\d+\.\d+([-.][0-9A-Za-z.]+)?$') { throw "Could not determine latest release (got '$tag')." }
$version = $tag.TrimStart('v')

$file = "greenroom-launchpad-$version-win-x64.exe"
# Private per-run directory so another local process can't swap the file between verify and run.
$dir = Join-Path ([IO.Path]::GetTempPath()) ([IO.Path]::GetRandomFileName())
New-Item -ItemType Directory -Path $dir | Out-Null
$out = Join-Path $dir $file

try {
  Write-Host "==> Downloading Greenroom Launchpad $tag"
  Invoke-WebRequest -Uri "$base/download/$tag/$file" -OutFile $out
  Invoke-WebRequest -Uri "$base/download/$tag/SHA256SUMS" -OutFile (Join-Path $dir 'SHA256SUMS')

  Write-Host '==> Verifying checksum'
  $line = Select-String -Path (Join-Path $dir 'SHA256SUMS') -SimpleMatch $file | Select-Object -First 1
  if (-not $line) { throw "No checksum listed for $file; refusing to install an unverified build." }
  $expected = ($line.Line -split '\s+')[0]
  $actual = (Get-FileHash -Algorithm SHA256 -Path $out).Hash
  if ($actual -ne $expected) { throw "Checksum mismatch for $file (expected $expected, got $actual)." }

  Write-Host '==> Running installer'
  Start-Process -FilePath $out -Wait
  Write-Host "Greenroom Launchpad $tag installed."
} finally {
  Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
}
