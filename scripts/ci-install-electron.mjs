// Installs electron's prebuilt binary in CI.
//
// electron's postinstall (and its @electron/get / extract-zip deps) hangs or
// exits early on Node 24 — its promises never settle, leaving dist/ and
// path.txt missing ("Electron failed to install correctly"). This does the same
// work synchronously (curl + unzip/tar), so there is no async to stall.
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import os from 'node:os';

const require = createRequire(import.meta.url);
const electronDir = path.resolve('node_modules/electron');
const { version } = require('electron/package.json');
const { platform, arch } = process;

const url = `https://github.com/electron/electron/releases/download/v${version}/electron-v${version}-${platform}-${arch}.zip`;
const zipPath = path.join(os.tmpdir(), `electron-v${version}-${platform}-${arch}.zip`);
const dist = path.join(electronDir, 'dist');

execFileSync('curl', ['-fL', '--retry', '3', '-o', zipPath, url], { stdio: 'inherit' });
mkdirSync(dist, { recursive: true });
if (platform === 'win32') {
  execFileSync(
    'powershell',
    [
      '-NoProfile',
      '-Command',
      `Expand-Archive -LiteralPath '${zipPath}' -DestinationPath '${dist}' -Force`,
    ],
    { stdio: 'inherit' }
  );
} else {
  execFileSync('unzip', ['-q', '-o', zipPath, '-d', dist], { stdio: 'inherit' });
}
writeFileSync(
  path.join(electronDir, 'path.txt'),
  { linux: 'electron', win32: 'electron.exe', darwin: 'Electron.app/Contents/MacOS/Electron' }[
    platform
  ]
);

console.log(`electron ${version} ready`);
