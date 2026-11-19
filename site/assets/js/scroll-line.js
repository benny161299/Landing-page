/* scroll-line.js - פס זהב קצר עם זנב דועך שמלווה את הגלילה בשוליים, ובסוף נעשה מסגרת עדינה סביב טופס יצירת הקשר.
   קל במכוון: אלמנט אחד קבוע (position:fixed) שמוזז רק ב־transform, ומסגרת SVG קטנה אחת סביב הטופס.
   אין מסלול ארוך, אין חיתוך של SVG גדול, והמיקום תלוי רק במקום הגלילה הנוכחי (לא במצב קודם), ולכן גם בגלילה לאחור הכול עקבי.
   דקורטיבי בלבד (aria-hidden). */
(function () {
  'use strict';
  var main = document.getElementById('main');
  var form = main && main.querySelector('#home-form');
  if (!main || !form || !window.SVGElement) return;
  var NS = 'http://www.w3.org/2000/svg';
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = !!(mq && mq.matches);
  var TAIL = 170;

  var css = document.createElement('style');
  css.textContent =
    '.sl-rail{position:fixed;bottom:0;width:4px;overflow:hidden;pointer-events:none;z-index:5;contain:strict;opacity:0}' +
    '.sl-comet{position:absolute;left:0;top:0;width:100%;height:' + TAIL + 'px;border-radius:4px;will-change:transform;' +
    'background:linear-gradient(to bottom,rgba(209,168,98,0),rgba(209,168,98,.55) 70%,#D1A862)}' +
    '.sl-frame{position:absolute;pointer-events:none;z-index:5;overflow:visible;visibility:hidden}' +
    '.sl-line{fill:none;stroke:#D1A862;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
    '.marquee{position:relative;z-index:6}' +
    '@media print,(forced-colors:active){.sl-rail,.sl-frame{display:none}}';
  document.head.appendChild(css);

  var rail = document.createElement('div');
  rail.className = 'sl-rail'; rail.setAttribute('aria-hidden', 'true');
  var comet = document.createElement('div');
  comet.className = 'sl-comet';
  rail.appendChild(comet);
  document.body.appendChild(rail);

  var frame = document.createElementNS(NS, 'svg');
  frame.setAttribute('class', 'sl-frame'); frame.setAttribute('aria-hidden', 'true'); frame.setAttribute('focusable', 'false');
  var framePath = document.createElementNS(NS, 'path');
  framePath.setAttribute('class', 'sl-line');
  frame.appendChild(framePath);
  if (getComputedStyle(main).position === 'static') main.style.position = 'relative';
  main.insertBefore(frame, main.firstChild);

  var built = false, hb = 0, frameTop = 0, frameH = 0, frameLen = 0;
  var lastT = null, lastO = -1, lastF = -1, raf = 0, buildTimer = 0, lastW = 0;

  /* מיקום לפי פריסה (offsetTop/Left), לא לפי getBoundingClientRect: אנימציות חשיפה (transform) משנות את ה־rect לפי מקום הגלילה */
  function off(n) { var y = 0, x = 0, e = n; while (e && e !== main) { y += e.offsetTop; x += e.offsetLeft; e = e.offsetParent; } return e === main ? { x: x, y: y } : null; }

  function build() {
    buildTimer = 0;
    var w = main.clientWidth;
    var hdr = document.querySelector('header');
    hb = hdr ? hdr.offsetHeight : 0;            /* לא offsetTop: הכותרת דביקה */
    var wrap = main.querySelector('.wrap');
    var pad = wrap ? Math.max(0, wrap.getBoundingClientRect().left + parseFloat(getComputedStyle(wrap).paddingLeft)) : 20;
    var gut = Math.max(7, Math.min(44, pad * 0.5));
    rail.style.top = hb + 'px';
    rail.style.right = Math.round(gut - 2) + 'px';

    var fo = off(form);
    if (!fo || w < 320) { rail.style.display = frame.style.display = 'none'; built = true; return; }
    rail.style.display = frame.style.display = '';
    var m = 14, rad = 26;
    var lw = form.offsetWidth + 2 * m, lh = form.offsetHeight + 2 * m;
    frame.style.left = (fo.x - m) + 'px'; frame.style.top = (fo.y - m) + 'px';
    frame.setAttribute('width', lw); frame.setAttribute('height', lh); frame.setAttribute('viewBox', '0 0 ' + lw + ' ' + lh);
    framePath.setAttribute('d',
      'M ' + (lw - rad) + ' 0 H ' + rad + ' A ' + rad + ' ' + rad + ' 0 0 0 0 ' + rad +
      ' V ' + (lh - rad) + ' A ' + rad + ' ' + rad + ' 0 0 0 ' + rad + ' ' + lh +
      ' H ' + (lw - rad) + ' A ' + rad + ' ' + rad + ' 0 0 0 ' + lw + ' ' + (lh - rad) +
      ' V ' + rad + ' A ' + rad + ' ' + rad + ' 0 0 0 ' + (lw - rad) + ' 0 Z');
    frameLen = 2 * (lw + lh) - (8 - 2 * Math.PI) * rad;
    framePath.style.strokeDasharray = frameLen;
    frameTop = fo.y - m; frameH = lh; lastW = w;
    built = true; lastT = null; lastO = lastF = -1;
    update();
  }

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function update() {
    raf = 0;
    if (!built) { build(); return; }
    var sy = window.pageYOffset || document.documentElement.scrollTop || 0;
    var vh = window.innerHeight;
    var formPage = main.getBoundingClientRect().top + sy + frameTop;
    var fp = reduced ? 1 : clamp((sy + vh * 0.85 - formPage) / (frameH * 0.7 + vh * 0.05));   /* המסגרת נמשכת בקצב הגלילה */
    var p = clamp(sy / Math.max(1, formPage - vh * 0.85));                                    /* ההתקדמות של הפס לאורך העמוד */
    var headY = hb + (vh * 0.72 - hb) * p;
    var t = Math.round(headY - hb - TAIL);
    if (t !== lastT) { lastT = t; comet.style.transform = 'translate3d(0,' + t + 'px,0)'; }
    var o = reduced ? 0 : Math.round(clamp(sy / (vh * 0.15)) * (1 - clamp(fp * 10)) * 20);
    if (o !== lastO) { lastO = o; rail.style.opacity = o / 20; }
    var f = Math.round(fp * 400);
    if (f !== lastF) { lastF = f; framePath.style.strokeDashoffset = frameLen * (1 - f / 400); frame.style.visibility = f ? 'visible' : 'hidden'; }
  }

  function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
  function scheduleBuild(ms) { if (buildTimer) clearTimeout(buildTimer); buildTimer = setTimeout(function () { requestAnimationFrame(build); }, ms || 120); }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { scheduleBuild(200); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { scheduleBuild(50); });
  if (window.ResizeObserver) {
    var first = true, lastH = main.scrollHeight;
    new ResizeObserver(function () {
      if (first) { first = false; return; }
      var h = main.scrollHeight, w = main.clientWidth;
      if (Math.abs(h - lastH) > 2 || w !== lastW) { lastH = h; scheduleBuild(150); }
    }).observe(main);
  }
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { reduced = mq.matches; lastT = null; lastO = lastF = -1; update(); });

  /* בנייה ראשונה אחרי הטעינה, בזמן פנוי; גלילה לפני כן בונה מיד */
  function init() { if ('requestIdleCallback' in window) requestIdleCallback(build, { timeout: 800 }); else setTimeout(build, 200); }
  if (document.readyState === 'complete') init(); else window.addEventListener('load', init);
})();
