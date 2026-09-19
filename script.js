/* ============================================================
   andyssarchives — site behaviour
   ------------------------------------------------------------
   CONTENT LIVES AT THE TOP OF THIS FILE.
   To add work: drop the file in the right folder, add one line.
   ============================================================ */

/* ── 1. Videos ─────────────────────────────────────────────
   file  : basename inside assets/videos/web/  (.mp4, web-encoded)
   poster: basename inside assets/posters/     (.jpg)
   title : shown under the carousel
   cats  : any of the chip ids in CATEGORIES below
---------------------------------------------------------------- */
const VIDEOS = [
  { file:'Andy_YSL_Reel_V3',     title:'Yves Saint Laurent',        cats:['beauty','fashion'] },
  { file:'C1_Armani_V1',         title:'Emporio Armani · Signature Scent', cats:['fashion','beauty'] },
  { file:'BIOTHERM_V1_NT',       title:'Biotherm · Life Plankton',  cats:['beauty'] },
  { file:'Biotherm_Final',       title:'Biotherm · Sunday Selfcare', cats:['beauty','lifestyle'] },
  { file:'BiodermaXAndy',        title:'Bioderma · Serum',          cats:['beauty','voiceover'] },
  { file:'BiodermaV3',           title:'Bioderma',                  cats:['beauty'] },
  { file:'BiodermaXSparkAds',    title:'Bioderma · Spark Ads',      cats:['beauty'] },
  { file:'C_LAROCHE_FINAL',      title:'La Roche-Posay · Skincare Routine', cats:['beauty','voiceover'] },
  { file:'EFFECLAR_V1',          title:'La Roche-Posay · Effaclar', cats:['beauty'] },
  { file:'LAROCHE_V2',           title:'La Roche-Posay',            cats:['beauty'] },
  { file:'Eucerin_V1',           title:'Eucerin',                   cats:['beauty','lifestyle'] },
  { file:'C1_KRUIDVAT_V1',       title:'Kruidvat · Skincare Routine', cats:['beauty','travel'] },
  { file:'C2_GLUED_V2',          title:'got2b Glued',                cats:['haircare'] },
  { file:'INDEED_SIGN_V2',       title:'Indeed · Sign',             cats:['software','lifestyle'] },
  { file:'INDEED_TOTEBAG_V2',    title:'Indeed · Tote Bag',         cats:['software','voiceover'] },
  { file:'C_INDEED_SAVINGS_V3',  title:'Indeed · Savings',          cats:['software','interview'] },
  { file:'INTERVIEW_03_SUB',     title:'Street Interview · Careers', cats:['interview','software'] },
  { file:'INTERVIEW_04_SUB',     title:'Street Interview · Careers II', cats:['interview','software'] },
  { file:'C1_Wallpaper_V1',      title:'Travel Wallpaper',          cats:['software','lifestyle'] },
  { file:'MorningRoutine_V3',    title:'3 Productive Morning Habits', cats:['lifestyle'] },
  { file:'MixBrussels',          title:'Mix Brussels',              cats:['travel','lifestyle'] },
  { file:'C_ARMANI_V1C',         title:'Emporio Armani · Stronger With You', cats:['fashion','beauty'] },
  { file:'C_THEPERFUMIST_V2',    title:'The Perfumist · GRWM Beach Edition', cats:['beauty','lifestyle'] },
  { file:'C_kruidvat_V2',        title:'Kruidvat · Sun Essentials', cats:['beauty','lifestyle'] },
];

/* ── 2. Filter chips (words only, no icons) ───────────────── */
const CATEGORIES = [
  { id:'all',       label:'All' },
  { id:'beauty',    label:'Beauty' },
  { id:'fashion',   label:'Fashion' },
  { id:'travel',    label:'Travel' },
  { id:'lifestyle', label:'Lifestyle' },
  { id:'interview', label:'Interview' },
  { id:'haircare',  label:'Haircare' },
  { id:'software',  label:'Software' },
  { id:'voiceover', label:'Voiceover' },
];

/* ── 3. Photos ─────────────────────────────────────────────
   Web-sized copies live in assets/photos/web/ (1600px, ~150KB).
   The originals stay in assets/photos/ — 6000px and 8–18MB each,
   far too heavy to ship. Re-run the resize step in the README
   after dropping new masters in, then add a line here.
   Any mix of portrait and landscape works: the rail is a fixed
   height and each frame takes its natural width.
---------------------------------------------------------------- */
const PHOTOS = [
  { src:'assets/photos/web/SAPIENS-130.jpg', alt:'Villa balcony seen through linen curtains' },
  { src:'assets/photos/web/FOOD-16.jpg',     alt:'Granola and fruit parfait held up in the garden' },
  { src:'assets/photos/web/SAPIENS-017.jpg', alt:'Four-poster bed under a mosquito net' },
  { src:'assets/photos/web/FOOD-26.jpg',     alt:'Fresh bowl plated on a woven mat' },
  { src:'assets/photos/web/SAPIENS-127.jpg', alt:'Balcony table set for two above the treeline' },
  { src:'assets/photos/web/SAPIENS-009.jpg', alt:'Daybed on a planted balcony' },
  { src:'assets/photos/web/FOOD-22.jpg',     alt:'Plated main course, shot overhead' },
  { src:'assets/photos/web/SAPIENS-078.jpg', alt:'Writing desk and cane chair in the room' },
  { src:'assets/photos/web/SAPIENS-043.jpg', alt:'Minibar and glassware detail' },
];

/* ── 4. Brand logos ───────────────────────────────────────
   Marquee order is interleaved on purpose: wide wordmarks
   alternate with compact marks so the strip reads evenly.
---------------------------------------------------------------- */
const LOGOS = [
  { src:'assets/logos/Bioderma_logo.svg',                 alt:'Bioderma' },
  { src:'assets/logos/La_Roche-Posay_(brand).svg',        alt:'La Roche-Posay' },
  { src:'assets/logos/Emporio_Armani_logo.svg',           alt:'Emporio Armani' },
  { src:'assets/logos/Eucerin_logo.svg',                  alt:'Eucerin' },
  { src:'assets/logos/Saint_Laurent_Paris_SVG_Logo.svg',  alt:'Saint Laurent' },
  { src:'assets/logos/Vichy_Laboratoires_(logo).jpg',     alt:'Vichy Laboratoires' },
  { src:'assets/logos/Indeed_Logo_Blue.svg',              alt:'Indeed' },
  { src:'assets/logos/Maybelline-Logo.svg',               alt:'Maybelline' },
  { src:'assets/logos/GOT2B.png',                         alt:'got2b' },
  { src:'assets/logos/biotherm-seeklogo.png',             alt:'Biotherm' },
  { src:'assets/logos/ICI_Paris_XL_logo.svg',             alt:'ICI Paris XL' },
  { src:'assets/logos/canva-wordmark-2.svg',              alt:'Canva' },
];

/* ── 5. Wiring ────────────────────────────────────────────
   FEATURED is the `file` the carousel opens on (and falls back to
   whenever a filter still contains it). Change the string to move
   the hero slot to a different piece of work.
---------------------------------------------------------------- */
const FEATURED   = 'EFFECLAR_V1';          // La Roche-Posay · Effaclar
const VIDEO_DIR  = 'assets/videos/web/';
const POSTER_DIR = 'assets/posters/';

/* ============================================================
   Header — glass pill condenses on scroll
   ============================================================ */
(() => {
  const header = document.getElementById('siteheader');
  if (!header) return;
  let ticking = false;
  const sync = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(sync); }
  }, { passive:true });
  sync();
})();

/* ============================================================
   Mobile tray
   ============================================================ */
(() => {
  const trigger = document.getElementById('navtrayTrigger');
  const tray = document.getElementById('navtray');
  if (!trigger || !tray) return;

  const setOpen = (open) => {
    trigger.setAttribute('aria-expanded', String(open));
    tray.hidden = !open;
    trigger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  trigger.addEventListener('click', () => setOpen(tray.hidden));
  tray.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('click', (e) => {
    if (!tray.hidden && !tray.contains(e.target) && !trigger.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !tray.hidden) setOpen(false); });
})();

/* ============================================================
   Brand marquee (list duplicated once for a seamless loop)
   ============================================================ */
(() => {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;
  const half = LOGOS.map(l =>
    `<div class="marquee__item"><img src="${l.src}" alt="${l.alt}" loading="lazy" decoding="async"></div>`
  ).join('');
  track.innerHTML = half + half.replace(/alt="[^"]*"/g, 'alt="" aria-hidden="true"');

  /* Optical sizing.
     Brand marks arrive at wildly different aspects — stacked lockups like
     La Roche-Posay are ~2:1, wordmarks like Emporio Armani are ~10:1. Giving
     them all one height makes the stacked ones look tiny. Scaling height by
     1/√aspect holds the *area* roughly constant instead, so every logo reads
     at the same weight. naturalWidth/Height is only used for the ratio, which
     stays correct even on the SVGs that report a fallback pixel size. */
  const scale = () => (window.innerWidth <= 768
    ? { k: 96,  maxW: 124, maxH: 38 }
    : { k: 132, maxW: 172, maxH: 52 });

  function normalise(img) {
    const ratio = img.naturalWidth / img.naturalHeight;
    if (!ratio || !isFinite(ratio)) return;
    const { k, maxW, maxH } = scale();
    let h = Math.min(maxH, k / Math.sqrt(ratio));
    let w = h * ratio;
    if (w > maxW) { w = maxW; h = w / ratio; }
    img.style.width  = Math.round(w) + 'px';
    img.style.height = Math.round(h) + 'px';
  }

  const imgs = [...track.querySelectorAll('img')];
  imgs.forEach(img => {
    if (img.complete && img.naturalWidth) normalise(img);
    else img.addEventListener('load', () => normalise(img), { once:true });
  });

  /* Hold the scroll speed steady (~62 px/s) as logos are added or removed,
     instead of letting a longer strip race past in the same 30s. */
  function pace() {
    const half = track.scrollWidth / 2;
    if (half > 0) track.style.animationDuration = Math.round(half / 62) + 's';
  }

  let t;
  const refresh = () => { imgs.forEach(i => i.naturalWidth && normalise(i)); pace(); };
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(refresh, 150); }, { passive:true });
  Promise.all(imgs.map(i => i.decode?.().catch(() => {}) ?? Promise.resolve())).then(refresh);
  pace();
})();

/* ============================================================
   Video carousel
   Geometry taken 1:1 from the reference:
     centre card 324 × 576 (9:16), side cards at 2/3 scale, 18px gaps
   ============================================================ */
(() => {
  const stage   = document.getElementById('stage');
  const rail    = document.getElementById('stageRail');
  const caption = document.getElementById('stageCaption');
  const filters = document.getElementById('filters');
  if (!stage || !rail) return;

  const GAP = 18;
  const SIDE_SCALE = 2 / 3;

  let active = 0;          // index into `visible`
  let visible = VIDEOS.slice();
  let cards = [];          // DOM nodes, parallel to `visible`
  let filter = 'all';

  const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5-13-7.5Z"/></svg>';
  const soundOn  = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4Zm-2.5-8.7v2.1a7 7 0 0 1 0 13.2v2.1a9 9 0 0 0 0-17.4Z"/></svg>';
  const soundOff = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Zm16.5-.1-1.4-1.4L17 9.6l-2.1-2.1-1.4 1.4L15.6 11l-2.1 2.1 1.4 1.4L17 12.4l2.1 2.1 1.4-1.4L18.4 11l2.1-2.1Z"/></svg>';

  /* ---- build ---- */
  function build() {
    rail.innerHTML = '';
    cards = visible.map((v, i) => {
      const el = document.createElement('article');
      el.className = 'card';
      el.dataset.index = String(i);
      el.innerHTML =
        `<img src="${POSTER_DIR}${v.file}.jpg" alt="${v.title}" loading="lazy" decoding="async">` +
        `<button class="card__play" type="button" aria-label="Play ${v.title}"><span>${playIcon}</span></button>` +
        `<button class="card__sound" type="button" aria-label="Unmute">${soundOff}</button>`;
      rail.appendChild(el);
      return el;
    });
    // open on the featured piece when the current filter still includes it
    const featured = visible.findIndex(v => v.file === FEATURED);
    active = featured > -1 ? featured : 0;
    layout();
  }

  /* ---- geometry ---- */
  function metrics() {
    const stageW  = stage.clientWidth || window.innerWidth;
    const centerW = Math.round(Math.min(324, Math.max(180, stageW * 0.62)));
    const centerH = Math.round(centerW * 16 / 9);
    const sideW   = Math.round(centerW * SIDE_SCALE);
    const sideH   = Math.round(centerH * SIDE_SCALE);
    return { stageW, centerW, centerH, sideW, sideH };
  }

  function offsetFor(k, m) {
    if (k === 0) return 0;
    const sign = Math.sign(k);
    const n = Math.abs(k);
    return sign * (m.centerW / 2 + GAP + m.sideW / 2 + (n - 1) * (m.sideW + GAP));
  }

  /* shortest signed distance from `active` to card `i` on a ring of n */
  function slotFor(i, n) {
    if (n <= 1) return 0;
    let k = i - active;
    const half = n / 2;
    if (k >  half) k -= n;
    if (k < -half) k += n;
    return k;
  }

  function layout() {
    const m = metrics();
    const n = cards.length;
    stage.style.height = m.centerH + 'px';

    cards.forEach((el, i) => {
      const k = slotFor(i, n);
      const isCenter = k === 0;
      const w = isCenter ? m.centerW : m.sideW;
      const h = isCenter ? m.centerH : m.sideH;
      const x = offsetFor(k, m);

      // hide anything fully past the viewport edge so it can't be tabbed into
      const off = Math.abs(x) - w / 2 > m.stageW / 2 + 40;

      // a card that jumped across the ring must not animate across the stage
      const prev = el._k;
      const wrapped = prev === undefined || Math.abs(k - prev) > 1;
      if (wrapped) {
        el.style.transition = 'none';
        // force a reflow so the snapped position is committed before we re-enable
        void el.offsetWidth;
      }

      el.style.width  = w + 'px';
      el.style.height = h + 'px';
      el.style.transform = `translate(calc(-50% + ${x}px), -50%)`;
      el.classList.toggle('card--center', isCenter);
      el.classList.toggle('card--side', !isCenter);
      el.classList.toggle('card--hidden', off);
      el.querySelectorAll('button').forEach(b => { b.tabIndex = off ? -1 : 0; });

      if (wrapped) {
        void el.offsetWidth;
        el.style.transition = '';
      }
      el._k = k;
    });

    if (caption) caption.textContent = visible[active] ? visible[active].title : '';
  }

  function goTo(i) {
    const n = visible.length;
    if (!n) return;
    const next = ((i % n) + n) % n;     // wrap around
    if (next === active) return;
    stopAll();
    active = next;
    layout();
  }

  /* ---- playback ---- */
  function stopAll() {
    rail.querySelectorAll('video').forEach(v => { v.pause(); });
    rail.querySelectorAll('.card').forEach(c => c.classList.remove('is-playing'));
  }

  function play(i) {
    const el = cards[i];
    const data = visible[i];
    if (!el || !data) return;
    stopAll();

    let video = el.querySelector('video');
    if (!video) {
      video = document.createElement('video');
      video.playsInline = true;
      video.preload = 'none';                 // nothing downloads until this point
      video.poster = `${POSTER_DIR}${data.file}.jpg`;
      video.src = `${VIDEO_DIR}${data.file}.mp4`;
      video.muted = false;
      video.addEventListener('ended', () => el.classList.remove('is-playing'));
      video.addEventListener('pause', () => el.classList.remove('is-playing'));
      el.insertBefore(video, el.querySelector('.card__play'));
    }
    el.classList.add('is-playing');
    const sound = el.querySelector('.card__sound');
    const syncSound = () => {
      if (!sound) return;
      sound.innerHTML = video.muted ? soundOff : soundOn;
      sound.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
    };
    video.play().then(syncSound).catch(() => {
      // autoplay policies: retry muted, then let the viewer unmute
      video.muted = true;
      syncSound();
      video.play().catch(() => el.classList.remove('is-playing'));
    });
  }

  /* ---- interaction ---- */
  rail.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    const i = Number(card.dataset.index);

    if (e.target.closest('.card__sound')) {
      const video = card.querySelector('video');
      if (video) {
        video.muted = !video.muted;
        const s = card.querySelector('.card__sound');
        s.innerHTML = video.muted ? soundOff : soundOn;
        s.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
      }
      return;
    }
    if (i !== active) { goTo(i); return; }
    if (e.target.closest('.card__play')) play(i);
  });

  document.querySelectorAll('[data-carousel-dir]').forEach(btn =>
    btn.addEventListener('click', () => goTo(active + Number(btn.dataset.carouselDir)))
  );

  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(active - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(active + 1); }
  });

  // swipe / drag
  let downX = null, downY = null, dragging = false;
  stage.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; dragging = false; });
  stage.addEventListener('pointermove', (e) => {
    if (downX === null) return;
    if (Math.abs(e.clientX - downX) > 12 && Math.abs(e.clientX - downX) > Math.abs(e.clientY - downY)) dragging = true;
  });
  stage.addEventListener('pointerup', (e) => {
    if (downX !== null && dragging) {
      const dx = e.clientX - downX;
      if (Math.abs(dx) > 40) goTo(active + (dx < 0 ? 1 : -1));
    }
    downX = downY = null;
  });
  stage.addEventListener('pointercancel', () => { downX = downY = null; });

  /* ---- filters ---- */
  if (filters) {
    const counts = {};
    VIDEOS.forEach(v => v.cats.forEach(c => { counts[c] = (counts[c] || 0) + 1; }));

    // the inner row carries `margin:0 auto`, so the chips centre when they
    // fit and fall back to a normal left-anchored scroll when they don't
    filters.innerHTML = '<div class="filters__row">' + CATEGORIES
      .filter(c => c.id === 'all' || counts[c.id])
      .map(c =>
        `<button class="chip" type="button" data-filter="${c.id}" aria-pressed="${c.id === 'all'}">${c.label}</button>`
      ).join('') + '</div>';

    filters.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      filter = chip.dataset.filter;
      filters.querySelectorAll('.chip').forEach(c =>
        c.setAttribute('aria-pressed', String(c === chip)));
      visible = filter === 'all' ? VIDEOS.slice() : VIDEOS.filter(v => v.cats.includes(filter));
      build();
    });
  }

  addEventListener('resize', () => layout(), { passive:true });
  build();
})();

/* ============================================================
   Photo rail — full bleed, arrows page by a screenful
   ============================================================ */
(() => {
  const rail = document.getElementById('photoRail');
  if (!rail) return;

  rail.innerHTML = PHOTOS.map(p =>
    `<figure class="rail__item"><img src="${p.src}" alt="${p.alt}" loading="lazy" decoding="async"></figure>`
  ).join('');

  // start slightly scrolled so the first image bleeds off the left edge
  requestAnimationFrame(() => {
    const first = rail.querySelector('.rail__item');
    if (first) rail.scrollLeft = Math.round(first.getBoundingClientRect().width * 0.35);
  });

  document.querySelectorAll('[data-photo-dir]').forEach(btn =>
    btn.addEventListener('click', () => {
      const dir = Number(btn.dataset.photoDir);
      const first = rail.querySelector('.rail__item');
      const step = first ? first.getBoundingClientRect().width + 12 : rail.clientWidth * 0.8;
      const pages = Math.max(1, Math.floor(rail.clientWidth / step) - 1);
      rail.scrollBy({ left: dir * step * pages, behavior:'smooth' });
    })
  );
})();

/* ============================================================
   Lightbox
   ============================================================ */
(() => {
  const box   = document.getElementById('lightbox');
  const img   = document.getElementById('lightboxImg');
  const close = document.getElementById('lightboxClose');
  if (!box || !img) return;

  let lastFocus = null;

  const open = (src, alt) => {
    lastFocus = document.activeElement;
    img.src = src; img.alt = alt || '';
    box.hidden = false;
    document.body.style.overflow = 'hidden';
    close?.focus();
  };
  const hide = () => {
    box.hidden = true; img.src = '';
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  };

  document.getElementById('photoRail')?.addEventListener('click', (e) => {
    const item = e.target.closest('.rail__item img');
    if (item) open(item.currentSrc || item.src, item.alt);
  });
  close?.addEventListener('click', hide);
  box.addEventListener('click', (e) => { if (e.target === box) hide(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !box.hidden) hide(); });
})();
