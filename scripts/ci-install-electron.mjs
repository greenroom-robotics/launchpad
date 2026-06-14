// Installs electron's prebuilt binary in CI.
//
// electron's own postinstall (and @electron/get) is unreliable on Node 24: its
// download promise never settles, so the process exits before the binary is
// extracted, leaving dist/ and path.txt missing ("Electron failed to install
// correctly"). This downloads the release zip with Node's native fetch and
// extracts it, all top-level-awaited so the process waits for completion.
import { createRequire } from 'node:module';
import { writeFileSync, createWriteStream, mkdirSync } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';
import os from 'node:os';

const require = createRequire(import.meta.url);
const extract = require('extract-zip');

const electronDir = path.resolve('node_modules/electron');
const { version } = require('electron/package.json');
const { platform, arch } = process;

const url = `https://github.com/electron/electron/releases/download/v${version}/electron-v${version}-${platform}-${arch}.zip`;
const zipPath = path.join(os.tmpdir(), `electron-v${version}-${platform}-${arch}.zip`);

const res = await fetch(url, { redirect: 'follow' });
if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
await pipeline(Readable.fromWeb(res.body), createWriteStream(zipPath));

mkdirSync(path.join(electronDir, 'dist'), { recursive: true });
await extract(zipPath, { dir: path.join(electronDir, 'dist') });

const binary = {
  linux: 'electron',
  win32: 'electron.exe',
  darwin: 'Electron.app/Contents/MacOS/Electron',
}[platform];
writeFileSync(path.join(electronDir, 'path.txt'), binary);

console.log(`electron ${version} ready: ${binary}`);
