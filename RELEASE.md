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

Release builds check for updates on launch. When one is downloaded, the user gets an OS notification and an in-app prompt to restart.

Linux `.deb` clients are notified but must install new releases manually — electron-updater cannot self-install deb packages.

Clients on v0.0.7 or earlier cannot auto-update due to a filename mismatch in their installed `latest*.yml`; those users must manually install v0.0.8 once, after which updates flow normally.

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
