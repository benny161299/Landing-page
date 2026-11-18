/* scroll-line.js - קו זהב דק שמלווה את הגלילה בדף הבית.
   מצויר לפי מיקומי הסקשנים האמיתיים, מתפתל בשוליים הריקים בין החלקים,
   עוצר בעיגולים קטנים ליד שירותים / צעדים / שאלות, ומסתיים ליד יצירת הקשר.
   דקורטיבי בלבד: aria-hidden, בלי אירועי עכבר, לא נוגע בתוכן. */
(function () {
  'use strict';
  var main = document.getElementById('main');
  if (!main || !window.SVGElement) return;
  var NS = 'http://www.w3.org/2000/svg';
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = !!(mq && mq.matches);

  var css = document.createElement('style');
  css.textContent =
    '.sl-svg{position:absolute;top:0;left:0;pointer-events:none;z-index:5;overflow:visible}' +
    '.sl-track{fill:none;stroke:rgba(209,168,98,.28);stroke-width:2;stroke-dasharray:2 7;stroke-linecap:round}' +
    '.sl-draw{fill:none;stroke:#D1A862;stroke-width:3;stroke-linecap:round;filter:drop-shadow(0 0 3px rgba(209,168,98,.5))}' +
    '.sl-stop{fill:#F2F5F3;stroke:rgba(138,97,39,.55);stroke-width:2}' +
    '.sl-stop.on{fill:#D1A862;stroke:#8A6127}' +
    '@media (prefers-reduced-motion:no-preference){.sl-stop{transition:fill .3s,stroke .3s}}' +
    '@media print,(forced-colors:active){.sl-svg{display:none}}';
  document.head.appendChild(css);

  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'sl-svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
  var track = document.createElementNS(NS, 'path'); track.setAttribute('class', 'sl-track');
  var draw = document.createElementNS(NS, 'path'); draw.setAttribute('class', 'sl-draw');
  svg.appendChild(track); svg.appendChild(draw);
  if (getComputedStyle(main).position === 'static') main.style.position = 'relative';
  main.insertBefore(svg, main.firstChild);

  var total = 0, samples = [], stops = [], stopEls = [], lastShown = -1, raf = 0, buildRaf = 0;

  function q(sel) { return main.querySelector(sel); }
  function qa(sel) { return Array.prototype.slice.call(main.querySelectorAll(sel)); }
  function top(el, r) { return el.getBoundingClientRect().top - r.top; }

  function build() {
    buildRaf = 0;
    var r = main.getBoundingClientRect();
    var w = main.clientWidth, h = main.scrollHeight;
    var secs = [q('.hero'), q('#services'), q('#how'), q('#about'), q('section.band:not(#contact)'), q('#home-faq-h') && q('#home-faq-h').closest('section'), q('#contact')]
      .filter(function (s, i, a) { return s && a.indexOf(s) === i; });
    if (secs.length < 3 || w < 320) { svg.style.display = 'none'; return; }
    svg.style.display = '';
    var wrap = q('.wrap');
    var pad = wrap ? Math.max(0, wrap.getBoundingClientRect().left + parseFloat(getComputedStyle(wrap).paddingLeft) - r.left) : 20;
    var gut = Math.max(8, Math.min(44, pad * 0.5));
    var R = w - gut, L = gut, side = R;
    var pts = [{ x: side, y: top(secs[0], r) + 70 }], marks = [];
    secs.forEach(function (s, i) {
      var y0 = top(s, r);
      if (i > 0) {
        var other = side === R ? L : R;
        /* חוצים רק ברווח הריק: בין סוף התוכן של הסקשן הקודם לתחילת התוכן של זה */
        var prev = s.previousElementSibling || secs[i - 1], cs = getComputedStyle(s), ps = getComputedStyle(prev);
        var from = top(prev, r) + prev.offsetHeight - parseFloat(ps.paddingBottom) + 10;
        var to = y0 + parseFloat(cs.paddingTop) - 10;
        if (to - from < 40) { from = y0 - 40; to = y0 - 4; }
        pts.push({ x: side, y: from });
        pts.push({ x: other, y: to });
        side = other;
      }
      var sel = s.id === 'services' ? '.svc-group' : s.id === 'how' ? '.steps li' : (s.querySelector('.faq') ? '.faq details' : '');
      if (sel) Array.prototype.slice.call(s.querySelectorAll(sel), 0, 3).forEach(function (st) {
        marks.push({ x: side, y: top(st, r) + Math.min(st.offsetHeight / 2, 40) });
      });
    });
    var lastSec = secs[secs.length - 1];
    var cta = lastSec.querySelector('.direct .btn') || lastSec.querySelector('.direct a');
    var end;
    if (cta) {
      var cr = cta.getBoundingClientRect(), cy = cr.top - r.top + cr.height / 2;
      pts.push({ x: side, y: cy - 70 });
      end = { x: side === R ? Math.min(cr.right - r.left + 10, R) : Math.max(cr.left - r.left - 10, L), y: cy };
    } else {
      var ey = top(lastSec, r) + Math.min(lastSec.offsetHeight * 0.5, 260);
      pts.push({ x: side, y: ey });
      end = { x: side, y: ey + 60 };
    }
    var p = 'M ' + pts[0].x + ' ' + pts[0].y;
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], dy = (b.y - a.y) * 0.5;
      p += ' C ' + a.x + ' ' + (a.y + dy) + ', ' + b.x + ' ' + (b.y - dy) + ', ' + b.x + ' ' + b.y;
    }
    var l = pts[pts.length - 1], dy2 = (end.y - l.y) * 0.5;
    p += ' C ' + l.x + ' ' + (l.y + dy2) + ', ' + end.x + ' ' + (end.y - dy2) + ', ' + end.x + ' ' + end.y;
    svg.setAttribute('width', w); svg.setAttribute('height', h);
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    track.setAttribute('d', p); draw.setAttribute('d', p);
    total = draw.getTotalLength();
    draw.style.strokeDasharray = total;
    samples = [];
    for (var t = 0; t <= total; t += 6) samples.push({ t: t, y: draw.getPointAtLength(t).y });
    stopEls.forEach(function (c) { svg.removeChild(c); });
    stopEls = []; stops = [];
    marks.forEach(function (m) {
      var best = 0, bd = 1e9;
      for (var j = 0; j < samples.length; j++) {
        var pt = draw.getPointAtLength(samples[j].t);
        var dd = Math.abs(pt.y - m.y) + Math.abs(pt.x - m.x) * 0.2;
        if (dd < bd) { bd = dd; best = samples[j].t; }
      }
      var q2 = draw.getPointAtLength(best);
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', q2.x); c.setAttribute('cy', q2.y); c.setAttribute('r', 5.5);
      c.setAttribute('class', 'sl-stop');
      svg.appendChild(c); stopEls.push(c); stops.push(best);
    });
    var ec = document.createElementNS(NS, 'circle');
    ec.setAttribute('cx', end.x); ec.setAttribute('cy', end.y); ec.setAttribute('r', 5.5); ec.setAttribute('class', 'sl-stop');
    svg.appendChild(ec); stopEls.push(ec); stops.push(total);
    lastShown = -1;
    update();
  }

  function update() {
    raf = 0;
    if (!total) return;
    var shown = total;
    if (!reduced) {
      var y = (window.pageYOffset || document.documentElement.scrollTop) + window.innerHeight * 0.6 - (main.getBoundingClientRect().top + (window.pageYOffset || 0));
      shown = 0;
      for (var i = 0; i < samples.length; i++) { if (samples[i].y <= y) shown = samples[i].t; else break; }
      if (y >= samples[samples.length - 1].y) shown = total;
    }
    if (shown === lastShown) return;
    lastShown = shown;
    draw.style.strokeDashoffset = total - shown;
    for (var k = 0; k < stops.length; k++) stopEls[k].setAttribute('class', 'sl-stop' + (shown >= stops[k] ? ' on' : ''));
  }

  function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
  function scheduleBuild() { if (!buildRaf) buildRaf = requestAnimationFrame(build); }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', scheduleBuild);
  window.addEventListener('load', scheduleBuild);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleBuild);
  if (window.ResizeObserver) new ResizeObserver(function () { scheduleBuild(); }).observe(main);
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { reduced = mq.matches; lastShown = -1; update(); });
  build();
})();
