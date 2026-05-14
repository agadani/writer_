#!/usr/bin/env node
// Build step: copy public/ -> dist/ and stamp git SHA into the version label
// and the service worker cache name. Run before `wrangler pages deploy dist`.
// Source files in public/ are never modified.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'public');
const DST = path.join(ROOT, 'dist');

const sh = cmd => execSync(cmd, { cwd: ROOT }).toString().trim();

let sha = 'unknown';
let dirty = false;
try {
  sha = sh('git rev-parse --short HEAD');
  dirty = sh('git status --porcelain') !== '';
} catch {
  // not a git repo, or no commits yet; fall through with sha=unknown
}
const tag = sha + (dirty ? '-dirty' : '');
const stamp = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

// Fresh copy
fs.rmSync(DST, { recursive: true, force: true });
fs.cpSync(SRC, DST, { recursive: true });

// Stamp the visible version label in index.html.
// Replace e.g. `// neural_draft_v2.6` -> `// neural_draft_v2.6 · abc1234`.
// Leaves the v2.X part alone so it stays a human-readable narrative version.
const htmlPath = path.join(DST, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
const labelRe = /\/\/ neural_draft_v[0-9.]+/;
const labelMatch = html.match(labelRe);
if (!labelMatch) throw new Error('build: could not find neural_draft version label to stamp');
html = html.replace(labelRe, `${labelMatch[0]} · ${tag}`);
fs.writeFileSync(htmlPath, html);

// Stamp the service worker cache name so each deploy busts old caches without
// us having to bump a number by hand.
const swPath = path.join(DST, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
const cacheRe = /const CACHE = 'writer-[^']+';/;
if (!cacheRe.test(sw)) throw new Error('build: could not find CACHE declaration in sw.js');
sw = sw.replace(cacheRe, `const CACHE = 'writer-${tag}';`);
fs.writeFileSync(swPath, sw);

console.log(`build: stamped ${tag} (${stamp}) into dist/`);
