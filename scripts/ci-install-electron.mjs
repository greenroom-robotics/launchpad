// Installs electron's prebuilt binary in CI.
//
// electron's own postinstall is unreliable on Node 24: it floats its
// download/extract promise, and Node 24 exits the moment the event loop is
// momentarily empty — before the promise settles — so dist/ and path.txt end
// up missing ("Electron failed to install correctly"). We do the same work
// (download the release zip, extract it, write path.txt) but hold a timer open
// so the process can't exit until everything has settled.
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
const binary = {
  linux: 'electron',
  win32: 'electron.exe',
  darwin: 'Electron.app/Contents/MacOS/Electron',
}[platform];

const keepAlive = setInterval(() => {}, 1000);
try {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(zipPath));

  mkdirSync(path.join(electronDir, 'dist'), { recursive: true });
  await extract(zipPath, { dir: path.join(electronDir, 'dist') });
  writeFileSync(path.join(electronDir, 'path.txt'), binary);

  console.log(`electron ${version} ready: ${binary}`);
} finally {
  clearInterval(keepAlive);
}
