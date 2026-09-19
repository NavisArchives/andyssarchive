#!/usr/bin/env node
/**
 * Keep the site in step with assets/videos/.
 *
 * Drop a master into assets/videos/ and this will:
 *   1. encode it to assets/videos/web/<name>.mp4   (720x1280, ~2.2 Mbps, faststart)
 *   2. pull a poster frame to assets/posters/<name>.jpg
 *   3. add it to the VIDEOS list in script.js, so it shows up on the site
 *
 * Delete a master and it does the reverse: the encode, the poster and the
 * list entry all go.
 *
 * Titles and categories you have already written are never touched — a new
 * entry gets a guessed title and empty `cats`, and waits for you to tag it.
 *
 * There is no ffmpeg on this machine, so the heavy lifting is two small
 * Swift/AVFoundation tools in this folder. They are compiled on first use
 * and cached in tools/bin/.
 *
 * Run directly, or let ./build.sh call it for you.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TOOLS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLS, '..');

const MASTERS = path.join(ROOT, 'assets/videos');
const ENCODES = path.join(MASTERS, 'web');
const POSTERS = path.join(ROOT, 'assets/posters');
const SCRIPT = path.join(ROOT, 'script.js');

const MASTER_EXT = new Set(['.mov', '.mp4', '.m4v']);   // matched case-insensitively
// Finder leaves these behind when you duplicate or re-download a file. They are
// byte-identical to the original, so publishing them would just double the clip.
const DUPLICATE = /(^|[ _-])copy( \d+)?$|\(\d+\)$/i;
const SHORT_SIDE = 720;
const BITRATE = 2_200_000;
const POSTER_AT = 2.0;        // seconds into the clip
const POSTER_WIDTH = 700;

const log = (...a) => console.log('  ', ...a);
const skipped = [];
const warned = [];

/* ── the Swift helpers, compiled on demand ─────────────────────────── */

function tool(name) {
  const bin = path.join(TOOLS, 'bin', name);
  const src = path.join(TOOLS, `${name}.swift`);
  const fresh = fs.existsSync(bin) &&
    fs.statSync(bin).mtimeMs > fs.statSync(src).mtimeMs;
  if (!fresh) {
    fs.mkdirSync(path.join(TOOLS, 'bin'), { recursive: true });
    log(`compiling ${name}…`);
    execFileSync('swiftc', ['-O', '-suppress-warnings', src, '-o', bin], { stdio: 'inherit' });
  }
  return bin;
}

/* ── what's on disk ────────────────────────────────────────────────── */

const stem = (f) => path.basename(f, path.extname(f));

function mastersOnDisk() {
  if (!fs.existsSync(MASTERS)) return new Map();
  const found = new Map();                       // stem -> absolute path
  for (const f of fs.readdirSync(MASTERS)) {
    const abs = path.join(MASTERS, f);
    if (!fs.statSync(abs).isFile()) continue;
    if (!MASTER_EXT.has(path.extname(f).toLowerCase())) continue;
    const name = stem(f);
    if (DUPLICATE.test(name)) { skipped.push(f); continue; }
    if (/[^\w.-]/.test(name)) warned.push(f);   // spaces & friends survive as %20 in the URL
    found.set(name, abs);
  }
  return found;
}

/* ── VIDEOS array in script.js ─────────────────────────────────────── */

function readList(source) {
  const open = source.indexOf('const VIDEOS = [');
  if (open === -1) throw new Error('could not find `const VIDEOS = [` in script.js');
  const close = source.indexOf('];', open);
  const body = source.slice(open, close);
  const entries = [];
  // one object literal per line, which is how the list is written
  for (const line of body.split('\n')) {
    const m = line.match(/file:'([^']+)'/);
    if (m) entries.push({ file: m[1], line: line.replace(/,\s*$/, '') });
  }
  return { open, close, entries };
}

function guessTitle(name) {
  return name
    .replace(/^C\d*_/i, '')                       // C_, C1_, C2_ prefixes
    .replace(/_(V\d+[A-Z]?|FINAL|CLEAN|SUB|NT)$/gi, '')
    .replace(/_(V\d+[A-Z]?|FINAL|CLEAN|SUB|NT)$/gi, '')   // some carry two
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase()) || name;
}

/* ── main ──────────────────────────────────────────────────────────── */

fs.mkdirSync(ENCODES, { recursive: true });
fs.mkdirSync(POSTERS, { recursive: true });

const masters = mastersOnDisk();
let source = fs.readFileSync(SCRIPT, 'utf8');
const { entries } = readList(source);
const listed = new Set(entries.map((e) => e.file));

const added = [];
const removed = [];
let encoded = 0;
let postered = 0;

// 1. new masters -> encode, poster, list
for (const [name, master] of [...masters].sort()) {
  const mp4 = path.join(ENCODES, `${name}.mp4`);
  const jpg = path.join(POSTERS, `${name}.jpg`);

  if (!fs.existsSync(mp4)) {
    log(`encoding ${name}…`);
    execFileSync(tool('encode-video'),
      [ENCODES, String(SHORT_SIDE), String(BITRATE), master], { stdio: 'inherit' });
    encoded++;
  }
  if (!fs.existsSync(jpg)) {
    log(`poster ${name}…`);
    execFileSync(tool('make-poster'),
      [master, jpg, String(POSTER_AT), String(POSTER_WIDTH)], { stdio: 'inherit' });
    postered++;
  }
  if (!listed.has(name)) added.push(name);
}

// 2. masters that are gone -> drop encode, poster, list entry
for (const e of entries) {
  if (!masters.has(e.file)) {
    removed.push(e.file);
    for (const p of [path.join(ENCODES, `${e.file}.mp4`), path.join(POSTERS, `${e.file}.jpg`)]) {
      if (fs.existsSync(p)) { fs.rmSync(p); log(`removed ${path.relative(ROOT, p)}`); }
    }
  }
}

// 3. rewrite the list, keeping every hand-written title and cats
if (added.length || removed.length) {
  const kept = entries.filter((e) => masters.has(e.file));
  const pad = (s, n) => s + ' '.repeat(Math.max(1, n - s.length));
  const fresh = added.map((name) =>
    `  { file:${pad(`'${name}',`, 24)} title:'${guessTitle(name)}',${' '.repeat(2)}cats:[] },` +
    `   // TODO: set categories`);

  const lines = [...kept.map((e) => `${e.line},`), ...fresh];
  const next = `const VIDEOS = [\n${lines.join('\n')}\n];`;

  const { open, close } = readList(source);
  source = source.slice(0, open) + next + source.slice(close + 2);
  fs.writeFileSync(SCRIPT, source);
}

/* ── report ────────────────────────────────────────────────────────── */

const total = masters.size;
console.log(`videos: ${total} master${total === 1 ? '' : 's'}` +
  `${encoded ? `, ${encoded} encoded` : ''}` +
  `${postered ? `, ${postered} poster${postered === 1 ? '' : 's'}` : ''}`);
if (added.length) {
  console.log(`  + added to script.js: ${added.join(', ')}`);
  console.log(`    give them titles and cats — they show under "All" until you do`);
}
if (removed.length) console.log(`  - removed: ${removed.join(', ')}`);
if (skipped.length) console.log(`  ~ ignored duplicates: ${skipped.join(', ')}`);
if (warned.length) {
  console.log(`  ! awkward filenames (they become %20 etc. in the URL): ${warned.join(', ')}`);
  console.log(`    rename them to letters, digits, . _ - and re-run`);
}
if (!added.length && !removed.length && !encoded && !postered) console.log('  already in sync');
