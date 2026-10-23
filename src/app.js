/* Invitación de boda · comportamiento
   Lee los datos de <script id="invite-data"> (los genera build.mjs a partir de la configuración).
   Cada bloque comprueba que su sección existe, así que funciona aunque se quiten secciones. */
(function () {
  'use strict';
  var D = JSON.parse(document.getElementById('invite-data').textContent);
  var UI = D.ui;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fill = function (t, v) { return t.replace(/\{(\w+)\}/g, function (_, k) { return v[k] != null ? v[k] : ''; }); };
  var wa = function (num, text) { return 'https://wa.me/' + num + (text ? '?text=' + encodeURIComponent(text) : ''); };
  var hero = $('#inicio');

  function isNlBadge(n) {
    return n && n.nodeType === 1 && (n.id === 'nl-badge-frame' || (n.tagName === 'IFRAME' && /Netlify/i.test(n.getAttribute('title') || '')));
  }
  function killNl(n) {
    if (isNlBadge(n)) { n.remove(); return; }
    if (!n || !n.querySelector) return;
    var f = n.querySelector('#nl-badge-frame, iframe[title="Powered by Netlify"]');
    if (f) f.remove();
  }
  $$('#nl-badge-frame, iframe[title="Powered by Netlify"]').forEach(function (n) { n.remove(); });
  new MutationObserver(function (ms) {
    ms.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, killNl); });
  }).observe(document.documentElement, { childList: true, subtree: true });

  /* ---------- Sobre ---------- */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function toTop() { document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, 0); document.documentElement.style.scrollBehavior = ''; }
  var env = $('#envelope');
  // Si la página se abre con un ancla (#confirmar), se salta el sobre.
  if (env && location.hash && location.hash.length > 1 && $(location.hash)) {
    env.hidden = true; hero.classList.add('go');
  } else if (env) {
    toTop(); addEventListener('load', toTop);
    document.body.classList.add('locked');
    $('#seal').addEventListener('click', function () {
      toTop();
      env.classList.add('open');
      setTimeout(function () { toTop(); document.body.classList.remove('locked'); hero.classList.add('go'); onScroll(); }, reduce ? 0 : 1100);
      setTimeout(function () { env.hidden = true; }, reduce ? 0 : 1800);
    });
  }

  /* ---------- Cuenta atrás ---------- */
  var target = Date.parse(D.date), last = {};
  function set(id, v) {
    var el = document.getElementById(id); if (!el || last[id] === v) return;
    el.textContent = v; last[id] = v;
    if (!reduce) { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); }
  }
  function tick() {
    var d = Math.max(0, Math.floor((target - Date.now()) / 1000));
    set('cd-d', Math.floor(d / 86400)); set('cd-h', Math.floor(d % 86400 / 3600)); set('cd-m', Math.floor(d % 3600 / 60)); set('cd-s', d % 60);
  }
  tick(); setInterval(tick, 1000);

  /* ---------- Aparición al hacer scroll (solo lo que empieza fuera de pantalla) ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.remove('pre');
      $$('.pre', e.target).forEach(function (x) { x.classList.remove('pre'); });
      io.unobserve(e.target);
    });
  }, { threshold: .12, rootMargin: '80px 0px' }) : null;
  if (io && !reduce) {
    var grouped = [];
    $$('.r').forEach(function (el) {
      if (el.getBoundingClientRect().top <= innerHeight) return;
      var sib = Array.prototype.filter.call(el.parentNode.children, function (x) { return x.classList.contains('r'); });
      var k = sib.indexOf(el);
      el.classList.add('reveal', 'pre');
      el.style.transitionDelay = (k > 0 ? k * 0.12 : 0) + 's';
      if (el.parentNode.classList.contains('carousel')) {
        if (grouped.indexOf(el.parentNode) < 0) grouped.push(el.parentNode);
      } else io.observe(el);
    });
    grouped.forEach(function (c) { io.observe(c); });
  }

  /* ---------- Scroll: progreso, menú, botón flotante y parallax ---------- */
  var bar = $('#progress'), nav = $('#nav'), fcta = $('#float-cta'), par = $('#parallax'), foot = $('#foot-img'), rsvpSec = $('#rsvp') && $('#rsvp').closest('section');
  var links = $$('.nav ul a'), secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var ticking = false;
  function onScroll() {
    var y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (nav) nav.classList.toggle('scrolled', y > 10);
    if (fcta) {
      var r = rsvpSec ? rsvpSec.getBoundingClientRect() : null;
      fcta.classList.toggle('show', y > innerHeight * .8 && !(r && r.top < innerHeight && r.bottom > 0));
    }
    if (!reduce && innerWidth > 900 && par) par.style.transform = 'translateY(' + (y * .08) + 'px)';
    if (!reduce && foot) { var fr = foot.parentNode.getBoundingClientRect(); if (fr.top < innerHeight) foot.style.transform = 'translateY(' + ((fr.top - innerHeight) * .12) + 'px)'; }
    var cur = -1;
    secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < innerHeight * .35) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('active', i === cur); if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    ticking = false;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  var itin = $('.itin');
  if (itin) {
    function showItin() { itin.classList.add('in'); }
    if (reduce || !('IntersectionObserver' in window)) showItin();
    else {
      var iio = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { showItin(); iio.disconnect(); }
      }, { threshold: 0, rootMargin: '0px 0px -12%' });
      iio.observe(itin);
    }
  }

  var themes = $('#themes'), themeBtn = themes && $('button', themes), themeMenu = $('#theme-menu');
  var THEMES = { original: 1, diamond: 1, olivo: 1 };
  function themeNow() { return document.documentElement.getAttribute('data-theme') || 'original'; }
  function markTheme() {
    var cur = themeNow();
    $$('[data-theme]').forEach(function (b) { b.setAttribute('aria-current', b.dataset.theme === cur ? 'true' : 'false'); });
  }
  function setTheme(t) {
    if (!THEMES[t]) return;
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('invite-theme', t); } catch (e) {}
    var paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
    var meta = $('meta[name="theme-color"]'); if (meta && paper) meta.content = paper;
    markTheme();
  }
  function closeThemes() { if (!themeMenu || !themeBtn) return; themeMenu.hidden = true; themeBtn.setAttribute('aria-expanded', 'false'); }
  $$('[data-theme]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); setTheme(b.dataset.theme); closeThemes(); });
  });
  if (themeBtn && themeMenu) {
    themeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = themeMenu.hidden;
      themeMenu.hidden = !open;
      themeBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) { if (themes && !themes.contains(e.target)) closeThemes(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeThemes(); });
  }
  markTheme();
  var paper0 = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
  var meta0 = $('meta[name="theme-color"]'); if (meta0 && paper0) meta0.content = paper0;

  // Mantener visible el enlace activo dentro del menú horizontal (móvil)
  var navUl = $('.nav ul');
  if (navUl) new MutationObserver(function () {
    if (navUl.scrollWidth <= navUl.clientWidth) return;
    var a = $('.nav ul a.active');
    if (!a) { navUl.scrollTo({ left: 0, behavior: reduce ? 'auto' : 'smooth' }); return; }
    var x = a.getBoundingClientRect().left - navUl.getBoundingClientRect().left + navUl.scrollLeft;
    navUl.scrollTo({ left: Math.max(0, x), behavior: reduce ? 'auto' : 'smooth' });
  }).observe(navUl, { subtree: true, attributes: true, attributeFilter: ['class'] });

  /* ---------- Ventanas ---------- */
  var lastFocus = null;
  function openOv(ov) { lastFocus = document.activeElement; ov.hidden = false; document.body.classList.add('locked'); var c = $('[data-close]', ov); if (c) c.focus(); }
  function closeOv(ov) { ov.hidden = true; document.body.classList.remove('locked'); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  $$('.overlay').forEach(function (ov) {
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('[data-close]')) closeOv(ov); });
  });
  document.addEventListener('keydown', function (e) {
    var ov = $$('.overlay').filter(function (o) { return !o.hidden; })[0]; if (!ov) return;
    if (e.key === 'Escape') closeOv(ov);
    if (e.key === 'Tab') { // mantener el foco dentro de la ventana
      var f = $$('a[href],button,textarea,input', ov).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  $$('[data-venue]').forEach(function (b) {
    b.addEventListener('click', function () {
      $('#venue-title').textContent = b.dataset.venue;
      var vi = $('#venue-img'); vi.src = b.dataset.img; vi.alt = fill(UI.venueAlt, { name: b.dataset.venue });
      openOv($('#venue'));
    });
  });
  $$('[data-full]').forEach(function (b) {
    b.addEventListener('click', function () { var im = $('#lightbox-img'); im.src = b.dataset.full; im.alt = $('img', b).alt; openOv($('#lightbox')); });
  });

  /* ---------- Textos pendientes: editar y enviar por WhatsApp ---------- */
  var editor = $('#editor');
  if (editor && D.editWhatsapp) {
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-edit]'); if (!b) return;
      e.preventDefault(); e.stopPropagation();
      var isImg = !!b.dataset.image, tgt = b.dataset.target ? document.getElementById(b.dataset.target) : b;
      var cur = b.dataset.current || (isImg ? '' : tgt.textContent.replace(/^\s*\[|\]\s*$/g, ''));
      $('#editor-title').textContent = b.dataset.edit;
      $('#editor-hint').textContent = isImg ? UI.editHintImg : UI.editHint;
      var ta = $('#editor-text'); ta.value = cur; ta.placeholder = isImg ? (b.dataset.placeholder || '') : '';
      function upd() { $('#editor-send').href = wa(D.editWhatsapp, UI.editMsg + '\n' + b.dataset.edit + ':\n' + (ta.value.trim() || UI.editImgAttached)); }
      ta.oninput = upd; upd(); openOv(editor); setTimeout(function () { ta.focus(); }, 50);
    }, true);
    $('#editor-form').addEventListener('submit', function (e) { e.preventDefault(); });
  }

  /* ---------- Carruseles (móvil): puntos, flechas y arrastre solo horizontal ---------- */
  $$('.dots').forEach(function (d) {
    var c = document.getElementById(d.dataset.for); if (!c) return;
    var kids = function () { return Array.prototype.slice.call(c.children); };
    function left(ch) { return ch.offsetLeft - c.offsetLeft - (c.clientWidth - ch.clientWidth) / 2; }
    function cur() {
      var mid = c.scrollLeft + c.clientWidth / 2, best = 0, bd = 1e9;
      kids().forEach(function (ch, i) { var dd = Math.abs(ch.offsetLeft - c.offsetLeft + ch.clientWidth / 2 - mid); if (dd < bd) { bd = dd; best = i; } });
      return best;
    }
    function go(i) { var ch = c.children[Math.max(0, Math.min(c.children.length - 1, i))]; if (ch) c.scrollTo({ left: left(ch), behavior: reduce ? 'auto' : 'smooth' }); }
    var down = false, sx = 0, sy = 0, sl = 0, axis = '', moved = false, pid = 0;
    c.addEventListener('dragstart', function (e) { e.preventDefault(); });
    c.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || c.scrollWidth <= c.clientWidth + 4) return;
      down = true; moved = false; axis = ''; pid = e.pointerId; sx = e.clientX; sy = e.clientY; sl = c.scrollLeft;
    });
    c.addEventListener('pointermove', function (e) {
      if (!down || e.pointerId !== pid) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!axis) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
        if (axis === 'y') { down = false; return; }
        moved = true; c.classList.add('dragging'); c.style.touchAction = 'none';
        try { c.setPointerCapture(e.pointerId); } catch (err) {}
      }
      if (axis === 'x') c.scrollLeft = sl - dx;
    });
    function endDrag(e) {
      if (!down || (e && e.pointerId !== pid)) return;
      down = false; c.style.touchAction = ''; c.classList.remove('dragging');
      if (moved) go(cur());
    }
    c.addEventListener('pointerup', endDrag);
    c.addEventListener('pointercancel', endDrag);
    c.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    function btn(cls, label, text, fn) { var b = document.createElement('button'); b.type = 'button'; if (cls) b.className = cls; b.setAttribute('aria-label', label); if (text) b.textContent = text; b.addEventListener('click', fn); d.appendChild(b); return b; }
    function upd() {
      var best = cur();
      $$('button:not(.cnav)', d).forEach(function (b, i) { b.setAttribute('aria-current', i === best); });
      var nv = $$('.cnav', d); if (nv.length) { nv[0].disabled = best === 0; nv[1].disabled = best === c.children.length - 1; }
    }
    function build() {
      d.innerHTML = '';
      btn('cnav', UI.prev, '‹', function () { go(cur() - 1); });
      kids().forEach(function (ch, i) { btn('', fill(UI.goTo, { i: i + 1 }), '', function () { go(i); }); });
      btn('cnav', UI.next, '›', function () { go(cur() + 1); });
      upd();
    }
    c.addEventListener('scroll', function () { requestAnimationFrame(upd); }, { passive: true });
    setTimeout(build, 0);
  });

  /* ---------- Precarga de imágenes cuando el navegador está libre ---------- */
  (window.requestIdleCallback || function (f) { setTimeout(f, 200); })(function () {
    D.preload.forEach(function (src) { var im = new Image(); im.decoding = 'async'; im.loading = 'eager'; im.src = src; });
  });

  /* ---------- Cinta infinita: se repite hasta cubrir la pantalla y avanza exactamente un bloque ---------- */
  var track = $('#track');
  function buildTrack() {
    if (!track) return;
    var set = $('.set', track);
    while (track.children.length > 1) track.removeChild(track.lastChild);
    var w = set.getBoundingClientRect().width; if (!w) return;
    for (var i = 0, n = Math.ceil(innerWidth / w) + 1; i < n; i++) track.appendChild(set.cloneNode(true));
    track.style.setProperty('--w', w + 'px'); track.style.setProperty('--dur', (w / 45) + 's');
  }
  buildTrack();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(buildTrack);
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(buildTrack, 200); });

  /* ---------- Regalos ---------- */
  var gifts = $$('[data-gift]');
  gifts.forEach(function (b) {
    b.addEventListener('click', function () {
      var box = document.getElementById('gift-' + b.dataset.gift), open = box.hidden;
      gifts.forEach(function (o) { o.classList.remove('on'); o.setAttribute('aria-expanded', 'false'); document.getElementById('gift-' + o.dataset.gift).hidden = true; });
      if (open) { box.hidden = false; b.classList.add('on'); b.setAttribute('aria-expanded', 'true'); }
    });
  });
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var t = document.getElementById(btn.dataset.copy);
      function sel() { var r = document.createRange(); r.selectNodeContents(t); var s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = UI.copyFallback; }
      try { navigator.clipboard.writeText(t.textContent.trim()).then(function () { btn.textContent = UI.copied; }, sel); } catch (e) { sel(); }
    });
  });

  /* ---------- Juego ---------- */
  var qs = $$('.quiz .q'), ans = {};
  qs.forEach(function (card, qi) {
    var ok = +card.dataset.answer, opts = $$('.opts .btn', card);
    opts.forEach(function (b, oi) {
      b.addEventListener('click', function () {
        if (qi in ans) return; ans[qi] = oi;
        opts.forEach(function (x, i) { if (i === ok) x.classList.add('ok'); else if (i === oi) x.classList.add('bad'); x.disabled = true; });
        var s = 0, n = 0;
        qs.forEach(function (q, i) { if (i in ans) { n++; if (ans[i] === +q.dataset.answer) s++; } });
        $('#score').textContent = fill(UI.score, { s: s, n: qs.length });
        $('#meter').style.width = (s / qs.length * 100) + '%';
        if (n === qs.length && D.verdicts) {
          var v = $('#verdict'); v.hidden = false;
          v.textContent = s === qs.length ? D.verdicts.all : s > 0 ? D.verdicts.some : D.verdicts.none;
        }
      });
    });
  });

  /* ---------- Confirmación por WhatsApp ---------- */
  var form = $('#rsvp');
  if (form && D.rsvp) {
    var attend = 'si', menu = '', yes = $('#if-yes'), thanks = $('#thanks');
    $$('[data-attend]').forEach(function (b) {
      b.addEventListener('click', function () {
        attend = b.dataset.attend;
        $$('[data-attend]').forEach(function (o) { var on = o === b; o.classList.toggle('on', on); o.setAttribute('aria-pressed', on); });
        yes.hidden = attend !== 'si';
      });
    });
    $$('[data-menu]').forEach(function (b) {
      b.addEventListener('click', function () {
        menu = b.dataset.menu;
        $$('[data-menu]').forEach(function (o) { var on = o === b; o.classList.toggle('on', on); o.setAttribute('aria-pressed', on); });
      });
    });
    var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = val('r-name'), err = $('#r-err');
      if (!name) { err.hidden = false; $('#r-name').focus(); return; }
      err.hidden = true;
      var song = val('r-song'), note = val('r-note');
      var lines = [D.rsvp.header, UI.waName + ': ' + name];
      if (attend === 'si') { lines.push(UI.waAttend + ': ' + UI.waYes); if (menu) lines.push(UI.waMenu + ': ' + menu); if (song) lines.push(UI.waSong + ': ' + song); }
      else lines.push(UI.waAttend + ': ' + UI.waNo);
      if (note) lines.push(UI.waNote + ': ' + note);
      $('#wa').href = wa(D.rsvp.whatsapp, lines.join('\n'));
      $('#thanks-text').textContent = fill(attend === 'si' ? UI.thanksYes : UI.thanksNo, { name: name.split(' ')[0] });
      form.hidden = true; thanks.hidden = false; $('#wa').focus();
    });
    $('#edit').addEventListener('click', function () { thanks.hidden = true; form.hidden = false; $('#r-name').focus(); });
  }
})();
