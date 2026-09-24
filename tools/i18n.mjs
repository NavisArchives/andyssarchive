#!/usr/bin/env node
/**
 * Generate the French and Dutch pages from index.html.
 *
 *   node tools/i18n.mjs        → writes fr/index.html and nl/index.html
 *
 * index.html stays the single source of truth: it IS the English page, and
 * the other two are derived from it every build. That means a copy change
 * made once (by hand or from the admin) reaches all three languages, and the
 * three can never quietly drift apart.
 *
 * Every entry in TRANSLATIONS must match its English source EXACTLY ONCE.
 * If a string is missing or ambiguous the script fails loudly rather than
 * shipping a half-translated page — a silent miss would put an English
 * sentence in the middle of the French page, which is worse than a red build.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/* ── the copy ──────────────────────────────────────────────────────────────
   [ english, français, nederlands ]
   Entries carry enough surrounding markup to be unambiguous — "Belgium"
   alone appears twice, so each instance is anchored to its own tag.
   ------------------------------------------------------------------------ */
const TRANSLATIONS = [
  /* ---- head ---- */
  ['Trilingual UGC creator based in Belgium — fluent in English, French and Dutch. Story-first vertical content for tech, wellness and lifestyle brands, plus in-person event hosting across Belgium and the EU.',
   "Créateur UGC trilingue basé en Belgique — parfaitement à l'aise en anglais, français et néerlandais. Contenu vertical axé sur le récit pour les marques tech, bien-être et lifestyle, et animation d'événements en Belgique et dans l'UE.",
   'Drietalige UGC-creator in België — vloeiend in het Engels, Frans en Nederlands. Verticale content met een sterk verhaal voor tech-, wellness- en lifestylemerken, plus live eventpresentatie in België en de EU.',
   3],

  ['<title>Trilingual UGC Creator in Belgium — English, French &amp; Dutch | Andyssarchives</title>',
   '<title>Créateur UGC trilingue en Belgique — anglais, français &amp; néerlandais | Andyssarchives</title>',
   '<title>Drietalige UGC-creator in België — Engels, Frans &amp; Nederlands | Andyssarchives</title>'],

  ['<meta property="og:title" content="Trilingual UGC Creator in Belgium — English, French &amp; Dutch" />',
   '<meta property="og:title" content="Créateur UGC trilingue en Belgique — anglais, français &amp; néerlandais" />',
   '<meta property="og:title" content="Drietalige UGC-creator in België — Engels, Frans &amp; Nederlands" />'],

  ['<meta name="twitter:title" content="Trilingual UGC Creator in Belgium — English, French &amp; Dutch" />',
   '<meta name="twitter:title" content="Créateur UGC trilingue en Belgique — anglais, français &amp; néerlandais" />',
   '<meta name="twitter:title" content="Drietalige UGC-creator in België — Engels, Frans &amp; Nederlands" />'],

  ['"jobTitle": "UGC Creator"', '"jobTitle": "Créateur UGC"', '"jobTitle": "UGC-creator"'],

  ['"description": "Trilingual UGC creator based in Belgium, fluent in English, French and Dutch, working across the EU."',
   '"description": "Créateur UGC trilingue basé en Belgique, à l\'aise en anglais, français et néerlandais, actif dans toute l\'UE."',
   '"description": "Drietalige UGC-creator in België, vloeiend in het Engels, Frans en Nederlands, actief in de hele EU."'],

  /* ---- nav ---- */
  ['<a href="#videos">Videos</a>', '<a href="#videos">Vidéos</a>', "<a href=\"#videos\">Video's</a>", 2],
  ['<a href="#photos">Photos</a>', '<a href="#photos">Photos</a>', "<a href=\"#photos\">Foto's</a>", 2],
  ['<a href="#hosting">Hosting</a>', '<a href="#hosting">Événements</a>', '<a href="#hosting">Events</a>', 2],
  ['<a href="#about">About</a>', '<a href="#about">À propos</a>', '<a href="#about">Over mij</a>', 2],
  ['aria-label="Primary"', 'aria-label="Principale"', 'aria-label="Hoofdnavigatie"'],
  ['aria-label="Language"', 'aria-label="Langue"', 'aria-label="Taal"', 2],
  ['aria-label="Open menu"', 'aria-label="Ouvrir le menu"', 'aria-label="Menu openen"'],
  ['aria-label="Andyssarchives — back to top"', 'aria-label="Andyssarchives — retour en haut"', 'aria-label="Andyssarchives — terug naar boven"'],
  ['<a class="btn btn--sm navpill__cta" href="#contact">Let\'s Work Together!</a>',
   '<a class="btn btn--sm navpill__cta" href="#contact">Travaillons ensemble&nbsp;!</a>',
   '<a class="btn btn--sm navpill__cta" href="#contact">Laten we samenwerken!</a>'],
  ['<a class="navtray__cta" href="#contact">Let\'s Work Together!</a>',
   '<a class="navtray__cta" href="#contact">Travaillons ensemble&nbsp;!</a>',
   '<a class="navtray__cta" href="#contact">Laten we samenwerken!</a>'],

  /* ---- hero ---- */
  ['<p class="hero__introLabel">Intro</p>', '<p class="hero__introLabel">Intro</p>', '<p class="hero__introLabel">Intro</p>'],
  ['Trilingual UGC creator based in Belgium — fluent in English, French and Dutch, so\n            one shoot covers all three markets. 5+ years of natural, story-first content for\n            tech, wellness and lifestyle brands · plus in-person hosting when a brand needs a\n            face in the room.',
   "Créateur UGC trilingue basé en Belgique — anglais, français et néerlandais, donc\n            un seul tournage couvre les trois marchés. Plus de 5 ans de contenu naturel et\n            narratif pour des marques tech, bien-être et lifestyle · et de l'animation sur\n            place quand une marque a besoin d'un visage dans la salle.",
   'Drietalige UGC-creator in België — Engels, Frans en Nederlands, dus één shoot\n            dekt alle drie de markten. 5+ jaar natuurlijke, verhaalgedreven content voor\n            tech-, wellness- en lifestylemerken · plus live presentatie wanneer een merk\n            een gezicht in de zaal nodig heeft.'],
  ['<a class="btn btn--lg" href="#contact">Let\'s Work Together!</a>',
   '<a class="btn btn--lg" href="#contact">Travaillons ensemble&nbsp;!</a>',
   '<a class="btn btn--lg" href="#contact">Laten we samenwerken!</a>'],
  ['<p class="hero__loc">Belgium <span>— available worldwide</span></p>',
   '<p class="hero__loc">Belgique <span>— disponible partout</span></p>',
   '<p class="hero__loc">België <span>— wereldwijd beschikbaar</span></p>'],
  ['<span>Tech</span><span>Wellness</span><span>Lifestyle</span>',
   '<span>Tech</span><span>Bien-être</span><span>Lifestyle</span>',
   '<span>Tech</span><span>Wellness</span><span>Lifestyle</span>'],
  ['alt="Andy Huizenga, UGC creator"', 'alt="Andy Huizenga, créateur UGC"', 'alt="Andy Huizenga, UGC-creator"'],
  ['aria-label="Brands I have worked with"', 'aria-label="Marques avec lesquelles j\'ai travaillé"', 'aria-label="Merken waarmee ik werkte"'],

  /* ---- videos ---- */
  ['aria-label="Previous video"', 'aria-label="Vidéo précédente"', 'aria-label="Vorige video"'],
  ['aria-label="Next video"', 'aria-label="Vidéo suivante"', 'aria-label="Volgende video"'],
  ["<span class=\"pill\">Videos I've created</span>", '<span class="pill">Vidéos que j\'ai réalisées</span>', "<span class=\"pill\">Video's die ik maakte</span>"],
  ['<h2>My Past Work</h2>', '<h2>Mes réalisations</h2>', '<h2>Mijn werk</h2>'],
  ['aria-label="Video work"', 'aria-label="Travaux vidéo"', 'aria-label="Videowerk"'],
  ['aria-label="Filter videos by category"', 'aria-label="Filtrer les vidéos par catégorie"', "aria-label=\"Video's filteren op categorie\""],

  /* ---- photos ---- */
  ['<span class="pill">Gallery</span>', '<span class="pill">Galerie</span>', '<span class="pill">Galerij</span>'],
  ['<h2>Photos</h2>', '<h2>Photos</h2>', "<h2>Foto's</h2>"],
  ['aria-label="Previous photos"', 'aria-label="Photos précédentes"', "aria-label=\"Vorige foto's\""],
  ['aria-label="Next photos"', 'aria-label="Photos suivantes"', "aria-label=\"Volgende foto's\""],

  /* ---- hosting ---- */
  ['<span class="pill">Hosting</span>', '<span class="pill">Événements</span>', '<span class="pill">Events</span>'],
  ['<h2>Bring me on site.</h2>', '<h2>Faites-moi venir sur place.</h2>', '<h2>Haal me naar je event.</h2>'],
  ['I host, present and guide events in person — carrying the room, connecting with guests\n        and keeping the experience moving naturally. Production and logistics stay with your team.',
   "J'anime, je présente et je guide des événements en personne — je porte la salle, je crée\n        le lien avec les invités et je garde l'expérience fluide. La production et la logistique\n        restent chez votre équipe.",
   'Ik host, presenteer en begeleid events ter plaatse — ik draag de zaal, maak contact met de\n        gasten en houd de beleving natuurlijk in beweging. Productie en logistiek blijven bij\n        jouw team.'],
  ['<h3>Event hosting</h3>', "<h3>Animation d'événements</h3>", '<h3>Eventhosting</h3>'],
  ['<p>On-site hosting for brand events, hospitality experiences, launches, community moments and live activations.</p>',
   '<p>Animation sur place pour événements de marque, expériences hospitality, lancements, moments communautaires et activations live.</p>',
   '<p>Hosting ter plaatse voor merkevents, hospitality-ervaringen, lanceringen, communitymomenten en live activaties.</p>'],
  ['<h3>Presenting &amp; speaking</h3>', '<h3>Présentation &amp; prise de parole</h3>', '<h3>Presenteren &amp; spreken</h3>'],
  ['<p>Introducing moments, guiding transitions and representing the tone of your brand in front of a live audience.</p>',
   '<p>Introduire les moments forts, assurer les transitions et incarner le ton de votre marque devant un public en direct.</p>',
   '<p>Momenten inleiden, overgangen begeleiden en de toon van je merk vertolken voor een live publiek.</p>'],
  ['<h3>Audience experience</h3>', '<h3>Expérience du public</h3>', '<h3>Publieksbeleving</h3>'],
  ['<p>Making the room feel warm, clear and connected — from the welcome to the last goodbye.</p>',
   "<p>Rendre la salle chaleureuse, claire et connectée — de l'accueil jusqu'au dernier au revoir.</p>",
   '<p>De zaal warm, helder en verbonden laten voelen — van het welkom tot het laatste afscheid.</p>'],
  ['        Rates on request\n', '        Tarifs sur demande\n', '        Tarieven op aanvraag\n'],

  /* ---- about / specs ---- */
  ['<span class="pill">More about me</span>', '<span class="pill">En savoir plus sur moi</span>', '<span class="pill">Meer over mij</span>'],
  ['<h2>Who you&rsquo;re<br />working with</h2>', '<h2>Avec qui vous<br />travaillez</h2>', '<h2>Met wie je<br />werkt</h2>'],
  ['<div><dt>Languages</dt><dd>English · French · Dutch — all fluent</dd></div>',
   '<div><dt>Langues</dt><dd>Anglais · Français · Néerlandais — tous courants</dd></div>',
   '<div><dt>Talen</dt><dd>Engels · Frans · Nederlands — allemaal vloeiend</dd></div>'],
  ['<div><dt>Based</dt><dd>Belgium</dd></div>', '<div><dt>Basé</dt><dd>Belgique</dd></div>', '<div><dt>Gevestigd</dt><dd>België</dd></div>'],
  ['<div><dt>Available</dt><dd>Across Belgium &amp; the EU, remote worldwide</dd></div>',
   "<div><dt>Disponible</dt><dd>En Belgique &amp; dans l'UE, à distance partout</dd></div>",
   '<div><dt>Beschikbaar</dt><dd>In België &amp; de EU, remote wereldwijd</dd></div>'],
  ['<div><dt>Casting</dt><dd>Mixed race</dd></div>', '<div><dt>Casting</dt><dd>Métis</dd></div>', '<div><dt>Casting</dt><dd>Gemengde afkomst</dd></div>'],
  ['<div><dt>Delivers</dt><dd>9:16 vertical · 4K · raw + edited</dd></div>',
   '<div><dt>Livraison</dt><dd>Vertical 9:16 · 4K · brut + monté</dd></div>',
   '<div><dt>Levering</dt><dd>9:16 verticaal · 4K · ruw + gemonteerd</dd></div>'],

  ['<span class="pill">The details</span>', '<span class="pill">Les détails</span>', '<span class="pill">De details</span>'],
  ['<h3>What you get</h3>', '<h3>Ce que vous recevez</h3>', '<h3>Wat je krijgt</h3>'],
  ['<li>UGC creation &amp; ideation</li>', '<li>Création &amp; idéation UGC</li>', '<li>UGC-creatie &amp; ideevorming</li>'],
  ['<li>Trilingual content — English · French · Dutch</li>',
   '<li>Contenu trilingue — anglais · français · néerlandais</li>',
   '<li>Drietalige content — Engels · Frans · Nederlands</li>'],
  ['<li>Creative strategy</li>', '<li>Stratégie créative</li>', '<li>Creatieve strategie</li>'],
  ['<li>Photography</li>', '<li>Photographie</li>', '<li>Fotografie</li>'],
  ['<li>Event hosting &amp; presenting</li>', "<li>Animation &amp; présentation d'événements</li>", '<li>Eventhosting &amp; presentatie</li>'],
  ['<p>Price on request</p>', '<p>Prix sur demande</p>', '<p>Prijs op aanvraag</p>'],
  ['              Enquire\n', '              Demander un devis\n', '              Vraag info aan\n'],

  ['<p class="card-offer__label">What&rsquo;s included</p>', '<p class="card-offer__label">Ce qui est inclus</p>', '<p class="card-offer__label">Wat is inbegrepen</p>'],
  ['<li>Raw footage</li><li>B-roll</li><li>BTS</li><li>4K resolution</li>',
   '<li>Rushes bruts</li><li>B-roll</li><li>BTS</li><li>Résolution 4K</li>',
   '<li>Ruw beeldmateriaal</li><li>B-roll</li><li>BTS</li><li>4K-resolutie</li>'],
  ['<li>Scripting</li><li>Concept development</li><li>Organic usage rights</li>',
   "<li>Scénarisation</li><li>Développement de concept</li><li>Droits d'usage organique</li>",
   '<li>Scripting</li><li>Conceptontwikkeling</li><li>Organische gebruiksrechten</li>'],
  ['<li>Captions</li><li>Multiple aspect ratios</li>',
   "<li>Sous-titres</li><li>Plusieurs formats d'image</li>",
   '<li>Ondertiteling</li><li>Meerdere beeldverhoudingen</li>'],
  ['<p class="card-offer__label">Extras</p>', '<p class="card-offer__label">Options</p>', "<p class=\"card-offer__label\">Extra's</p>"],
  ['<li>Whitelisting rights</li><li>Paid advertising rights</li>',
   '<li>Droits de whitelisting</li><li>Droits publicitaires payants</li>',
   '<li>Whitelisting-rechten</li><li>Rechten voor betaalde advertenties</li>'],
  ['<li>Hook variations</li><li>Multiple lengths</li>',
   '<li>Variantes de hook</li><li>Plusieurs durées</li>',
   '<li>Hookvarianten</li><li>Meerdere lengtes</li>'],
  ['<li>Rush delivery (48 hours)</li><li>Extra revisions</li>',
   '<li>Livraison express (48 heures)</li><li>Révisions supplémentaires</li>',
   '<li>Spoedlevering (48 uur)</li><li>Extra revisies</li>'],
  ['<li>Voiceover</li>', '<li>Voix off</li>', '<li>Voice-over</li>'],
  ['<p class="card-offer__label">Shot on</p>', '<p class="card-offer__label">Matériel</p>', '<p class="card-offer__label">Opgenomen met</p>'],
  ['<p class="card-offer__label">Works with</p>', '<p class="card-offer__label">Secteurs</p>', '<p class="card-offer__label">Werkt met</p>'],
  ['<li>Beauty &amp; skincare</li><li>Tech &amp; SaaS</li><li>Wellness</li>',
   '<li>Beauté &amp; soins</li><li>Tech &amp; SaaS</li><li>Bien-être</li>',
   '<li>Beauty &amp; skincare</li><li>Tech &amp; SaaS</li><li>Wellness</li>'],
  ['<li>Travel &amp; hospitality</li><li>Lifestyle</li>',
   '<li>Voyage &amp; hospitality</li><li>Lifestyle</li>',
   '<li>Reizen &amp; hospitality</li><li>Lifestyle</li>'],

  /* ---- footer ---- */
  ['<p class="footer__meta">Andy Huizenga · Belgium — available worldwide</p>',
   '<p class="footer__meta">Andy Huizenga · Belgique — disponible partout</p>',
   '<p class="footer__meta">Andy Huizenga · België — wereldwijd beschikbaar</p>'],
  ['aria-label="Social profiles"', 'aria-label="Profils sociaux"', 'aria-label="Sociale profielen"'],
  ['<h2 class="footer__pitch">Let&rsquo;s make<br />something together.</h2>',
   '<h2 class="footer__pitch">Créons quelque chose<br />ensemble.</h2>',
   '<h2 class="footer__pitch">Laten we samen<br />iets maken.</h2>'],
  ['          Get in Touch\n', '          Contactez-moi\n', '          Neem contact op\n'],
  ['<p>© 2026 Andy Huizenga · Andyssarchives. All rights reserved.</p>',
   '<p>© 2026 Andy Huizenga · Andyssarchives. Tous droits réservés.</p>',
   '<p>© 2026 Andy Huizenga · Andyssarchives. Alle rechten voorbehouden.</p>'],
  ['<p class="footer__trust">Tech · Wellness · Lifestyle</p>',
   '<p class="footer__trust">Tech · Bien-être · Lifestyle</p>',
   '<p class="footer__trust">Tech · Wellness · Lifestyle</p>'],
  ['aria-label="Close">', 'aria-label="Fermer">', 'aria-label="Sluiten">'],
];

const LANGS = {
  fr: { col: 1, htmlLang: 'fr', ogLocale: 'fr_BE', alt: ['en_GB', 'nl_BE'] },
  nl: { col: 2, htmlLang: 'nl', ogLocale: 'nl_BE', alt: ['en_GB', 'fr_BE'] },
};

function translate(src, lang) {
  const { col, htmlLang, ogLocale, alt } = LANGS[lang];
  let out = src;

  // `want` is how many times the English string is expected to appear: 1 for
  // ordinary copy, more where a sentence is deliberately repeated (the meta
  // description is also the og: and twitter: description). All of them are
  // replaced; the count is asserted so a stray extra never slips through.
  const swap = (from, to, what, want = 1) => {
    const n = out.split(from).length - 1;
    if (n !== want) throw new Error(`[${lang}] ${what}: expected ${want} match(es), found ${n}\n  ${from.slice(0, 90)}`);
    out = out.split(from).join(to);
  };

  // copy
  for (const row of TRANSLATIONS) swap(row[0], row[col], 'string', row[3] ?? 1);

  // document language
  swap('<html lang="en">', `<html lang="${htmlLang}">`, 'html lang');

  // this page's own canonical + OG url
  swap('<link rel="canonical" href="https://andyssarchives.com/" />',
       `<link rel="canonical" href="https://andyssarchives.com/${lang}/" />`, 'canonical');
  swap('<meta property="og:url" content="https://andyssarchives.com/" />',
       `<meta property="og:url" content="https://andyssarchives.com/${lang}/" />`, 'og:url');

  // locale: this language primary, the other two as alternates
  swap('<meta property="og:locale" content="en_GB" />', `<meta property="og:locale" content="${ogLocale}" />`, 'og:locale');
  swap('  <meta property="og:locale:alternate" content="nl_BE" />\n  <meta property="og:locale:alternate" content="fr_BE" />',
       alt.map((l) => `  <meta property="og:locale:alternate" content="${l}" />`).join('\n'), 'og:locale:alternate');

  // JSON-LD: say which language this document is written in
  swap('"@type": "Person",', `"@type": "Person",\n    "inLanguage": "${htmlLang}",`, 'inLanguage');

  // relative asset paths would resolve under /fr/ or /nl/ and 404
  out = out.replace(/(\s(?:src|href)=")(?!https?:|\/|#|mailto:|data:)/g, '$1/');

  // language switcher: mark this page as current, not English
  out = out.replace(/<a href="\/" hreflang="en" aria-current="true">EN<\/a>/g,
                    '<a href="/" hreflang="en">EN</a>');
  out = out.replace(new RegExp(`<a href="/${lang}/" hreflang="${lang}">`, 'g'),
                    `<a href="/${lang}/" hreflang="${lang}" aria-current="true">`);

  return out;
}

const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
for (const lang of Object.keys(LANGS)) {
  const dir = path.join(ROOT, lang);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), translate(src, lang));
  console.log(`  ${lang}/index.html`);
}
