/* אתחול ערכת הנושא (בהיר/כהה) - רץ בראש כל עמוד לפני הציור הראשון כדי למנוע הבהוב:
   בחירה ידנית במתג הכותרת נשמרת ב-localStorage ('rl-theme'); בלעדיה נקבע לפי העדפת המכשיר,
   ושינוי העדפת המכשיר מתעדכן אוטומטית כל עוד לא נשמרה בחירה ידנית. */
(function () {
  'use strict';
  var root = document.documentElement;
  var mq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
  function manual() {
    try { var t = localStorage.getItem('rl-theme'); return (t === 'light' || t === 'dark') ? t : null; } catch (_) { return null; }
  }
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'dark' ? '#0C1F22' : '#14393D');
  }
  applyTheme(manual() || (mq && mq.matches ? 'dark' : 'light'));
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { if (!manual()) applyTheme(mq.matches ? 'dark' : 'light'); });
})();

/* consent.js: מדידה מתחילה בטעינה באתר החי, אלא אם נשמר ביטול.
   הודעת יידוע עם כפתור הבנתי; ניתן לבטל דרך הגדרות עוגיות.
   תצוגות מקדימות ומארחים אחרים אינם פונים לנכס המדידה האמיתי. */
(function () {
  'use strict';

  var GA_ID = 'G-MZVSVTV6XM';
  var STORAGE_KEY = 'rl-analytics-consent';
  var IS_PRODUCTION_HOST = location.protocol === 'https:' &&
    (location.hostname === 'www.lasker-insurances.com' || location.hostname === 'lasker-insurances.com');
  var DISABLE_KEY = 'ga-disable-' + GA_ID; // מנגנון ההשבתה הרשמי של GA

  /* אין אגירת אירועים בזמן ביטול או בתצוגה מקדימה. */
  window.dataLayer = window.dataLayer || [];
  function gtagOn() { window.dataLayer.push(arguments); }
  function gtagOff() { /* חסום: לא ניתנה הסכמה */ }
  window.gtag = gtagOff;

  function getChoice() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function loadGA() {
    if (document.getElementById('ga-script')) return;
    var s = document.createElement('script');
    s.async = true;
    s.id = 'ga-script';
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  }

  /* הפעלת מדידה */
  function enableGA() {
    if (!IS_PRODUCTION_HOST) { disableGA(); return; }
    window[DISABLE_KEY] = false;
    window.gtag = gtagOn;
    loadGA();
  }

  /* עצירת מדידה מיידית — גם אם הספרייה כבר נטענה בעמוד הזה */
  function disableGA() {
    window[DISABLE_KEY] = true;
    window.gtag = gtagOff;
    clearGACookies();
  }

  /* מחיקת עוגיות המדידה של GA. העוגיות נשמרות על הדומיין הראשי
     (למשל .lasker-insurances.com), לכן מנסים כל סיומת דומיין אפשרית. */
  function clearGACookies() {
    var names = ['_ga'];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name.indexOf('_ga_') === 0 && names.indexOf(name) === -1) names.push(name);
    });
    var parts = location.hostname.split('.');
    var domains = [location.hostname];
    for (var i = 0; i < parts.length - 1; i++) {
      domains.push(parts.slice(i).join('.'));
      domains.push('.' + parts.slice(i).join('.'));
    }
    names.forEach(function (name) {
      domains.forEach(function (domain) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + domain;
      });
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    });
  }

  function removeBanner() {
    var b = document.getElementById('cookie-banner');
    if (b) b.remove();
    document.documentElement.classList.remove('has-cookie-banner');
  }

  function choose(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
    removeBanner();
    if (value === 'accepted') enableGA();
    else disableGA();
  }

  var COOKIE_ICON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>';
  var CHECK_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"/></svg>';
  var X_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

  function showBanner(withdraw) {
    if (!document.body) return;
    if (document.getElementById('cookie-banner')) {
      if (!withdraw) return;
      removeBanner();
    }
    var b = document.createElement('div');
    b.id = 'cookie-banner';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', 'הודעה על שימוש בעוגיות');
    b.innerHTML =
      '<div class="cb-icon" aria-hidden="true">' + COOKIE_ICON + '</div>' +
      '<p class="cb-text">האתר משתמש בעוגיות (<span class="ltr">Cookies</span>) למדידת תנועה באמצעות <span class="ltr">Google Analytics</span>. המשך הגלישה באתר מהווה הסכמה למדידה. פרטים ב<a href="/privacy-policy/">מדיניות הפרטיות</a>.</p>' +
      '<div class="cb-actions">' +
      '<button type="button" class="cb-btn cb-accept">' + CHECK_ICON + '<span>הבנתי</span></button>' +
      (withdraw ? '<button type="button" class="cb-btn cb-reject">' + X_ICON + '<span>ביטול מדידה</span></button>' : '') +
      '</div>';
    b.querySelector('.cb-accept').addEventListener('click', function () { choose('accepted'); });
    var rj = b.querySelector('.cb-reject');
    if (rj) rj.addEventListener('click', function () { choose('rejected'); });
    document.body.appendChild(b);
    document.documentElement.classList.add('has-cookie-banner');
  }

  /* פתיחה מחדש של הבאנר מ"הגדרות עוגיות" בפוטר */
  window.rlCookieSettings = function () {
    showBanner(true);
    var choice = document.querySelector('#cookie-banner .cb-reject');
    if (choice) choice.focus();
  };

  function init() {
    var settingsBtn = document.getElementById('cookie-settings-link');
    if (settingsBtn) settingsBtn.addEventListener('click', window.rlCookieSettings);
    if (!getChoice()) showBanner();
  }

  /* ההחלטה על המדידה מתבצעת מיד, סינכרונית, עוד לפני שהעמוד נטען */
  if (getChoice() === 'rejected') disableGA();
  else enableGA();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
