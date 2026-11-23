/* sienna.js — השלמות לווידג'ט הנגישות Sienna: הסתרת תמונות ותיאורי תמונה מרחפים. נטען בכל עמוד. */
(function () {
  'use strict';
  const { doc, el } = window.RL;

  function initSiennaEnhancements() {
    const tooltipEl = el('div', {
      class: 'asw-floating-tooltip',
      role: 'tooltip',
      'aria-hidden': 'true'
    });
    doc.body.appendChild(tooltipEl);

    function updateSiennaFeatures() {
      const opener = doc.querySelector('.asw-menu-btn');
      if (opener) {
        opener.setAttribute('aria-label', 'תפריט נגישות ועצירת אנימציות');
        opener.setAttribute('title', 'תפריט נגישות ועצירת אנימציות');
      }
      const motion = doc.querySelector('[data-key="stop-animations"]');
      if (motion) motion.setAttribute('aria-label', 'עצירת אנימציות');
      const hideBtn = doc.querySelector('[data-key="hide-images"]');
      let isHide = hideBtn ? hideBtn.classList.contains('asw-selected') : false;

      const tooltipBtn = doc.querySelector('[data-key="image-tooltips"]');
      let isTooltips = tooltipBtn ? tooltipBtn.classList.contains('asw-selected') : false;

      const adhdBtn = doc.querySelector('[data-key="adhd-friendly"]');
      if (adhdBtn && adhdBtn.classList.contains('asw-selected')) isHide = true;
      const blindBtn = doc.querySelector('[data-key="blind"]');
      if (blindBtn && blindBtn.classList.contains('asw-selected')) isTooltips = true;

      doc.documentElement.classList.toggle('asw-hide-images', isHide);
      doc.documentElement.classList.toggle('asw-image-tooltips', isTooltips);
    }

    doc.addEventListener('mouseover', (e) => {
      if (!doc.documentElement.classList.contains('asw-image-tooltips')) return;
      const img = e.target && e.target.closest ? e.target.closest('img:not(.asw-menu img):not(.asw-widget img)') : null;
      if (img) {
        const alt = (img.getAttribute('alt') || '').trim();
        tooltipEl.textContent = 'תיאור תמונה: ' + (alt || 'ללא תיאור טקסטואלי');
        tooltipEl.classList.add('is-visible');
        tooltipEl.setAttribute('aria-hidden', 'false');
      }
    });

    doc.addEventListener('mousemove', (e) => {
      if (!tooltipEl.classList.contains('is-visible')) return;
      let x = e.clientX - 20;
      let y = e.clientY + 20;
      if (x + 320 > window.innerWidth) x = window.innerWidth - 330;
      if (x < 10) x = 10;
      if (y + 60 > window.innerHeight) y = e.clientY - 50;
      tooltipEl.style.left = x + 'px';
      tooltipEl.style.top = y + 'px';
    });

    doc.addEventListener('mouseout', (e) => {
      const img = e.target && e.target.closest ? e.target.closest('img:not(.asw-menu img):not(.asw-widget img)') : null;
      if (img && !tooltipEl.contains(e.relatedTarget)) hideTooltip();
    });

    function hideTooltip() { tooltipEl.classList.remove('is-visible'); tooltipEl.setAttribute('aria-hidden', 'true'); }
    doc.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTooltip(); });
    doc.addEventListener('focusin', (e) => {
      if (!doc.documentElement.classList.contains('asw-image-tooltips')) return;
      const img = e.target.matches('img') ? e.target : e.target.querySelector('img');
      if (!img || img.closest('.asw-widget, .asw-menu')) return;
      tooltipEl.textContent = 'תיאור תמונה: ' + (img.getAttribute('alt') || 'ללא תיאור טקסטואלי');
      tooltipEl.classList.add('is-visible'); tooltipEl.setAttribute('aria-hidden', 'false');
      const r = e.target.getBoundingClientRect();
      tooltipEl.style.left = Math.max(10, Math.min(r.left, innerWidth - 330)) + 'px';
      tooltipEl.style.top = Math.min(r.bottom + 10, innerHeight - 70) + 'px';
    });
    doc.addEventListener('focusout', hideTooltip);
    tooltipEl.addEventListener('mouseleave', hideTooltip);

    // Run on startup
    updateSiennaFeatures();

    // Listen to clicks on accessibility menu or reset buttons
    doc.addEventListener('click', (e) => {
      if (e.target && e.target.closest && (e.target.closest('.asw-menu') || e.target.closest('.asw-widget') || e.target.closest('.asw-btn'))) {
        setTimeout(updateSiennaFeatures, 40);
        setTimeout(updateSiennaFeatures, 200);
      }
    });

    // Listen to storage changes across tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'asw-user-settings') updateSiennaFeatures();
    });

    // Check periodically during the first few seconds until Sienna is initialized
    let checks = 0;
    const interval = setInterval(() => {
      updateSiennaFeatures();
      checks++;
      if (checks > 15) clearInterval(interval);
    }, 400);
  }

  initSiennaEnhancements();
})();
