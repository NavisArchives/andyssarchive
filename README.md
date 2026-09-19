# andyssarchives — UGC portfolio

Static site. No build step, no framework, no dependencies.
Open `index.html` locally, or serve the folder:

```bash
python3 -m http.server 4173
```

---

## Where the content lives

Everything editable is in the **first 90 lines of `script.js`**. No HTML surgery needed.

| List | What it drives | Add an item by |
|---|---|---|
| `VIDEOS` | the "My Past Work" carousel | dropping an `.mp4` into `assets/videos/web/` + a poster `.jpg` into `assets/posters/`, then adding one line |
| `CATEGORIES` | the filter chips under the carousel | adding `{ id, label }` — a chip only shows if at least one video uses its `id` |
| `PHOTOS` | the full-bleed photo gallery | dropping the image into `assets/photos/` and adding one line |
| `LOGOS` | the scrolling brand marquee | dropping the logo into `assets/logos/` and adding one line |
| `FEATURED` | which video the carousel opens on | changing the string to another `file` value |

A video entry looks like this — `file` is the **basename**, shared by the mp4 and the poster:

```js
{ file:'C1_Armani_V1', title:'Emporio Armani · Signature Scent', cats:['fashion','beauty'] },
```

### Photos

The gallery runs off `PHOTOS` and loads from `assets/photos/web/` — 1600px copies, ~100–280 KB
each. The shoot originals sit in `assets/photos/` at 6000px and 8–18 MB a piece (~120 MB), and
are git-ignored: never ship those.

The rail is **justified** — every frame is the same height and takes its own natural width — so
landscape and portrait can sit side by side and neither gets cropped to fit a box.

After dropping new masters into `assets/photos/`, rebuild the web copies:

```bash
python3 -c "
from PIL import Image, ImageOps; import glob, os
for f in glob.glob('assets/photos/*.jpg'):
    im = ImageOps.exif_transpose(Image.open(f)).convert('RGB')
    if im.width > 1600: im = im.resize((1600, round(im.height*1600/im.width)), Image.LANCZOS)
    im.save('assets/photos/web/'+os.path.basename(f), quality=82, optimize=True, progressive=True)
    print(os.path.basename(f))
"
```

Then add a line to `PHOTOS`. `assets/photos/web/portrait.jpg` is the profile shot used in the
hero and footer — it is deliberately **not** in the gallery.

---

## Videos

**Drop a clip into `assets/videos/` and it goes on the site by itself.** `tools/sync-videos.mjs`
does the work and `./build.sh` runs it automatically, so a normal deploy picks up anything new:

```bash
./build.sh && npx wrangler deploy
```

For a true drop-and-forget loop, leave the watcher running:

```bash
./tools/watch-videos.sh            # encode + add to the list
./tools/watch-videos.sh --deploy   # …and publish it too
```

### What the sync does

For each master in `assets/videos/`:

| | |
|---|---|
| encode | `assets/videos/web/<name>.mp4` — 720×1280 H.264, ~2.2 Mbps, faststart |
| poster | `assets/posters/<name>.jpg` — a frame 2s in, 700px wide |
| list | appends to `VIDEOS` in `script.js` with a guessed title and empty `cats` |

New entries are marked `// TODO: set categories` — they appear under **All** straight away,
and show up under a filter once you tag them. **Titles and categories you have written are
never overwritten**; the sync only ever adds and removes whole entries.

Delete a master and the reverse happens: encode, poster and list entry all go.

Finder duplicates (`… copy.mov`, `… (1).mov`) are ignored rather than published twice, and
filenames with spaces or other URL-awkward characters get a warning.

### Why Swift and not ffmpeg

There is no ffmpeg on this machine. `tools/encode-video.swift` and `tools/make-poster.swift`
use AVFoundation instead; the sync compiles them on first run and caches the binaries in
`tools/bin/` (git-ignored). They need only the Xcode command line tools.

### Masters vs. what ships

- `assets/videos/` — the originals, 20–300 MB each. **Local only, git-ignored.**
- `assets/videos/web/` — what the site loads.
- Nothing downloads until a visitor presses play: every card is a poster with `preload="none"`.

---

## ⚠ Before the first push to GitHub

Nine video masters are **already committed** and each is over GitHub's hard 100 MB per-file
limit, so `git push` to `github.com/NavisArchives/andyssarchive` will be rejected — and it stays
rejected even after deleting them, because they're still in the history.

Stop tracking them going forward:

```bash
git rm --cached assets/videos/*.mov assets/videos/*.MOV assets/videos/*.mp4
```

The files stay on your disk; `.gitignore` already covers them. That fixes future commits but not
the existing history — clearing that needs either `git filter-repo` or a fresh initial commit.

---

## Deploying

Live at **https://andyssarchives.com**, on Cloudflare Workers static assets
(the account that owns the domain: `huizengaandy@gmail.com`).

The project root is ~4.2 GB of masters, so you never deploy it directly. `build.sh` assembles
`dist/` with only what the site needs (~192 MB, 67 files) and fails loudly if any file crosses
Cloudflare's 25 MiB per-file limit.

```bash
./build.sh && npx wrangler deploy
```

That's the whole release process. First run only, `npx wrangler login`.

### Two toggles still to flip (dashboard only)

The deploy token has `zone (read)`, so these can't be scripted — both are one click in the
Cloudflare dashboard for the `andyssarchives.com` zone:

1. **SSL/TLS → Edge Certificates → Always Use HTTPS.** Right now `http://andyssarchives.com`
   serves the site over plain HTTP instead of redirecting to HTTPS.
2. **Rules → Redirect Rules → www to apex** (optional). `www.` and the bare domain both serve
   the site independently. A `<link rel="canonical">` already tells search engines which one
   counts, so this is tidiness rather than a real problem. It can't be done with `_redirects`:
   Workers static assets rejects absolute URLs there ("Only relative URLs are allowed").

### Config

`wrangler.jsonc` holds the config; `_headers` is copied into `dist/` and sets the cache policy —
HTML/CSS/JS always revalidate so edits appear immediately, while `/assets/*` caches for a day
with a week of stale-while-revalidate. Filenames aren't content-hashed, so if you replace a
photo under the same name it goes live within 24 hours rather than instantly.

### A note on the video weight

`assets/videos/web/` is ~186 MB of MP4. Nothing downloads until a visitor presses play, so this
costs a typical visitor nothing. If traffic ever grows, move the MP4s to Cloudflare Stream or an
R2 bucket and repoint `VIDEO_DIR` in `script.js` — the rest of the site is untouched by that.

Workers static assets does **not** serve HTTP Range requests: a ranged GET comes back `200`
with the whole file. That would normally break scrubbing, but the player here is click-to-play
with no scrubber, and the MP4s are written faststart (moov atom first), so playback begins
while the rest streams in. It only becomes a reason to move to R2 or Stream if a seek bar is
ever added.

### The GitHub repo is a separate problem

Deploying does **not** go through GitHub, so none of this blocks you shipping. But
`git push` to `github.com/NavisArchives/andyssarchive` is still rejected: nine video masters over
GitHub's 100 MB hard limit are already in the history. Stop tracking them going forward with

```bash
git rm --cached assets/videos/*.mov assets/videos/*.MOV assets/videos/*.mp4
```

and clear the history with `git filter-repo` or a fresh initial commit when you want the backup.

---

## Design

Layout, type scale, colours and motion are lifted 1:1 from the reference site
(`mayaherring.com`): ink `#472E2F`, accent `#FFF0AD`, Helvetica Neue at `-0.07em` for display,
9:16 media, 160 px section rhythm, and a glass nav pill that condenses from full-width to
1000 px on scroll over 0.72 s. One typeface throughout — no decorative script anywhere.

**Brand logos:** drop any file into `assets/logos/`, add a line to `LOGOS`, done — SVG, PNG or
JPG, transparent or on white, any aspect. Two things are handled for you:

- Several supplied SVGs (Saint Laurent, Indeed) carry a `viewBox` but no `width`/`height`, so
  `width:auto` resolves to zero and the artwork paints outside a collapsed flex item — that's
  what made them overlap. The image height is pinned instead, which is immune to it.
- Marks arrive at wildly different aspects (La Roche-Posay ≈ 2:1, Emporio Armani ≈ 10:1). One
  fixed height would make the stacked ones look tiny, so height is scaled by `1/√aspect` to
  hold the optical *area* roughly constant, capped at 172×52. The marquee also retimes itself
  to a steady ~62 px/s, so adding logos lengthens the loop instead of speeding it up.
