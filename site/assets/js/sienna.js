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
      let raw = '';
      try { raw = localStorage.getItem('asw-user-settings') || ''; } catch (e) {}
      let states = {};
      try { if (raw) states = JSON.parse(raw).states || {}; } catch (e) {}

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
      if (img) tooltipEl.classList.remove('is-visible');
    });

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
