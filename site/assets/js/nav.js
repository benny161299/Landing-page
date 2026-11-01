/* nav.js — ניווט ראשי: תפריט מובייל, תתי-תפריטים, קישור דילוג. נטען בכל עמוד. */
(function () {
  'use strict';
  const { doc, $, $$, el, svgEl } = window.RL;

  const menuBtn = $('.menu-btn'), nav = $('#nav');

  function closeSubs(except) {
    $$('.sub-btn').forEach((b) => {
      if (b === except) return;
      b.setAttribute('aria-expanded', 'false');
      const s = doc.getElementById(b.getAttribute('aria-controls'));
      if (s) s.classList.remove('open');
    });
  }

  function closeMenu() {
    if (!nav) return;
    nav.classList.remove('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    doc.body.classList.remove('nav-open');
    closeSubs();
  }

  if (nav && !$('.nav-close', nav)) {
    const navClose = el('button', {
      type: 'button',
      class: 'nav-close',
      'aria-label': 'סגור תפריט ניווט'
    }, [
      svgEl('svg', {
        viewBox: '0 0 24 24', width: '26', height: '26', fill: 'none',
        stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round',
        'aria-hidden': 'true', focusable: 'false'
      }, [
        svgEl('line', { x1: '5', y1: '5', x2: '19', y2: '19' }),
        svgEl('line', { x1: '19', y1: '5', x2: '5', y2: '19' })
      ])
    ]);
    nav.insertBefore(navClose, nav.firstChild);
    navClose.addEventListener('click', () => { closeMenu(); if (menuBtn) menuBtn.focus(); });
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const o = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', o ? 'true' : 'false');
      doc.body.classList.toggle('nav-open', o);
    });
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1000 && nav && nav.classList.contains('open')) {
      closeMenu();
    }
  });

  $$('.sub-btn').forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const s = doc.getElementById(b.getAttribute('aria-controls'));
      const open = b.getAttribute('aria-expanded') !== 'true';
      closeSubs(b);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (s) s.classList.toggle('open', open);
    });
  });

  doc.addEventListener('click', (e) => {
    if (!e.target.closest('.has-sub')) closeSubs();
    if (e.target.closest('#nav a')) closeMenu();
  });

  doc.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openBtn = $('.sub-btn[aria-expanded="true"]');
    if (openBtn) { closeSubs(); openBtn.focus(); }
    else if (nav && nav.classList.contains('open')) { closeMenu(); if (menuBtn) menuBtn.focus(); }
  });

  const skip = $('a.skip');
  if (skip) skip.addEventListener('click', (e) => {
    e.preventDefault();
    const m = doc.getElementById('main');
    if (m) { m.setAttribute('tabindex', '-1'); m.focus(); }
  });
})();
