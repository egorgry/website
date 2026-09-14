// scripts/build.mjs
//
// Assembles the whole site into /dist for Cloudflare Pages to deploy:
//   - sites/launchpad          -> dist/                (the root tile page)
//   - sites/record-collection  -> dist/RecordCollection/
//   - apps/resume (built)      -> dist/resume/
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

// 2. Build the resume app (Vite). Skips gracefully if it's not set up yet,
//    so the rest of the site can still be worked on independently.
const resumeDir = path.join(root, 'apps/resume');
const resumeHasPackageJson = existsSync(path.join(resumeDir, 'package.json'));

if (resumeHasPackageJson) {
  log('Building apps/resume');
  execSync('npm ci', { cwd: resumeDir, stdio: 'inherit' });
  execSync('npm run build', { cwd: resumeDir, stdio: 'inherit' });
} else {
  console.warn('  (skipping resume build — apps/resume/package.json not found yet)');
}

// 3. Copy each piece into place.
const copies = [
  { from: 'sites/launchpad', to: '.' },
  { from: 'sites/record-collection', to: 'RecordCollection' },
  ...(resumeHasPackageJson ? [{ from: 'apps/resume/dist', to: 'resume' }] : []),
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
