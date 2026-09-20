#!/usr/bin/env node
/**
 * Local admin for the video list.
 *
 *   ./tools/admin.sh          → http://127.0.0.1:4180
 *
 * Upload a clip, retitle it, retag it, drag it into a new order, pick the one
 * the carousel opens on, then publish. Everything it does is what you would
 * otherwise do by hand: drop a file into assets/videos/, run the sync, edit
 * the VIDEOS list in script.js, and deploy.
 *
 * It binds to 127.0.0.1 on purpose. There is no login because nothing outside
 * this machine can reach it — do not put it behind a tunnel or change the host
 * without adding authentication first.
 *
 * Encoding is why this is local rather than a page on the live site: it uses
 * AVFoundation on this Mac, and a 300 MB master could never be processed in a
 * Cloudflare Worker.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readVideos, writeVideos, readFeatured, writeFeatured, readCategories, load, save }
  from './videos-file.mjs';

const TOOLS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLS, '..');
const SCRIPT = path.join(ROOT, 'script.js');
const MASTERS = path.join(ROOT, 'assets/videos');
const ENCODES = path.join(MASTERS, 'web');
const POSTERS = path.join(ROOT, 'assets/posters');

const HOST = '127.0.0.1';
const PORT = 4180;
const VIDEO_EXT = new Set(['.mov', '.mp4', '.m4v']);

const json = (res, code, body) => {
  const s = JSON.stringify(body);
  res.writeHead(code, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(s) });
  res.end(s);
};

/* ── run a child process, collecting its output ─────────────────────── */
function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: ROOT, ...opts });
    let out = '';
    child.stdout.on('data', (d) => { out += d; process.stdout.write(d); });
    child.stderr.on('data', (d) => { out += d; process.stderr.write(d); });
    child.on('close', (code) => resolve({ code, out }));
    child.on('error', (e) => resolve({ code: 1, out: `${out}\n${e.message}` }));
  });
}

/* ── current state of the site ──────────────────────────────────────── */
function state() {
  const src = load(SCRIPT);
  const { videos } = readVideos(src);
  const encoded = new Set(fs.existsSync(ENCODES)
    ? fs.readdirSync(ENCODES).filter((f) => f.endsWith('.mp4')).map((f) => path.basename(f, '.mp4'))
    : []);
  const masters = new Set(fs.existsSync(MASTERS)
    ? fs.readdirSync(MASTERS)
        .filter((f) => VIDEO_EXT.has(path.extname(f).toLowerCase()))
        .map((f) => path.basename(f, path.extname(f)))
    : []);
  return {
    videos: videos.map((v) => ({
      ...v,
      hasEncode: encoded.has(v.file),
      hasMaster: masters.has(v.file),
      poster: fs.existsSync(path.join(POSTERS, `${v.file}.jpg`)) ? `/poster/${v.file}.jpg` : null,
    })),
    categories: readCategories(src).filter((c) => c.id !== 'all'),
    featured: readFeatured(src),
  };
}

/* ── request handling ───────────────────────────────────────────────── */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  const p = url.pathname;

  try {
    if (req.method === 'GET' && (p === '/' || p === '/index.html')) {
      const html = fs.readFileSync(path.join(TOOLS, 'admin.html'));
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(html);
    }

    if (req.method === 'GET' && p === '/api/state') return json(res, 200, state());

    /* a poster thumbnail */
    if (req.method === 'GET' && p.startsWith('/poster/')) {
      const file = path.join(POSTERS, path.basename(p));
      if (!fs.existsSync(file)) return json(res, 404, { error: 'no poster' });
      res.writeHead(200, { 'content-type': 'image/jpeg', 'cache-control': 'no-cache' });
      return fs.createReadStream(file).pipe(res);
    }

    /* save order / titles / tags / featured */
    if (req.method === 'POST' && p === '/api/save') {
      const body = JSON.parse(await read(req));
      if (!Array.isArray(body.videos)) return json(res, 400, { error: 'videos must be an array' });

      const known = new Set(readVideos(load(SCRIPT)).videos.map((v) => v.file));
      for (const v of body.videos) {
        if (!known.has(v.file)) return json(res, 400, { error: `unknown video ${v.file}` });
      }
      let src = writeVideos(load(SCRIPT), body.videos.map((v) => ({
        file: v.file,
        title: String(v.title || v.file).trim() || v.file,
        cats: Array.isArray(v.cats) ? v.cats : [],
      })));
      if (body.featured) src = writeFeatured(src, body.featured);
      save(SCRIPT, src);
      return json(res, 200, { ok: true, ...state() });
    }

    /* raw upload: PUT /api/upload?name=Clip.mov with the file as the body */
    if (req.method === 'PUT' && p === '/api/upload') {
      const name = path.basename(url.searchParams.get('name') || '');
      const ext = path.extname(name).toLowerCase();
      if (!name || !VIDEO_EXT.has(ext)) {
        return json(res, 400, { error: `not a video file: ${name || '(no name)'}` });
      }
      if (/[^\w.\- ]/.test(path.basename(name, ext))) {
        return json(res, 400, { error: 'filename: letters, digits, spaces, . _ - only' });
      }
      fs.mkdirSync(MASTERS, { recursive: true });
      const dest = path.join(MASTERS, name);
      if (fs.existsSync(dest)) return json(res, 409, { error: `${name} already exists` });

      // stream to a temp file so a dropped connection can't leave a half file
      // that the sync would happily encode
      const tmp = `${dest}.part`;
      await new Promise((resolve, reject) => {
        const w = fs.createWriteStream(tmp);
        req.pipe(w);
        w.on('finish', resolve);
        w.on('error', reject);
        req.on('aborted', () => { w.destroy(); reject(new Error('upload aborted')); });
      }).catch((e) => { fs.rmSync(tmp, { force: true }); throw e; });
      fs.renameSync(tmp, dest);

      const { code, out } = await run(process.execPath, [path.join(TOOLS, 'sync-videos.mjs')]);
      return json(res, code === 0 ? 200 : 500, { ok: code === 0, log: out, ...state() });
    }

    /* build + publish */
    if (req.method === 'POST' && p === '/api/deploy') {
      const build = await run('bash', [path.join(ROOT, 'build.sh')]);
      if (build.code !== 0) return json(res, 500, { ok: false, log: build.out });
      const dep = await run('npx', ['wrangler', 'deploy']);
      return json(res, dep.code === 0 ? 200 : 500,
        { ok: dep.code === 0, log: `${build.out}\n${dep.out}` });
    }

    json(res, 404, { error: 'not found' });
  } catch (e) {
    json(res, 500, { error: e.message });
  }
});

const read = (req) => new Promise((resolve, reject) => {
  let b = '';
  req.on('data', (d) => { b += d; });
  req.on('end', () => resolve(b));
  req.on('error', reject);
});

server.requestTimeout = 0;          // uploads can be hundreds of MB
server.headersTimeout = 0;
server.listen(PORT, HOST, () => {
  console.log(`\n  admin  →  http://${HOST}:${PORT}\n  (local only; ctrl-c to stop)\n`);
});
