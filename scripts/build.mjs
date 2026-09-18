// scripts/build.mjs
//
// Assembles the whole site into /dist for the Worker to serve as static
// assets:
//   - sites/launchpad                 -> dist/                (the root tile page)
//   - apps/record-collection (built)  -> dist/RecordCollection/
//   - apps/resume (built)             -> dist/resume/
//
// To add another section later (e.g. a blog), build/copy it wherever
// you like, then add one line to the `copies` array below.

import { execSync } from 'node:child_process';
import { cpSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');

function log(msg) {
  console.log(`\n\x1b[1m→ ${msg}\x1b[0m`);
}

// 1. Clean slate
log('Cleaning dist/');
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

// 2. Build each Vite app under apps/. Skips one gracefully if its
//    package.json isn't there yet, so the rest of the site can still be
//    worked on independently.
function buildApp(name) {
  const dir = path.join(root, 'apps', name);
  const hasPackageJson = existsSync(path.join(dir, 'package.json'));
  if (!hasPackageJson) {
    console.warn(`  (skipping ${name} build — apps/${name}/package.json not found yet)`);
    return false;
  }
  log(`Building apps/${name}`);
  const hasLockfile = existsSync(path.join(dir, 'package-lock.json'));
  execSync(hasLockfile ? 'npm ci' : 'npm install', { cwd: dir, stdio: 'inherit' });
  execSync('npm run build', { cwd: dir, stdio: 'inherit' });
  return true;
}

const resumeBuilt = buildApp('resume');
const recordCollectionBuilt = buildApp('record-collection');

// 3. Copy each piece into place.
const copies = [
  { from: 'sites/launchpad', to: '.' },
  ...(recordCollectionBuilt ? [{ from: 'apps/record-collection/dist', to: 'RecordCollection' }] : []),
  ...(resumeBuilt ? [{ from: 'apps/resume/dist', to: 'resume' }] : []),
];

for (const { from, to } of copies) {
  const src = path.join(root, from);
  const dest = path.join(dist, to);
  if (!existsSync(src)) {
    console.warn(`  (skipping ${from} — not found)`);
    continue;
  }
  log(`Copying ${from} -> dist/${to === '.' ? '' : to}`);
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
}

log(`Build complete: ${dist}`);
