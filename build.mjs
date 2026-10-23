#!/usr/bin/env node
// Genera la web estática de una invitación en dist/.
//
//   node build.mjs                 → invitations/chantal-juan (o la variable INVITATION)
//   node build.mjs otra-boda       → invitations/otra-boda
//   INVITATION=otra-boda node build.mjs
//
// Sin dependencias: solo Node 18 o superior.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { render, isPending, esc } from './src/template.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const name = process.argv[2] || process.env.INVITATION || 'chantal-juan';
const SRC = path.join(ROOT, 'invitations', name);
const OUT = path.resolve(ROOT, process.env.OUT_DIR || 'dist');

if (!fs.existsSync(path.join(SRC, 'config.mjs'))) {
  const list = fs.readdirSync(path.join(ROOT, 'invitations')).filter((d) => !d.startsWith('.'));
  console.error(`✗ No existe invitations/${name}/config.mjs. Invitaciones disponibles: ${list.join(', ')}`);
  process.exit(1);
}
const cfg = (await import(pathToFileURL(path.join(SRC, 'config.mjs')).href + `?t=${Date.now()}`)).default;

/* ---------- comprobaciones ---------- */
const errors = [], warnings = [];
for (const k of ['couple.first', 'couple.second', 'couple.initials', 'date']) {
  if (!k.split('.').reduce((o, p) => o?.[p], cfg)) errors.push(`Falta "${k}" en la configuración.`);
}
if (cfg.date && Number.isNaN(Date.parse(cfg.date))) errors.push(`"date" no es una fecha válida: ${cfg.date} (usa 2026-12-19T18:30:00-04:00)`);
for (const e of cfg.events?.list || []) if (Number.isNaN(Date.parse(e.start))) errors.push(`El evento "${e.name}" no tiene una fecha "start" válida.`);
for (const k of ['rsvp.whatsapp', 'pendingEditor.whatsapp']) {
  const v = k.split('.').reduce((o, p) => o?.[p], cfg);
  if (v && !/^\d{8,15}$/.test(v)) errors.push(`"${k}" debe ser un número internacional sin "+" ni espacios (p. ej. 34600111222).`);
}
const images = new Set();
JSON.stringify(cfg, (k, v) => { if (typeof v === 'string' && /^img\//.test(v)) images.add(v); return v; });
for (const img of images) if (!fs.existsSync(path.join(SRC, img))) errors.push(`No se encuentra la imagen ${img} en invitations/${name}/.`);
const pending = [];
JSON.stringify(cfg, (k, v) => { if (isPending(v)) pending.push(v); return v; });
const pendingPhotos = (cfg.story?.photos || []).filter((p) => !p.image).length;
if (pending.length || pendingPhotos) warnings.push(`Quedan ${pending.length} texto(s) y ${pendingPhotos} imagen(es) pendientes: ${pending.join(', ')}`);
if (errors.length) { errors.forEach((e) => console.error('✗ ' + e)); process.exit(1); }

/* ---------- tamaño de las imágenes (para width/height y evitar saltos al cargar) ---------- */
function imageSize(file) {
  const b = fs.readFileSync(file);
  if (b.toString('ascii', 1, 4) === 'PNG') return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const t = b.toString('ascii', 12, 16);
    if (t === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (t === 'VP8L') { const n = b.readUInt32LE(21); return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1 }; }
    if (t === 'VP8X') return { w: b.readUIntLE(24, 3) + 1, h: b.readUIntLE(27, 3) + 1 };
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i < b.length;) {
      const m = b[i + 1], len = b.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
      i += 2 + len;
    }
  }
  return null;
}
const dims = {};
for (const img of images) { const d = imageSize(path.join(SRC, img)); if (d) dims[img] = d; }

/* ---------- salida ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const hash = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);
const write = (f, data) => fs.writeFileSync(path.join(OUT, f), data);

fs.cpSync(path.join(ROOT, 'assets', 'fonts'), path.join(OUT, 'fonts'), { recursive: true });
fs.cpSync(path.join(SRC, 'img'), path.join(OUT, 'img'), { recursive: true });
for (const f of ['apple-touch-icon.png']) if (fs.existsSync(path.join(SRC, f))) fs.copyFileSync(path.join(SRC, f), path.join(OUT, f));

const css = fs.readFileSync(path.join(ROOT, 'src', 'styles.css'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'src', 'app.js'), 'utf8');
const cssFile = `styles.${hash(css)}.css`, jsFile = `app.${hash(js)}.js`;
write(cssFile, css);
write(jsFile, js);

const fonts = ['great-vibes-latin-400-normal', 'cormorant-garamond-latin-400-normal'].map((f) => `fonts/${f}.woff2`);
// URL pública: la de la configuración o, en Netlify, la del sitio en producción.
const siteUrl = cfg.seo?.url || process.env.URL || '';
write('index.html', render(cfg, { dims, siteUrl, touchIcon: fs.existsSync(path.join(SRC, 'apple-touch-icon.png')), assets: { css: cssFile, js: jsFile, fonts } }));

// Favicon con las iniciales
const t = cfg.theme || {};
write('favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="${esc(t.sage || '#4E6147')}"/><text x="32" y="42" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="26" fill="${esc(t.paper || '#F5F0E6')}">${esc(cfg.couple.initials)}</text></svg>\n`);

const indexable = !!cfg.seo?.indexable;
write('robots.txt', `User-agent: *\n${indexable ? 'Allow: /' : 'Disallow:'}\n${indexable && siteUrl ? `Sitemap: ${new URL('sitemap.xml', siteUrl.replace(/\/?$/, '/')).href}\n` : ''}`);
if (indexable && siteUrl) write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${esc(siteUrl.replace(/\/?$/, '/'))}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url></urlset>\n`);

// Cabeceras de Netlify: caché larga para lo que no cambia y, si no es indexable, aviso a buscadores.
write('_headers', `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-Frame-Options: SAMEORIGIN${indexable ? '' : '\n  X-Robots-Tag: noindex, nofollow'}
/index.html
  Cache-Control: public, max-age=0, must-revalidate
/*.css
  Cache-Control: public, max-age=31536000, immutable
/*.js
  Cache-Control: public, max-age=31536000, immutable
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
/img/*
  Cache-Control: public, max-age=604800, stale-while-revalidate=86400
`);

console.log(`✓ invitations/${name} → ${path.relative(ROOT, OUT)}/ ${siteUrl ? `(${siteUrl})` : ''}`);
warnings.forEach((w) => console.warn('! ' + w));
