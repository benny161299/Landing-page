/* core.js — אתחול משותף וכלי עזר לכל שאר המודולים.
   נטען ראשון בכל עמוד (defer) וחושף מרחב שמות יחיד: window.RL */
(function () {
  'use strict';
  const doc = document;

  // ניקוי שאריות theme ישנות וסנכרון דגלי ווידג'טים מ-localStorage
  try {
    localStorage.removeItem('theme');
    doc.documentElement.removeAttribute('data-theme');
    if (localStorage.getItem('asw_accessibility_widget_dismissed') === 'true') {
      doc.documentElement.setAttribute('data-asw-dismissed', 'true');
    }
    if (localStorage.getItem('qc_phone_widget_dismissed') === 'true') {
      doc.documentElement.setAttribute('data-qc-dismissed', 'true');
    }
  } catch (_) {}

  const $ = (s, r) => (r || doc).querySelector(s);
  const $$ = (s, r) => Array.from((r || doc).querySelectorAll(s));

  const reduce = Boolean(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const nf = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 });
  const fmtN = (n) => nf1.format(n);
  const ils = (n) => nf.format(Math.round(n)) + ' ₪';
  const WA = '972559535605';

  /* בניית אלמנטים במנגנון DOM בטוח (חלופה ל-innerHTML):
     attrs: { text } מוזן כ-textContent, 'class' וכל שאר המפתחות כ-setAttribute. */
  function el(tag, attrs, children) {
    const node = doc.createElement(tag);
    setAttrs(node, attrs);
    appendChildren(node, children);
    return node;
  }
  const SVG_NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs, children) {
    const node = doc.createElementNS(SVG_NS, tag);
    setAttrs(node, attrs);
    appendChildren(node, children);
    return node;
  }
  function setAttrs(node, attrs) {
    if (!attrs) return;
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null) continue;
      if (k === 'class' && v === '') continue;
      if (k === 'text') node.textContent = v;
      else node.setAttribute(k, String(v));
    }
  }
  function appendChildren(node, children) {
    if (!children) return;
    for (const c of [].concat(children)) {
      if (c) node.appendChild(c);
    }
  }

  /* מדידת GA4: track בטוח גם כשהתג לא נטען (חוסם פרסומות / תקלה),
     ומדידת לחיצות על יצירת קשר בלי לשלוח פרטים אישיים - רק סוג הפעולה. */
  function track(eventName, params) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', eventName, params || {});
    } catch (_) {}
  }
  doc.addEventListener('click', (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.startsWith('https://wa.me/')) track('contact_click', { contact_method: 'whatsapp' });
    else if (href.startsWith('tel:')) track('contact_click', { contact_method: 'phone' });
    else if (href.startsWith('mailto:')) track('contact_click', { contact_method: 'email' });
  }, true);

  window.RL = { doc, $, $$, reduce, nf, nf1, fmtN, ils, WA, el, svgEl, track };
})();
