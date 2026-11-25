/* scroll-line.js - פס זהב קצר עם זנב דועך שמלווה את הגלילה בשוליים עד סוף העמוד, ובאזור טופס יצירת הקשר נוצרת הילת זהב עדינה סביבו.
   קל במכוון: אלמנט אחד קבוע (position:fixed) שמוזז רק ב־transform, ואלמנט הילה אחד שמשתנה רק ב־opacity.
   המצב תלוי רק במקום הגלילה הנוכחי (לא במצב קודם), ולכן גם בגלילה לאחור וגם בשינוי גובה החלון הכול עקבי.
   מכבד את כפתור "עצירת אנימציות" של ווידג'ט הנגישות (asw-stop-animations) ואת prefers-reduced-motion: הפס נעלם וההילה נשארת סטטית.
   דקורטיבי בלבד (aria-hidden). */
(function () {
  'use strict';
  var main = document.getElementById('main');
  var form = main && main.querySelector('#home-form');
  if (!main || !form) return;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = !!(mq && mq.matches);
  var stopped = false;
  var TAIL = 170;

  var css = document.createElement('style');
  css.textContent =
    '.sl-rail{position:fixed;bottom:0;width:4px;overflow:hidden;pointer-events:none;z-index:5;contain:strict;opacity:0}' +
    '.sl-comet{position:absolute;left:0;top:0;width:100%;height:' + TAIL + 'px;border-radius:4px;will-change:transform;' +
    'background:linear-gradient(to bottom,rgba(209,168,98,0),rgba(209,168,98,.55) 70%,#D1A862)}' +
    '.sl-halo{position:absolute;pointer-events:none;z-index:5;opacity:0}' +
    '.sl-halo-glow{position:absolute;inset:0;border-radius:inherit;' +
    'box-shadow:0 0 18px 4px rgba(209,168,98,.55),0 0 44px 12px rgba(209,168,98,.22);' +
    'animation:sl-halo-pulse 3.4s ease-in-out infinite alternate}' +
    '@keyframes sl-halo-pulse{from{opacity:.72}to{opacity:1}}' +
    '.marquee{position:relative;z-index:6}' +
    '@media (prefers-reduced-motion:reduce){.sl-halo-glow{animation:none}}' +
    '@media print,(forced-colors:active){.sl-rail,.sl-halo{display:none}}';
  document.head.appendChild(css);

  var rail = document.createElement('div');
  rail.className = 'sl-rail'; rail.setAttribute('aria-hidden', 'true');
  var comet = document.createElement('div');
  comet.className = 'sl-comet';
  rail.appendChild(comet);
  document.body.appendChild(rail);

  var halo = document.createElement('div');
  halo.className = 'sl-halo'; halo.setAttribute('aria-hidden', 'true');
  var haloGlow = document.createElement('div');
  haloGlow.className = 'sl-halo-glow';
  halo.appendChild(haloGlow);
  if (getComputedStyle(main).position === 'static') main.style.position = 'relative';
  main.insertBefore(halo, main.firstChild);

  var desktop = false, built = false, hb = 0, haloTop = 0, haloH = 0;
  var lastT = null, lastO = -1, lastF = -1, raf = 0, buildTimer = 0, lastW = 0;
  var portraitImg = main.querySelector('.portrait img'), lastPP = -1;

  /* מיקום לפי פריסה (offsetTop/Left), לא לפי getBoundingClientRect: אנימציות חשיפה (transform) משנות את ה־rect לפי מקום הגלילה */
  function off(n) { var y = 0, x = 0, e = n; while (e && e !== main) { y += e.offsetTop; x += e.offsetLeft; e = e.offsetParent; } return e === main ? { x: x, y: y } : null; }

  /* "עצירת אנימציות" של הווידג'ט: הווידג'ט מוסיף מחלקה ל־<html> ושומר ב־localStorage. הבדיקה כפולה כדי לתפוס גם מצב שמור לפני שהווידג'ט נטען */
  function readStopped() {
    if (document.documentElement.classList.contains('asw-stop-animations')) return true;
    try {
      var raw = localStorage.getItem('asw-user-settings');
      if (raw) { var st = JSON.parse(raw).states; if (st && st['stop-animations']) return true; }
    } catch (e) {}
    return false;
  }

  function build() {
    buildTimer = 0;
    var w = main.clientWidth;
    var hdr = document.querySelector('header');
    hb = hdr ? hdr.offsetHeight : 0;            /* לא offsetTop: הכותרת דביקה */
    var wrap = main.querySelector('.wrap');
    var pad = wrap ? Math.max(0, wrap.getBoundingClientRect().left + parseFloat(getComputedStyle(wrap).paddingLeft)) : 20;
    var gut = Math.max(7, Math.min(44, pad * 0.5));
    /* במחשב (רוחב מעל 860px) הפס האנכי לא מוצג; ההילה סביב הטופס נשארת. במובייל הפס פעיל */
    desktop = !!(window.matchMedia && window.matchMedia('(min-width: 861px)').matches);
    rail.style.top = hb + 'px';
    rail.style.right = Math.round(gut - 2) + 'px';

    var fo = off(form);
    if (!fo || w < 320) { rail.style.display = halo.style.display = 'none'; built = true; return; }
    halo.style.display = ''; rail.style.display = desktop ? 'none' : '';
    var m = 0; /* ההילה צמודה למסגרת הכרטיס עצמו (המסגרת הפנימית), בלי מסגרת חיצונית מרוחקת */
    halo.style.left = (fo.x - m) + 'px';
    halo.style.top = (fo.y - m) + 'px';
    halo.style.width = (form.offsetWidth + 2 * m) + 'px';
    halo.style.height = (form.offsetHeight + 2 * m) + 'px';
    halo.style.borderRadius = (20 + m) + 'px ' + (20 + m) + 'px ' + (20 + m) + 'px ' + (4 + m) + 'px'; /* כמו הכרטיס: 20px 20px 20px 4px */
    haloTop = fo.y - m; haloH = form.offsetHeight + 2 * m; lastW = w;
    built = true; lastT = null; lastO = lastF = -1;
    update();
  }

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function update() {
    raf = 0;
    if (!built) { build(); return; }
    var sy = window.scrollY || document.documentElement.scrollTop || 0;
    var vh = window.innerHeight;
    var still = reduced || stopped;
    var docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    var formPage = main.getBoundingClientRect().top + sy + haloTop;
    var fp = still ? 1 : clamp((sy + vh * 0.85 - formPage) / (haloH * 0.7 + vh * 0.05));   /* ההילה נוצרת בקצב הגלילה */
    var p = clamp(sy / Math.max(1, docH - vh));                                            /* ההתקדמות של הפס עד סוף העמוד */
    var headY = hb + (vh - hb) * p;   /* הראש מגיע לקצה התחתון של המסך בסוף העמוד */
    var t = Math.round(headY - hb - TAIL);
    if (t !== lastT) { lastT = t; comet.style.transform = 'translate3d(0,' + t + 'px,0)'; }
    var o = still ? 0 : Math.round(clamp(sy / (vh * 0.15)) * 20);
    if (o !== lastO) { lastO = o; rail.style.opacity = o / 20; }
    var f = Math.round(fp * 100);
    if (f !== lastF) { lastF = f; halo.style.opacity = f / 100; }
    updatePortrait(sy, still);
  }

  /* התמונה של רחל נכנסת למסגרת בגלילה כלפי מטה: --pp=0 מחוץ למסגרת בראש העמוד, 1 בתוכה.
     בהפחתת תנועה או "עצירת אנימציות" נשארת תמיד בתוך המסגרת (1) בלי תנועה. */
  function updatePortrait(sy, still) {
    if (!portraitImg) return;
    var r = Math.round((still ? 1 : clamp(sy / 220)) * 100);
    if (r !== lastPP) {
      lastPP = r;
      portraitImg.style.setProperty('--pp', String(r / 100));
      if (!portraitImg.classList.contains('portrait-motion-ready')) {
        void portraitImg.offsetWidth;
        requestAnimationFrame(function () { portraitImg.classList.add('portrait-motion-ready'); });
      }
      /* הילת זהב על המסגרת כשהתמונה משלימה את הכניסה (וכיבוי בגלילה חזרה) */
      var frame = portraitImg.parentNode;
      if (frame && frame.classList) frame.classList.toggle('in-frame', r === 100);
    }
  }

  function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
  function scheduleBuild(ms) { if (buildTimer) clearTimeout(buildTimer); buildTimer = setTimeout(function () { requestAnimationFrame(build); }, ms || 120); }
  function onStopChange() { var s = readStopped(); if (s !== stopped) { stopped = s; lastT = null; lastO = lastF = -1; update(); } }

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

  /* חיבור לכפתור "עצירת אנימציות": מעקב אחרי המחלקה ב־<html> (שינוי באותו טאב) ואירוע storage (טאב אחר) */
  stopped = readStopped();
  updatePortrait(window.scrollY || document.documentElement.scrollTop || 0, reduced || stopped);
  if (window.MutationObserver) new MutationObserver(onStopChange).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('storage', function (e) { if (!e.key || e.key === 'asw-user-settings') onStopChange(); });

  /* בנייה ראשונה אחרי הטעינה, בזמן פנוי; גלילה לפני כן בונה מיד */
  function init() { if ('requestIdleCallback' in window) requestIdleCallback(build, { timeout: 800 }); else setTimeout(build, 200); }
  if (document.readyState === 'complete') init(); else window.addEventListener('load', init);
})();
