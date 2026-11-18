/* scroll-line.js - קו זהב דק שמלווה את הגלילה בדף הבית.
   מתחיל מהלוגו כשמתחילים לגלול, מתפתל בשוליים הריקים, ומסתיים בסיבוב סביב טופס יצירת הקשר.
   קל במכוון: הגיאומטריה מחושבת פעם אחת בחישוב מתמטי (בלי מדידות SVG),
   ובזמן הגלילה מתעדכן רק ערך חיתוך אחד ושוליים של לולאה קטנה. דקורטיבי בלבד (aria-hidden). */
(function () {
  'use strict';
  var main = document.getElementById('main');
  if (!main || !window.SVGElement) return;
  var NS = 'http://www.w3.org/2000/svg';
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = !!(mq && mq.matches);

  var css = document.createElement('style');
  css.textContent =
    '.sl-svg,.sl-loop{position:absolute;pointer-events:none;z-index:5;overflow:visible}' +
    '.sl-svg{top:0;left:0}' +
    '.sl-line{fill:none;stroke:#D1A862;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}' +
    '.sl-stop{fill:#D1A862;stroke:#8A6127;stroke-width:2}' +
    '.marquee{position:relative;z-index:6}' +
    '@media print,(forced-colors:active){.sl-svg,.sl-loop{display:none}}';
  document.head.appendChild(css);

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  var svg = el('svg', { 'class': 'sl-svg', 'aria-hidden': 'true', focusable: 'false', width: 0, height: 0 });
  var mainPath = el('path', { 'class': 'sl-line' });
  svg.appendChild(mainPath);
  var loopSvg = el('svg', { 'class': 'sl-loop', 'aria-hidden': 'true', focusable: 'false', width: 0, height: 0 });
  var loopPath = el('path', { 'class': 'sl-line' });
  loopSvg.appendChild(loopPath);
  if (getComputedStyle(main).position === 'static') main.style.position = 'relative';
  main.insertBefore(svg, main.firstChild);
  main.insertBefore(loopSvg, main.firstChild);

  var built = false, startY = 0, mainH = 0, headMax = 0;
  var loopTop = 0, loopH = 0, loopLen = 0, loopStartY = 0;
  var lastClip = -1, lastLoop = -1, raf = 0, buildTimer = 0, lastBuildH = 0, lastBuildW = 0;

  function bez(a, b, c, d, t) {
    var u = 1 - t;
    return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
  }

  function build() {
    buildTimer = 0;
    var r = main.getBoundingClientRect();
    var w = main.clientWidth, h = main.scrollHeight;
    var docTop = r.top + (window.pageYOffset || 0);
    /* מיקום לפי פריסה (offsetTop/Left), לא לפי getBoundingClientRect: אנימציות חשיפה (transform) משנות את ה־rect לפי מקום הגלילה בזמן הבנייה */
    function off(n) { var y = 0, x = 0, e = n; while (e && e !== main) { y += e.offsetTop; x += e.offsetLeft; e = e.offsetParent; } return e === main ? { x: x, y: y } : null; }
    function T(n) { var o = off(n); return o ? o.y : n.getBoundingClientRect().top - r.top; }
    var q = function (s) { return main.querySelector(s); };
    var faqH = q('#home-faq-h');
    var secs = [q('.hero'), q('#services'), q('#how'), q('#about'), q('section.band:not(#contact)'), faqH && faqH.closest('section'), q('#contact')]
      .filter(function (s, i, a) { return s && a.indexOf(s) === i; });
    var form = q('#home-form');
    var logo = document.querySelector('header .brand img') || document.querySelector('header .brand');
    if (secs.length < 3 || w < 320 || !form || !logo) { svg.style.display = loopSvg.style.display = 'none'; built = true; return; }
    svg.style.display = loopSvg.style.display = '';

    /* קריאות DOM בלבד, בבת אחת */
    var wrap = q('.wrap');
    var pad = wrap ? Math.max(0, wrap.getBoundingClientRect().left + parseFloat(getComputedStyle(wrap).paddingLeft) - r.left) : 20;
    var gut = Math.max(7, Math.min(44, pad * 0.5));
    var R = w - gut, L = gut;
    var lr = logo.getBoundingClientRect(), hdr = logo.closest('header');
    var logoX = lr.left - r.left + lr.width / 2;
    /* לא להשתמש ב־hdr.offsetTop: הכותרת דביקה (sticky), והערך שלה תלוי במקום הגלילה בזמן הבנייה - זה שבר את הקו אחרי בנייה מחדש באמצע הגלילה */
    var logoY = hdr ? Math.max(0, hdr.offsetHeight - main.offsetTop) : 0;
    var secInfo = secs.map(function (s) {
      var cs = getComputedStyle(s), ps = s.previousElementSibling ? getComputedStyle(s.previousElementSibling) : null;
      var prev = s.previousElementSibling;
      return {
        top: T(s), padTop: parseFloat(cs.paddingTop),
        prevContentBottom: prev ? T(prev) + prev.offsetHeight - parseFloat(ps.paddingBottom) : 0,
        faq: !!s.querySelector('.faq'), id: s.id,
        stops: [].slice.call(s.querySelectorAll(s.id === 'services' ? '.svc-group' : s.id === 'how' ? '.steps li' : (s.querySelector('.faq') ? '.faq details' : '.sl-none')), 0, 6)
          .map(function (st) { var t = T(st); return { t: t, b: t + st.offsetHeight, m: t + Math.min(st.offsetHeight / 2, 40) }; })
      };
    });
    var fo = off(form);
    var fx = fo ? fo.x : form.getBoundingClientRect().left - r.left, fy = T(form), fw = form.offsetWidth, fh = form.offsetHeight;

    /* גיאומטריה */
    var side = R, pts = [], marks = [];
    pts.push({ x: logoX, y: logoY + 4 });
    pts.push({ x: R, y: logoY + 4 });     /* לאורך תחתית הכותרת, בלי לחצות טקסט */
    pts.push({ x: R, y: logoY + 40 });
    var lastYm = null;
    function cross(y) {          /* מעבר אופקי ישר לצד השני, בפינות של 90 מעלות */
      pts.push({ x: side, y: y });
      side = side === R ? L : R;
      pts.push({ x: side, y: y });
    }
    secInfo.forEach(function (s, i) {
      var isLast = i === secInfo.length - 1;
      if (i > 0) {
        var from = s.prevContentBottom + 10, to = s.top + s.padTop - 10;
        if (to - from < 40) { from = s.top - 40; to = s.top - 4; }
        var ym = (from + to) / 2;
        if (isLast) lastYm = ym; else cross(ym);
      }
      if (isLast) return;
      s.stops.forEach(function (st, j) {
        if (!(w < 700 && s.faq)) marks.push({ x: side, y: st.m });
        var nx = s.stops[j + 1];
        if (nx && nx.t - st.b >= 14) cross((st.b + nx.t) / 2);     /* אלמנט חדש: עוברים צד */
      });
    });
    /* לולאה סביב הטופס */
    var m = 14, rad = 26;
    var lx = fx - m, ly = fy - m, lw = fw + 2 * m, lh = fh + 2 * m;     /* בקואורדינטות main */
    var sy = ly;
    var wantRight = fx + fw / 2 > w / 2;
    /* נכנסים לטופס מהשוליים הקרובים אליו (לא דרך הטקסט שמעליו): חוצים בחלל הריק, יורדים בשוליים, ואז פנייה קצרה לפינת הלולאה */
    if (lastYm !== null && lastYm < sy - 20 && side !== (wantRight ? R : L)) cross(lastYm);
    var startOnRight = side === R;                                       /* פינת הפתיחה של הלולאה בצד של הקו, כך שאין מעבר אופקי ארוך */
    var sx = startOnRight ? lx + lw - rad : lx + rad;                    /* נקודת פתיחה על הקצה העליון */
    pts.push({ x: side, y: sy });
    pts.push({ x: sx, y: sy });
    /* y לא יורד אף פעם (אחרת החיתוך חושף קטעים שלא לפי הסדר בגלילה לאחור) */
    for (var pi = 1; pi < pts.length; pi++) if (pts[pi].y < pts[pi - 1].y) pts[pi].y = pts[pi - 1].y;
    var end = pts[pts.length - 1];
    var d = 'M ' + pts[0].x + ' ' + pts[0].y;
    for (var i = 1; i < pts.length; i++) d += ' L ' + pts[i].x + ' ' + pts[i].y;
    mainPath.setAttribute('d', d);

    svg.setAttribute('width', w); svg.setAttribute('height', h);
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    while (svg.childNodes.length > 1) svg.removeChild(svg.lastChild);
    marks.forEach(function (mk) {
      svg.appendChild(el('circle', { cx: mk.x, cy: mk.y, r: 5.5, 'class': 'sl-stop' }));
    });
    startY = logoY; headMax = end.y; mainH = h;

    /* הלולאה: SVG קטן משלו, מצויר לפי התקדמות הגלילה */
    var lw2 = lw, lh2 = lh;
    loopSvg.style.left = lx + 'px'; loopSvg.style.top = ly + 'px';
    loopSvg.setAttribute('width', lw2); loopSvg.setAttribute('height', lh2);
    loopSvg.setAttribute('viewBox', '0 0 ' + lw2 + ' ' + lh2);
    var x0 = startOnRight ? lw2 - rad : rad;
    var ld = startOnRight
      ? 'M ' + x0 + ' 0 H ' + rad + ' A ' + rad + ' ' + rad + ' 0 0 0 0 ' + rad + ' V ' + (lh2 - rad) + ' A ' + rad + ' ' + rad + ' 0 0 0 ' + rad + ' ' + lh2 + ' H ' + (lw2 - rad) + ' A ' + rad + ' ' + rad + ' 0 0 0 ' + lw2 + ' ' + (lh2 - rad) + ' V ' + rad + ' A ' + rad + ' ' + rad + ' 0 0 0 ' + (lw2 - rad) + ' 0 Z'
      : 'M ' + x0 + ' 0 H ' + (lw2 - rad) + ' A ' + rad + ' ' + rad + ' 0 0 1 ' + lw2 + ' ' + rad + ' V ' + (lh2 - rad) + ' A ' + rad + ' ' + rad + ' 0 0 1 ' + (lw2 - rad) + ' ' + lh2 + ' H ' + rad + ' A ' + rad + ' ' + rad + ' 0 0 1 0 ' + (lh2 - rad) + ' V ' + rad + ' A ' + rad + ' ' + rad + ' 0 0 1 ' + rad + ' 0 Z';
    loopPath.setAttribute('d', ld);
    loopLen = 2 * (lw2 + lh2) - (8 - 2 * Math.PI) * rad;
    loopPath.style.strokeDasharray = loopLen;
    loopTop = ly; loopH = lh2; loopStartY = ly;
    lastBuildH = h; lastBuildW = w;
    built = true; lastClip = lastLoop = -1;
    update();
  }

  function update() {
    raf = 0;
    if (!built) { build(); return; }
    var sy = window.pageYOffset || document.documentElement.scrollTop || 0;
    var mainTop = main.getBoundingClientRect().top + sy;
    var vh = window.innerHeight;
    var head, loopP;
    if (reduced) { head = mainH; loopP = 1; }
    else {
      /* בגלילה 0 הראש בלוגו (שום דבר לא נראה); תוך חצי מסך גלילה הוא עובר ל־60% מגובה המסך */
      var k = Math.min(1, sy / (vh * 0.4));
      var screenPos = (startY + mainTop) * (1 - k) + vh * 0.6 * k;     /* מקום הראש על המסך */
      head = sy + screenPos - mainTop;
      loopP = Math.max(0, Math.min(1, (head - headMax) / (loopH + vh * 0.1)));   /* מתחילה בדיוק כשהקו הראשי מגיע לקצה, ונמחקת אחורה באותו קצב */
      if (sy <= 0) head = startY;
    }
    if (head > headMax) head = mainH;
    var clip = Math.max(0, Math.round(mainH - head));
    if (clip !== lastClip) { lastClip = clip; svg.style.clipPath = 'inset(0 0 ' + clip + 'px 0)'; }
    var lp = Math.round(loopP * 400);
    if (lp !== lastLoop) { lastLoop = lp; loopPath.style.strokeDashoffset = loopLen * (1 - lp / 400); loopSvg.style.visibility = lp ? 'visible' : 'hidden'; }
  }

  function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
  function scheduleBuild(ms) { if (buildTimer) clearTimeout(buildTimer); buildTimer = setTimeout(function () { requestAnimationFrame(build); }, ms || 120); }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { scheduleBuild(200); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { scheduleBuild(50); });
  if (window.ResizeObserver) {
    var first = true;
    new ResizeObserver(function () {
      if (first) { first = false; return; }
      var h = main.scrollHeight, w = main.clientWidth;
      if (Math.abs(h - lastBuildH) > 2 || w !== lastBuildW) scheduleBuild(150);
    }).observe(main);
  }
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { reduced = mq.matches; lastClip = lastLoop = -1; update(); });

  /* בנייה ראשונה אחרי הטעינה, בזמן פנוי, כדי לא להתחרות בטעינת התוכן */
  svg.style.clipPath = 'inset(0 0 100% 0)'; loopSvg.style.visibility = 'hidden';
  function init() { if ('requestIdleCallback' in window) requestIdleCallback(build, { timeout: 800 }); else setTimeout(build, 200); }
  if (document.readyState === 'complete') init(); else window.addEventListener('load', init);
})();
