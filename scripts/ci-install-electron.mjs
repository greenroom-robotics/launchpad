// Installs electron's prebuilt binary in CI.
//
// On Node 24, electron's own postinstall (node install.js) exits before its
// download/extract promise settles — it floats the promise, and a pending
// promise alone does not keep the event loop alive — leaving dist/ and
// path.txt missing so the build fails with "Electron failed to install
// correctly". This script does the same work but with top-level await, so the
// process stays alive until the binary is fully extracted.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { downloadArtifact } = require('@electron/get');
const extract = require('extract-zip');

const electronDir = path.resolve('node_modules/electron');
const { version } = require('electron/package.json');

const binary = {
  linux: 'electron',
  win32: 'electron.exe',
  darwin: 'Electron.app/Contents/MacOS/Electron',
}[process.platform];

const zip = await downloadArtifact({
  version,
  artifactName: 'electron',
  platform: process.platform,
  arch: process.arch,
});
await extract(zip, { dir: path.join(electronDir, 'dist') });
writeFileSync(path.join(electronDir, 'path.txt'), binary);

console.log(`electron ${version} ready: ${binary}`);
