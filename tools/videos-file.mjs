/**
 * Read and write the VIDEOS list and FEATURED value in script.js.
 *
 * Both the sync script and the admin server edit that array, so the parsing
 * and the quoting live here once. If they each rolled their own, the two
 * would eventually disagree and corrupt the file.
 */

import fs from 'node:fs';

const OPEN = 'const VIDEOS = [';

/* a JS single-quoted string, with the escapes done properly */
const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const unq = (s) => s.replace(/\\(['\\])/g, '$1');

/** → { videos: [{file,title,cats}], open, close } */
export function readVideos(source) {
  const open = source.indexOf(OPEN);
  if (open === -1) throw new Error('could not find `const VIDEOS = [` in script.js');
  const close = source.indexOf('];', open);
  if (close === -1) throw new Error('unterminated VIDEOS array in script.js');

  const body = source.slice(open + OPEN.length, close);
  const videos = [];
  // one object literal per line, which is how the list is written
  for (const line of body.split('\n')) {
    const file = line.match(/file:\s*'((?:[^'\\]|\\.)*)'/);
    if (!file) continue;
    const title = line.match(/title:\s*'((?:[^'\\]|\\.)*)'/);
    const cats = line.match(/cats:\s*\[([^\]]*)\]/);
    videos.push({
      file: unq(file[1]),
      title: title ? unq(title[1]) : unq(file[1]),
      cats: cats ? [...cats[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => unq(m[1])) : [],
    });
  }
  return { videos, open, close };
}

/** → new source with the array replaced, order and contents exactly as given */
export function writeVideos(source, videos) {
  const { open, close } = readVideos(source);
  const w = Math.max(0, ...videos.map((v) => q(v.file).length + 1));
  const lines = videos.map((v) => {
    const file = `${q(v.file)},`.padEnd(w + 1);
    const cats = `[${v.cats.map(q).join(',')}]`;
    return `  { file:${file} title:${q(v.title)}, cats:${cats} },`;
  });
  return source.slice(0, open) + `${OPEN}\n${lines.join('\n')}\n];` + source.slice(close + 2);
}

export function readFeatured(source) {
  const m = source.match(/const FEATURED\s*=\s*'((?:[^'\\]|\\.)*)'/);
  return m ? unq(m[1]) : null;
}

export function writeFeatured(source, file) {
  return source.replace(/(const FEATURED\s*=\s*)'(?:[^'\\]|\\.)*'/, `$1${q(file)}`);
}

/** → [{id,label}] */
export function readCategories(source) {
  const open = source.indexOf('const CATEGORIES = [');
  if (open === -1) return [];
  const close = source.indexOf('];', open);
  return [...source.slice(open, close).matchAll(/id:\s*'((?:[^'\\]|\\.)*)'\s*,\s*label:\s*'((?:[^'\\]|\\.)*)'/g)]
    .map((m) => ({ id: unq(m[1]), label: unq(m[2]) }));
}

export const load = (p) => fs.readFileSync(p, 'utf8');
export const save = (p, s) => fs.writeFileSync(p, s);
