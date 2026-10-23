// Genera el HTML de la invitación a partir de la configuración.
// Cada sección es opcional: si falta en la configuración (o vale null/false), no se pinta.
import { icon, LEAF, SPRIG } from './icons.mjs';

export const UI_DEFAULTS = {
  envelopeHint: 'Tienes una invitación',
  envelopeTap: 'Toca el sello para abrir',
  envelopeOpen: 'Abrir la invitación',
  navAria: 'Secciones',
  countdownAria: 'Cuenta atrás hasta la boda',
  units: ['días', 'horas', 'min', 'seg'],
  ctaConfirm: 'Confirmar asistencia',
  ctaDetails: 'Ver detalles',
  ctaShort: 'Confirmar',
  scrollCue: 'Bajar a la invitación',
  addCalendar: 'Agregar al calendario',
  directions: 'Cómo llegar',
  venueGallery: 'Galería',
  venueAlt: 'Acuarela de {name}',
  itinHint: 'Desliza hacia abajo',
  itinOf: '{k} de {n} · {name}',
  copy: 'Copiar',
  copied: 'Copiado',
  copyFallback: 'Selecciona y copia',
  zoom: 'Ampliar: {caption}',
  prev: 'Anterior',
  next: 'Siguiente',
  goTo: 'Ir al elemento {i}',
  score: '{s} de {n} aciertos',
  editAnswers: 'Editar respuestas',
  rsvpNav: 'Confirmar',
  rsvpBefore: 'Antes del',
  name: 'Nombre completo',
  attendGroup: '¿Asistirás?',
  attendYes: 'Asistiré',
  attendNo: 'No podré asistir',
  menu: 'Elige tu menú',
  song: 'Una canción que no puede faltar',
  note: 'Mensaje para los novios',
  nameError: 'Escribe tu nombre para poder confirmar.',
  menuError: 'Elige un menú para confirmar.',
  submit: 'Preparar confirmación',
  thanks: '¡Gracias!',
  sendWa: 'Enviar por WhatsApp',
  modify: 'Modificar respuesta',
  thanksYes: 'Qué ilusión, {name}. Pulsa el botón para enviarnos tu confirmación por WhatsApp.',
  thanksNo: 'Te echaremos de menos, {name}. Pulsa el botón para avisarnos por WhatsApp.',
  waHeader: 'Confirmación boda {couple} ({date})',
  waName: 'Nombre',
  waAttend: 'Asistiré',
  waYes: 'Sí',
  waNo: 'No',
  waMenu: 'Menú',
  waSong: 'Canción',
  waNote: 'Mensaje',
  close: 'Cerrar',
  editTitle: 'Editar invitación',
  editNew: 'Nuevo texto',
  editSend: 'Enviar cambio por WhatsApp',
  editHint: 'Escribe cómo quieres que quede. El cambio te llega por WhatsApp.',
  editHintImg: 'Describe la imagen o deja una nota. Después adjunta la imagen en el chat de WhatsApp.',
  editImgPlaceholder: 'Te envío la imagen de «{caption}»',
  editMsg: 'Cambio en la invitación de boda',
  editImgAttached: '(adjunto imagen)',
  pendingPhoto: 'Imagen pendiente',
  pendingPhotoTap: 'Toca para enviarla',
  pendingPhotoEdit: 'Imagen de «{caption}»',
  pendingId: 'Editar {label}',
  dress: 'Vestido',
  suit: 'Traje',
  calTitle: 'Boda {first} y {second} - {event}',
  skip: 'Saltar al contenido',
  themeAria: 'Diseño de la invitación',
  themeOriginal: 'Original',
  themeDiamond: 'Diamond Beach',
  themeOlivo: 'Olivo',
  themePick: 'Elige el papel',
};

// Identificadores (anclas #) de cada sección; se pueden cambiar con `id` en la configuración.
const IDS = { story: 'historia', events: 'eventos', itinerary: 'itinerario', gifts: 'regalos', gallery: 'galeria', quiz: 'juego', rsvp: 'confirmar' };

/* ---------- utilidades ---------- */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const rich = (s) => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
export const isPending = (s) => typeof s === 'string' && /^\s*\[[\s\S]*\]\s*$/.test(s);
const attrs = (o) => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false).map(([k, v]) => (v === true ? k : `${k}="${esc(v)}"`)).join(' ');

export function render(cfg, { dims = {}, assets, siteUrl = '', touchIcon = false }) {
  const ui = { ...UI_DEFAULTS, ...(cfg.ui || {}) };
  const L = cfg.locale || cfg.lang || 'es';
  const TZ = cfg.timeZone || 'UTC';
  const editorOn = !!cfg.pendingEditor?.whatsapp;
  const c = cfg.couple;
  const names = `${c.first} &amp; ${c.second}`;
  const namesTxt = `${c.first} & ${c.second}`;

  /* ---------- fechas ---------- */
  const dt = (iso, o) => new Intl.DateTimeFormat(L, { timeZone: TZ, ...o }).formatToParts(new Date(iso)).reduce((a, p) => ((a[p.type] = p.value), a), {});
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const dotDate = (iso) => { const p = dt(iso, { day: '2-digit', month: '2-digit', year: 'numeric' }); return `${p.day}.${p.month}.${p.year}`; };
  const longDay = (iso) => { const p = dt(iso, { weekday: 'long', day: 'numeric', month: 'long' }); return cap(`${p.weekday} ${p.day} de ${p.month}`); };
  const longDate = (iso) => { const p = dt(iso, { day: 'numeric', month: 'long', year: 'numeric' }); return `${p.day} de ${p.month} de ${p.year}`; };
  const year = (iso) => dt(iso, { year: 'numeric' }).year;
  const time = (iso) => {
    if (cfg.clock === 24) { const p = dt(iso, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }); return `${p.hour}:${p.minute}`; }
    const p = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true }).formatToParts(new Date(iso)).reduce((a, x) => ((a[x.type] = x.value), a), {});
    return `${p.hour}:${p.minute} ${p.dayPeriod.toUpperCase()}`;
  };
  const gcal = (iso) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '');
  const DOT = dotDate(cfg.date);
  const inviteDate = (iso) => {
    const p = dt(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return `${p.weekday} ${p.day} de ${p.month} de ${p.year}`.toUpperCase();
  };

  /* ---------- piezas ---------- */
  // Texto que, si está pendiente ("[...]"), se convierte en botón de edición.
  const txt = (s, label) => (isPending(s) && editorOn ? `<button type="button" class="edit" data-edit="${esc(label)}">${esc(s)}</button>` : rich(s));
  const img = (src, alt = '', o = {}) => {
    const d = dims[src] || {};
    return `<img ${attrs({ src, alt, width: d.w, height: d.h, loading: o.eager ? undefined : 'lazy', decoding: o.eager ? undefined : 'async', fetchpriority: o.priority, class: o.cls, style: o.position ? `object-position:${o.position}` : undefined, id: o.id, draggable: 'false' })}>`;
  };
  const head = (s, extra = '') => `<div class="head r">${s.label ? `<div class="label">${rich(s.label)}</div>` : ''}<h2>${rich(s.title)}</h2>${extra}</div>`;
  const orn = '<div class="orn" aria-hidden="true"><i></i>✦<i></i></div>';
  const leaf = (cls) => `<svg class="leaf ${cls}" viewBox="0 0 120 240" fill="none" aria-hidden="true">${LEAF}</svg>`;
  const sprig = (cls) => `<svg class="invite-sprig ${cls}" viewBox="0 0 140 70" fill="currentColor" aria-hidden="true">${SPRIG}</svg>`;
  const dots = (id) => `<div class="dots" data-for="${id}"></div>`;
  const id = (k) => cfg[k]?.id || IDS[k];
  const sections = ['story', 'events', 'itinerary', 'gifts', 'gallery', 'quiz', 'rsvp'].filter((k) => cfg[k]);

  /* ---------- sobre, menú y portada ---------- */
  const envelope = `
<div class="envelope" id="envelope">
  <div class="hint envelope-hint">${esc(ui.envelopeHint)}</div>
  <div class="env">
    <div class="back"></div>
    <div class="letter"><span class="label">${esc(cfg.hero?.label || '')}</span><span class="script">${esc(c.first)} <span class="amp">&amp;</span> ${esc(c.second)}</span><span class="letter-date">${DOT}</span></div>
    <div class="front"></div><div class="flap"></div>
    <button class="seal" id="seal" type="button" aria-label="${esc(ui.envelopeOpen)}"><span>${esc(c.initials)}</span></button>
  </div>
  <div class="label hint">${esc(ui.envelopeTap)}</div>
  <div class="theme-pick" role="group" aria-label="${esc(ui.themeAria)}">
    <span class="flabel">${esc(ui.themePick)}</span>
    <div class="row center">
      <button type="button" data-theme="original">${esc(ui.themeOriginal)}</button>
      <button type="button" data-theme="diamond">${esc(ui.themeDiamond)}</button>
      <button type="button" data-theme="olivo">${esc(ui.themeOlivo)}</button>
    </div>
  </div>
</div>`;

  const navItems = sections.filter((k) => cfg[k].nav || k === 'rsvp').map((k) => `<li><a href="#${id(k)}">${esc(k === 'rsvp' ? cfg.rsvp.nav || ui.rsvpNav : cfg[k].nav)}</a></li>`).join('');
  const nav = cfg.nav === false ? '' : `
<nav class="nav" id="nav" aria-label="${esc(ui.navAria)}">
  <div class="wrap">
    <a class="brand" href="#inicio">${esc(c.first[0])} <span class="amp">&amp;</span> ${esc(c.second[0])}</a>
    <ul>${navItems}</ul>
    <div class="theme-switch" id="themes">
      <button type="button" aria-expanded="false" aria-haspopup="true" aria-controls="theme-menu" aria-label="${esc(ui.themeAria)}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M12 3.2 20.8 12 12 20.8 3.2 12Z"/></svg></button>
      <div class="theme-menu" id="theme-menu" role="listbox" aria-label="${esc(ui.themeAria)}" hidden>
        <button type="button" role="option" data-theme="original">${esc(ui.themeOriginal)}</button>
        <button type="button" role="option" data-theme="diamond">${esc(ui.themeDiamond)}</button>
        <button type="button" role="option" data-theme="olivo">${esc(ui.themeOlivo)}</button>
      </div>
    </div>
  </div>
</nav>`;

  const h = cfg.hero || {};
  const evs = cfg.events?.list || [];
  const ribbon = h.ribbon || [namesTxt, DOT.split('.').join(' · '), cfg.city, cfg.region].filter(Boolean);
  const facts = [
    { icon: 'calendar', title: longDay(cfg.date), sub: [year(cfg.date), cfg.city].filter(Boolean).join(' · ') },
    ...evs.slice(0, 2).map((e) => ({ icon: e.icon || 'calendar', title: `${e.short || e.label} · ${time(e.start)}`, sub: e.name })),
  ];
  const hero = `
<header class="hero" id="inicio">
  <div class="hero-main">
    <div class="wrap">
      <div class="frame-wrap" id="parallax"><div class="frame">${img(h.image, h.imageAlt, { eager: true, priority: 'high' })}</div></div>
      <div class="hero-text">
        <div class="top">
          <div class="label in hero-label">${esc(h.label || '')}</div>
          <h1 class="in">${esc(c.first)}<span class="amp">&amp;</span>${esc(c.second)}</h1>
          <div class="date-row in"><i></i><time datetime="${esc(cfg.date)}">${DOT}</time><i></i></div>
        </div>
        ${h.lead ? `<p class="lead in">${rich(h.lead)}</p>` : ''}
        <div class="count in" role="timer" aria-label="${esc(ui.countdownAria)}">
          ${['d', 'h', 'm', 's'].map((u, i) => `<div><b id="cd-${u}">0</b><span>${esc(ui.units[i])}</span></div>`).join('')}
        </div>
        ${cfg.rsvp || cfg.events ? `<div class="hero-cta in">${cfg.rsvp ? `<a class="btn solid" href="#${id('rsvp')}">${esc(ui.ctaConfirm)} <span class="arr" aria-hidden="true">→</span></a>` : ''}${cfg.events ? `<a class="btn" href="#${id('events')}">${esc(ui.ctaDetails)}</a>` : ''}</div>` : ''}
      </div>
    </div>
    <a class="scroll-cue" href="#${id(sections[0]) || 'inicio'}" aria-label="${esc(ui.scrollCue)}"><i></i></a>
  </div>
  <div class="facts"><div class="wrap">
    ${facts.map((f) => `<div class="fact">${icon(f.icon)}<div><b>${esc(f.title)}</b><span>${esc(f.sub)}</span></div></div>`).join('')}
  </div></div>
  <div class="ribbon" aria-hidden="true"><div class="track" id="track"><div class="set">${ribbon.map((t) => `<span>${esc(t)}</span>`).join('')}</div></div></div>
</header>`;

  /* ---------- secciones ---------- */
  const it = cfg.intro;
  const parentCol = (p) => `<div><div class="label">${esc(p.label)}</div><div class="script">${p.names.map(esc).join('<br>')}</div></div>`;
  const intro = !it ? '' : `
  <section class="block intro-block" aria-label="${esc(namesTxt)}">
    <div class="wrap">
      <article class="invite-card r">
        <div class="invite-card-inner">
          ${sprig('tl')}${sprig('br')}
          ${it.blessing ? `<p class="invite-blessing">${rich(it.blessing)}</p>` : ''}
          ${it.parents?.length ? `<div class="invite-parents">${it.parents.map(parentCol).join(it.parents.length === 2 ? '<span class="invite-amp" aria-hidden="true">&amp;</span>' : '')}</div>` : ''}
          <div class="invite-rule" aria-hidden="true"><i></i></div>
          ${it.text ? `<p class="invite-lead">${rich(it.text)}</p>` : ''}
          <p class="invite-names">${esc(c.first)} <span class="amp">&amp;</span> ${esc(c.second)}</p>
          <p class="invite-date">${esc(inviteDate(cfg.date))}</p>
        </div>
      </article>
    </div>
  </section>`;

  const S = {};
  S.story = (s) => `
  <section class="block alt" id="${id('story')}">
    <div class="wrap">
      ${head(s, orn + (s.text ? `<p>${txt(s.text, `Texto de «${s.title}»`)}</p>` : ''))}
      <div class="story carousel" id="story">
        ${s.photos.map((p) => `<figure class="pola r">${p.image ? img(p.image, p.alt, { position: p.position, eager: true }) : editorOn ? `<button type="button" class="ph edit-ph" data-edit="${esc(fill(ui.pendingPhotoEdit, { caption: p.caption }))}" data-image="1" data-placeholder="${esc(fill(ui.editImgPlaceholder, { caption: p.caption }))}">${icon('camera', { size: 28, stroke: 1.3 })}${esc(ui.pendingPhoto)}<small>${esc(ui.pendingPhotoTap)}</small></button>` : `<div class="ph" aria-hidden="true">${icon('camera', { size: 28, stroke: 1.3 })}</div>`}<figcaption>${rich(p.caption)}</figcaption></figure>`).join('\n        ')}
      </div>
      ${dots('story')}
    </div>
  </section>`;

  const mapsHref = (e) => (/^https?:\/\//i.test(e.maps) ? e.maps : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([e.name, e.address].filter(Boolean).join(', ') || e.maps || '')}`);
  const calHref = (e) => `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(fill(ui.calTitle, { first: c.first, second: c.second, event: e.label }))}&dates=${gcal(e.start)}/${gcal(e.end || e.start)}&location=${encodeURIComponent([e.name, e.address].filter(Boolean).join(', '))}`;
  const eventCard = (e) => `<article class="card event lift r">
          ${e.image ? `<div class="event-arch">
            <button type="button" class="event-photo" data-venue="${esc(e.name)}" data-img="${esc(e.image)}" aria-label="${esc(ui.venueGallery)}">${img(e.image, e.name)}</button>
            <a class="event-pin" href="${esc(mapsHref(e))}" target="_blank" rel="noopener noreferrer" aria-label="${esc(ui.directions)}">${icon('pin', { size: 15, stroke: 1.8 })}</a>
          </div>` : ''}
          <div class="label">${esc(e.label)}</div>
          <h3 class="script">${esc(e.name)}</h3>
          ${e.address ? `<address class="addr">${esc(e.address)}</address>` : ''}
          <div class="time"><time datetime="${esc(e.start)}">${time(e.start)}</time></div>
          <div class="actions">
            <a class="btn" href="${esc(calHref(e))}" target="_blank" rel="noopener noreferrer">${esc(ui.addCalendar)}</a>
            <a class="btn" href="${esc(mapsHref(e))}" target="_blank" rel="noopener noreferrer">${esc(ui.directions)}</a>
          </div>
        </article>`;
  const dressCard = (d) => !d ? '' : `<article class="card event event-dress lift r">
          <div class="event-arch">
            <div class="event-arch-plain" aria-hidden="true">${icon('dress', { size: 36, stroke: 1.1 })}<span class="dress-dots"><i></i><i></i><i></i></span></div>
          </div>
          <div class="label">${esc(d.label)}</div>
          <h3 class="script">${esc(d.title)}</h3>
          <p class="addr">${rich(d.text)}</p>
        </article>`;

  S.events = (s) => `
  <section class="block" id="${id('events')}">
    ${leaf('leaf-b')}
    <div class="wrap">
      ${head({ ...s, label: s.label || longDate(cfg.date) }, orn)}
      <div class="events carousel" id="events">
        ${s.list.map(eventCard).join('\n        ')}
        ${dressCard(s.dressCode)}
      </div>
      ${dots('events')}
    </div>
  </section>`;

  S.itinerary = (s) => `
  <section class="block alt itin" id="${id('itinerary')}">
    <div class="wrap">
      ${head(s, orn)}
      <div class="tl-wrap">
        <span class="tl-rail" aria-hidden="true"></span>
        <ol class="tl">
        ${s.items.map((i) => `<li>
          <span class="ic">${icon(i.icon || 'heart', { size: 22, stroke: 1.3 })}</span>
          <span class="node" aria-hidden="true"></span>
          <div class="meta"><span class="t">${esc(i.time)}</span><b>${esc(i.title)}</b></div>
        </li>`).join('\n        ')}
        </ol>
      </div>
      ${s.end ? `<div class="tl-end">${rich(s.end)}</div>` : ''}
    </div>
  </section>`;

  S.gifts = (s) => {
    const opts = s.options || [];
    return `
  <section class="block" id="${id('gifts')}">
    <h2 class="sr-only">${esc(s.nav || s.title)}</h2>
    <div class="wrap"><div class="duo carousel${s.album ? '' : ' single'}" id="duo">
      <div class="card panel lift r">
        <span class="icon">${icon('mail', { size: 32 })}</span>
        <h3>${rich(s.title)}</h3>
        ${s.text ? `<p class="panel-text">${rich(s.text)}</p>` : ''}
        <div class="row center">${opts.map((o, i) => `<button class="btn" type="button" data-gift="${i}" aria-expanded="false" aria-controls="gift-${i}">${esc(o.name)}</button>`).join('')}</div>
        ${opts.map((o, i) => `<div class="gift-detail" id="gift-${i}" hidden>${o.copy !== undefined ? `
          <span>${esc(o.label || o.name)}</span>
          <span class="code" id="gift-code-${i}">${esc(o.copy)}</span>${isPending(o.copy) && editorOn ? `<button type="button" class="edit small" data-edit="${esc(o.label || o.name)}" data-target="gift-code-${i}">${esc(fill(ui.pendingId, { label: o.label || o.name }))}</button>` : ''}
          <button class="btn" type="button" data-copy="gift-code-${i}">${esc(ui.copy)}</button>` : ''}${o.text ? `<span>${rich(o.text)}</span>` : ''}${o.url ? `<a class="btn" href="${esc(o.url)}" target="_blank" rel="noopener">${esc(o.button || o.name)}</a>` : ''}
        </div>`).join('')}
      </div>
      ${s.album ? `<div class="card panel lift r">
        <span class="icon">${icon('camera', { size: 32 })}</span>
        <h3>${rich(s.album.title)}</h3>
        <p class="panel-text">${rich(s.album.text)}</p>
        <a class="btn" href="${esc(s.album.url)}" target="_blank" rel="noopener">${esc(s.album.button)} <span class="arr" aria-hidden="true">→</span></a>
      </div>` : ''}
    </div>
    ${s.album ? dots('duo') : ''}
    </div>
  </section>`;
  };

  S.gallery = (s) => `
  <section class="block alt" id="${id('gallery')}">
    <div class="wrap">
      ${head(s, orn)}
      <div class="gallery r">
        ${s.photos.map((p) => `<button type="button" data-full="${esc(p.image)}" aria-label="${esc(fill(ui.zoom, { caption: p.caption || p.alt }))}">${img(p.image, p.alt, { position: p.position })}${p.caption ? `<span class="cap">${esc(p.caption)}</span>` : ''}</button>`).join('\n        ')}
      </div>
    </div>
  </section>`;

  S.quiz = (s) => {
    const n = s.questions.length;
    return `
  <section class="block" id="${id('quiz')}">
    <div class="wrap">
      ${head(s, `<div class="meter"><i id="meter"></i></div><div class="score" id="score" aria-live="polite">${esc(fill(ui.score, { s: 0, n }))}</div>`)}
      <div class="quiz carousel" id="quiz">
        ${s.questions.map((q, qi) => `<div class="card q lift r" data-answer="${q.answer}">
          <span class="num">${qi + 1}</span>
          <p>${rich(q.q)}</p>
          <div class="opts">${q.options.map((o) => `<button type="button" class="btn">${esc(o)}</button>`).join('')}</div>
          ${editorOn && q.options.some(isPending) ? `<button type="button" class="edit small" data-edit="${esc(`Pregunta: ${q.q}`)}" data-current="${esc(`${q.options.join(' / ')}  (correcta: ${q.options[q.answer]})`)}">${esc(ui.editAnswers)}</button>` : ''}
        </div>`).join('\n        ')}
      </div>
      ${dots('quiz')}
      <div class="verdict" id="verdict" aria-live="polite" hidden></div>
    </div>
  </section>`;
  };

  S.rsvp = (s) => `
  <section class="block alt" id="${id('rsvp')}">
    <div class="wrap rsvp">
      <div class="side r">
        ${s.deadline ? `<div class="label">${esc(ui.rsvpBefore)} ${txt(s.deadline, 'Fecha límite para confirmar')}</div>` : ''}
        <h2>${rich(s.title)}</h2>
        ${s.text ? `<p class="muted">${rich(s.text)}</p>` : ''}
        ${s.image ? img(s.image, '') : ''}
      </div>
      <div class="r">
        <form class="card" id="rsvp" novalidate>
          <div class="field" id="field-name"><input id="r-name" name="name" autocomplete="name" placeholder=" " required aria-describedby="r-err"><label for="r-name">${esc(ui.name)}</label></div>
          <div class="row" role="group" aria-label="${esc(ui.attendGroup)}">
            <button class="btn on" type="button" data-attend="si" aria-pressed="true">${esc(ui.attendYes)}</button>
            <button class="btn" type="button" data-attend="no" aria-pressed="false">${esc(ui.attendNo)}</button>
          </div>
          <div id="if-yes" class="if-yes">
            ${s.menus?.length ? `<div class="stack" id="field-menu"><span class="flabel" id="menu-l">${esc(ui.menu)}</span><div class="row" role="group" aria-labelledby="menu-l">${s.menus.map((m) => `<button class="btn" type="button" data-menu="${esc(m)}" aria-pressed="false">${esc(m)}</button>`).join('')}</div></div>` : ''}
            ${s.askSong !== false ? `<div class="field"><input id="r-song" name="song" placeholder=" "><label for="r-song">${esc(ui.song)}</label></div>` : ''}
          </div>
          <div class="field"><textarea id="r-note" name="note" rows="2" placeholder=" "></textarea><label for="r-note">${esc(ui.note)}</label></div>
          <p id="r-err" class="err" role="alert"></p>
          <button class="btn solid start" type="submit">${esc(ui.submit)} <span class="arr" aria-hidden="true">→</span></button>
        </form>
        <div class="card thanks" id="thanks" hidden>
          <div class="script thanks-title">${esc(ui.thanks)}</div>
          <p id="thanks-text"></p>
          <a class="btn solid" id="wa" href="https://api.whatsapp.com/send?phone=${esc(String(s.whatsapp).replace(/\D/g, ''))}" target="_blank" rel="noopener noreferrer">${esc(ui.sendWa)} <span class="arr" aria-hidden="true">→</span></a>
          <button class="btn" type="button" id="edit">${esc(ui.modify)}</button>
        </div>
      </div>
    </div>
  </section>`;

  const f = cfg.footer;
  const footer = !f ? '' : `
<footer>
  ${f.image ? img(f.image, '', { id: 'foot-img' }) : ''}
  <div class="wrap">
    <div class="label">${esc(f.label || '')}</div>
    <div class="script">${names}</div>
    <div class="foot-date">${DOT}</div>
    ${cfg.rsvp ? `<a class="btn solid" href="#${id('rsvp')}">${esc(ui.ctaConfirm)} <span class="arr" aria-hidden="true">→</span></a>` : ''}
  </div>
</footer>`;

  const x = `<button class="x" type="button" data-close aria-label="${esc(ui.close)}">${icon('close', { size: 20, stroke: 1.6 })}</button>`;
  const overlays = `
${cfg.rsvp ? `<a class="btn solid float-cta" id="float-cta" href="#${id('rsvp')}">${esc(ui.ctaShort)} <span class="arr" aria-hidden="true">→</span></a>` : ''}
<div class="overlay" id="venue" hidden>
  <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="venue-title">
    ${x}
    <img id="venue-img" alt="">
    <div class="script" id="venue-title"></div>
  </div>
</div>
${editorOn ? `<div class="overlay" id="editor" hidden>
  <form class="dialog editor" id="editor-form" role="dialog" aria-modal="true" aria-labelledby="editor-title">
    ${x}
    <div class="label">${esc(ui.editTitle)}</div>
    <h3 class="script" id="editor-title"></h3>
    <p id="editor-hint" class="muted"></p>
    <label for="editor-text" class="flabel start">${esc(ui.editNew)}</label>
    <textarea id="editor-text"></textarea>
    <a class="btn solid" id="editor-send" href="https://api.whatsapp.com/send?phone=${esc(String(cfg.pendingEditor.whatsapp).replace(/\D/g, ''))}" target="_blank" rel="noopener noreferrer">${esc(ui.editSend)} <span class="arr" aria-hidden="true">→</span></a>
  </form>
</div>` : ''}
<div class="overlay lightbox" id="lightbox" hidden>
  ${x}
  <img id="lightbox-img" alt="">
</div>`;

  /* ---------- datos para app.js ---------- */
  const images = [...new Set([h.image, ...(cfg.story?.photos || []).map((p) => p.image), ...evs.map((e) => e.image), ...(cfg.gallery?.photos || []).map((p) => p.image)].filter(Boolean))];
  const runtime = {
    date: cfg.date,
    rsvp: cfg.rsvp ? { whatsapp: cfg.rsvp.whatsapp, header: fill(ui.waHeader, { couple: namesTxt, date: DOT }) } : null,
    editWhatsapp: editorOn ? cfg.pendingEditor.whatsapp : '',
    verdicts: cfg.quiz?.verdicts || null,
    preload: images,
    ui: Object.fromEntries(['itinHint', 'itinOf', 'copied', 'copyFallback', 'prev', 'next', 'goTo', 'score', 'thanksYes', 'thanksNo', 'waName', 'waAttend', 'waYes', 'waNo', 'waMenu', 'waSong', 'waNote', 'editHint', 'editHintImg', 'editMsg', 'editImgAttached', 'venueAlt', 'themeAria', 'themeOriginal', 'themeDiamond', 'themeOlivo', 'nameError', 'menuError'].map((k) => [k, ui[k]])),
  };

  /* ---------- <head>: SEO y redes ---------- */
  const seo = cfg.seo || {};
  const title = seo.title || `Boda de ${c.first} y ${c.second}`;
  const desc = seo.description || `${c.first} y ${c.second} se casan el ${longDate(cfg.date)}.`;
  const abs = (p) => (siteUrl ? new URL(p, siteUrl.replace(/\/?$/, '/')).href : p);
  const themeVars = Object.entries(cfg.theme || {}).map(([k, v]) => `--${k}:${v}`).join(';');
  const jsonld = seo.indexable && {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: title,
    description: desc,
    startDate: evs[0]?.start || cfg.date,
    endDate: evs[evs.length - 1]?.end,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: [abs(seo.image || h.image)],
    location: evs.map((e) => ({ '@type': 'Place', name: e.name, address: e.address || cfg.city })),
  };
  const fonts = assets.fonts.map((f) => `<link rel="preload" href="${f}" as="font" type="font/woff2" crossorigin>`).join('\n');

  return `<!doctype html>
<html lang="${esc(cfg.lang || 'es')}" data-theme="original" style="--hero-img:url('${esc(h.image || '')}')">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<script>(function(){try{var q=location.search.match(/[?&]theme=([a-z]+)/);var t=(q&&q[1])||localStorage.getItem('invite-theme');if(t==='acuarela'){t='original';localStorage.setItem('invite-theme','original')}if(t==='diamond'||t==='original'||t==='olivo'){document.documentElement.setAttribute('data-theme',t);if(q)localStorage.setItem('invite-theme',t)}}catch(e){}})();</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${seo.indexable ? '<meta name="robots" content="index,follow,max-image-preview:large">' : '<meta name="robots" content="noindex,nofollow">'}
${siteUrl ? `<link rel="canonical" href="${esc(abs(''))}">` : ''}
<meta name="theme-color" content="${esc(cfg.theme?.paper || '#F5F0E6')}">
<meta name="color-scheme" content="light">
<meta name="format-detection" content="telephone=no">
<meta property="og:type" content="website">
<meta property="og:locale" content="${esc((cfg.locale || 'es-ES').replace('-', '_'))}">
<meta property="og:site_name" content="${esc(`${c.first} & ${c.second}`)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
${siteUrl ? `<meta property="og:url" content="${esc(abs(''))}">` : ''}
${seo.image ? `<meta property="og:image" content="${esc(abs(seo.image))}">
${dims[seo.image] ? `<meta property="og:image:width" content="${dims[seo.image].w}">\n<meta property="og:image:height" content="${dims[seo.image].h}">` : ''}
<meta property="og:image:alt" content="${esc(seo.imageAlt || '')}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${esc(abs(seo.image))}">` : ''}
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
${touchIcon ? '<link rel="apple-touch-icon" href="apple-touch-icon.png">' : ''}
${fonts}
<link rel="preload" as="image" href="${esc(h.image)}" fetchpriority="high">
<link rel="stylesheet" href="${assets.css}">
${themeVars ? `<style>:root{${esc(themeVars).replace(/&#39;/g, "'").replace(/&quot;/g, '"')}}</style>` : ''}
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : ''}
</head>
<body>
<noscript><style>.envelope{display:none}</style></noscript>
<a class="skip" href="#main">${esc(ui.skip)}</a>
<div class="progress" id="progress" aria-hidden="true"></div>
${envelope}
${nav}
${hero}
<main id="main">
${intro}
${sections.map((k) => S[k](cfg[k])).join('\n')}
</main>
${footer}
${overlays}
<script id="invite-data" type="application/json">${JSON.stringify(runtime).replace(/</g, '\\u003c')}</script>
<script src="${assets.js}" defer></script>
</body>
</html>
`;
}
