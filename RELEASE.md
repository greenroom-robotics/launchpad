# Release Process

The project uses a tag-based release flow with semantic versioning. Pushing a `v*.*.*` tag triggers the release workflow.

## Creating a Release

1. Make sure `main` is green.
2. Tag and push:

   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```

3. The Release workflow validates the tag, builds for Windows/macOS/Linux, runs tests, and creates a **draft** GitHub release with auto-generated notes.
4. Review the draft on the [Releases page](../../releases), edit notes if needed, then publish.

Bumping `package.json` to match the tag before pushing is optional — the workflow injects the tag's version into the build. Bumping just keeps local dev builds showing the right version.

## Manual Trigger

From the [Actions tab](../../actions) → Release → "Run workflow", enter a tag name. The workflow creates the tag and runs the same flow.

## Release Artifacts

| Platform              | Filename                                        |
| --------------------- | ----------------------------------------------- |
| Windows               | `greenroom-launchpad-{version}-win-x64.exe`     |
| macOS (Apple Silicon) | `greenroom-launchpad-{version}-mac-arm64.dmg`   |
| Linux                 | `greenroom-launchpad-{version}-linux-amd64.deb` |

Each release also includes `*.zip` (macOS auto-update), `*.blockmap` (delta updates), and `latest*.yml` (electron-updater metadata).

Intel Mac builds are not currently produced.

## Auto-Updates

Update checks are opt-in and off by default. Release builds show the installed version in Settings → Updates regardless of network state, and a "Check for updates" button runs a check on demand. Users can enable "Check for updates automatically at startup" in the same panel; the preference is stored per user in `launchpad-update.json` and is not affected by "Reset to default".

Nothing is downloaded or installed without an explicit click: a found update shows a "Download update" button, and a downloaded update shows "Restart and install" plus an OS notification. Updates are never applied silently on quit. A downloaded update that is not installed stays cached, so on the next check "Download update" completes instantly.

Linux `.deb` clients update in-app too. electron-updater installs the package with `dpkg -i` through a graphical sudo helper (gksudo, kdesudo or pkexec, whichever is found first), so the system asks for an administrator password when the user clicks "Restart and install". The app is unresponsive while that prompt and the install run. Dismissing the prompt is reported as "Installation was cancelled". This needs a graphical polkit agent; on headless or kiosk installs without one, install the `.deb` manually from the releases page.

Clients on v0.0.7 or earlier cannot auto-update due to a filename mismatch in their installed `latest*.yml`; those users must manually install a newer release once. Clients on v0.0.8 through v0.0.10 still check and download on launch with the old defaults, so the transition differs by platform: Windows installs the next release silently on quit; Linux downloads it and then prompts for an administrator password at every app exit until it is installed; macOS fails because the builds are unsigned, and those users must install manually.

## Version Numbering

[Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`. Tags must match `v{MAJOR}.{MINOR}.{PATCH}` exactly (no pre-release suffixes).

## Retrying a Failed Release

```bash
git push origin :refs/tags/v1.2.3   # delete remote tag
git tag -d v1.2.3                   # delete local tag
# delete the draft release on GitHub, push a fix, then re-tag
```

## Distribution Channels

- `release` — used by the Release workflow. Ships plain semver and propagates via `latest.yml`.
- `dev` — used by main-branch CI for validation builds. Auto-updater is inactive on non-release channels.
