/* consent.js — באנר הסכמה לעוגיות וטעינת Google Analytics רק לאחר אישור.
   נטען בראש כל עמוד במקום קוד ה־GA הישיר:
   - ללא בחירה: GA לא נטען כלל ומוצג באנר קטן בתחתית העמוד.
   - "דוחים": הבחירה נשמרת, GA נשאר כבוי (גם בעמודים אחרים ובביקורים הבאים).
   - "מאשרים": GA נטען ומתחילה מדידה.
   - שינוי דעה מאישור לדחייה: המדידה נעצרת מיד (גם אם GA כבר נטען),
     עוגיות ה־_ga נמחקות, וההשבתה נשמרת לביקורים הבאים.
   הבחירה נשמרת ב־localStorage ותקפה לכל עמודי האתר; ניתן לשנותה דרך "הגדרות עוגיות" בפוטר. */
(function () {
  'use strict';

  var GA_ID = 'G-MZVSVTV6XM';
  var STORAGE_KEY = 'rl-analytics-consent';
  var DISABLE_KEY = 'ga-disable-' + GA_ID; // מנגנון ההשבתה הרשמי של GA

  /* stub תמיד זמין כדי שקריאות gtag מהאתר לא ייכשלו; כל עוד אין אישור
     הקריאות לא נשמרות ולא נשלחות לגוגל בשום צורה. */
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

  /* מחיקת עוגיות המדידה של GA */
  function clearGACookies() {
    var names = ['_ga'];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name.indexOf('_ga_') === 0) names.push(name);
    });
    var domains = [location.hostname, '.' + location.hostname];
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

  function showBanner() {
    if (document.getElementById('cookie-banner') || !document.body) return;
    var b = document.createElement('div');
    b.id = 'cookie-banner';
    b.setAttribute('role', 'region');
    b.setAttribute('aria-label', 'הודעה על שימוש בעוגיות');
    b.innerHTML =
      '<div class="cb-icon" aria-hidden="true">' + COOKIE_ICON + '</div>' +
      '<p class="cb-text">האתר משתמש בעוגיות (<span class="ltr">Cookies</span>) למדידת תנועה באמצעות <span class="ltr">Google Analytics</span>. אפשר לאשר או לדחות. פרטים ב<a href="/privacy-policy/">מדיניות הפרטיות</a>.</p>' +
      '<div class="cb-actions">' +
      '<button type="button" class="cb-btn cb-accept">' + CHECK_ICON + '<span>מאשרים</span></button>' +
      '<button type="button" class="cb-btn cb-reject">' + X_ICON + '<span>דוחים</span></button>' +
      '</div>';
    b.querySelector('.cb-accept').addEventListener('click', function () { choose('accepted'); });
    b.querySelector('.cb-reject').addEventListener('click', function () { choose('rejected'); });
    document.body.appendChild(b);
    document.documentElement.classList.add('has-cookie-banner');
  }

  /* פתיחה מחדש של הבאנר מ"הגדרות עוגיות" בפוטר */
  window.rlCookieSettings = function () {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    showBanner();
  };

  function init() {
    var settingsBtn = document.getElementById('cookie-settings-link');
    if (settingsBtn) settingsBtn.addEventListener('click', window.rlCookieSettings);
    if (!getChoice()) showBanner();
  }

  /* ההחלטה על המדידה מתבצעת מיד, סינכרונית, עוד לפני שהעמוד נטען */
  if (getChoice() === 'accepted') enableGA();
  else disableGA();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
