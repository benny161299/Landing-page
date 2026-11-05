/* widgets.js — ווידג'ט יצירת קשר מהירה במובייל, מנגנון "גרור להסרה" לכפתורים צפים
   (טלפון + נגישות), וכלי שחזור. נטען בכל עמוד. */
(function () {
  'use strict';
  const { doc, el, svgEl } = window.RL;

  const PHONE_ICON_PATH = 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z';
  const CHAT_ICON_PATHS = [
    'M60.44,389.17c0,.07,0,.2-.08.38C60.39,389.43,60.41,389.3,60.44,389.17Z',
    'M439.9,405.6a26.77,26.77,0,0,1-9.59-2l-56.78-20.13-.42-.17a9.88,9.88,0,0,0-3.91-.76,10.32,10.32,0,0,0-3.62.66c-1.38.52-13.81,5.19-26.85,8.77-7.07,1.94-31.68,8.27-51.43,8.27-50.48,0-97.68-19.4-132.89-54.63A183.38,183.38,0,0,1,100.3,215.1a175.9,175.9,0,0,1,4.06-37.58c8.79-40.62,32.07-77.57,65.55-104A194.76,194.76,0,0,1,290.3,32c52.21,0,100.86,20,137,56.18,34.16,34.27,52.88,79.33,52.73,126.87a177.86,177.86,0,0,1-30.3,99.15l-.19.28-.74,1c-.17.23-.34.45-.5.68l-.15.27a21.63,21.63,0,0,0-1.08,2.09l15.74,55.94a26.42,26.42,0,0,1,1.12,7.11A24,24,0,0,1,439.9,405.6Z',
    'M299.87,425.39a15.74,15.74,0,0,0-10.29-8.1c-5.78-1.53-12.52-1.27-17.67-1.65a201.78,201.78,0,0,1-128.82-58.75A199.21,199.21,0,0,1,86.4,244.16C85,234.42,85,232,85,232a16,16,0,0,0-28-10.58h0S49.12,230,45.4,238.61a162.09,162.09,0,0,0,11,150.06C59,393,59,395,58.42,399.5c-2.73,14.11-7.51,39-10,51.91a24,24,0,0,0,8,22.92l.46.39A24.34,24.34,0,0,0,72,480a23.42,23.42,0,0,0,9-1.79l53.51-20.65a8.05,8.05,0,0,1,5.72,0c21.07,7.84,43,12,63.78,12a176,176,0,0,0,74.91-16.66c5.46-2.56,14-5.34,19-11.12A15,15,0,0,0,299.87,425.39Z',
  ];
  const WA_ICON_PATH = 'M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.64C9.36 7.64 9.09 7.7 8.87 7.95C8.65 8.19 8.04 8.76 8.04 9.94C8.04 11.11 8.9 12.24 9.01 12.4C9.13 12.56 10.66 14.91 13 15.93C13.56 16.17 14 16.33 14.34 16.44C14.9 16.62 15.41 16.59 15.82 16.53C16.27 16.46 17.21 15.96 17.41 15.41C17.61 14.85 17.61 14.38 17.55 14.28C17.49 14.18 17.33 14.12 17.08 14C16.83 13.88 15.61 13.28 15.38 13.2C15.16 13.11 15 13.07 14.83 13.32C14.66 13.57 14.18 14.12 14.04 14.29C13.89 14.46 13.75 14.48 13.5 14.36C13.25 14.23 12.46 13.97 11.53 13.14C10.8 12.49 10.31 11.68 10.17 11.43C10.03 11.18 10.15 11.05 10.28 10.92C10.39 10.81 10.53 10.63 10.66 10.48C10.79 10.33 10.83 10.22 10.91 10.06C11 9.89 10.95 9.75 10.89 9.63C10.83 9.5 10.34 8.3 10.14 7.81C9.94 7.32 9.74 7.39 9.58 7.38L9.53 7.64Z';

  function phoneIcon(cls, size) {
    return svgEl('svg', { class: cls, viewBox: '0 0 24 24', width: String(size), height: String(size), fill: 'currentColor', 'aria-hidden': 'true' }, [
      svgEl('path', { d: PHONE_ICON_PATH })
    ]);
  }
  function chatIcon(cls, size) {
    return svgEl('svg', { class: cls, viewBox: '0 0 512 512', width: String(size), height: String(size), fill: 'currentColor', 'aria-hidden': 'true' },
      CHAT_ICON_PATHS.map((d) => svgEl('path', { d }))
    );
  }
  function closeIcon(cls, size, strokeWidth, ariaHidden) {
    return svgEl('svg', {
      class: cls, viewBox: '0 0 24 24', width: String(size), height: String(size), fill: 'none',
      stroke: 'currentColor', 'stroke-width': strokeWidth, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
      'aria-hidden': ariaHidden === false ? null : 'true'
    }, [
      svgEl('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
      svgEl('line', { x1: '6', y1: '6', x2: '18', y2: '18' })
    ]);
  }
  function waIcon(size) {
    return svgEl('svg', { viewBox: '0 0 24 24', width: String(size), height: String(size), fill: 'currentColor', 'aria-hidden': 'true' }, [
      svgEl('path', { d: WA_ICON_PATH })
    ]);
  }
  function formIcon() {
    return svgEl('svg', {
      viewBox: '0 0 24 24', width: '22', height: '22', fill: 'none',
      stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true'
    }, [
      svgEl('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
      svgEl('polyline', { points: '14 2 14 8 20 8' }),
      svgEl('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
      svgEl('line', { x1: '16', y1: '17', x2: '8', y2: '17' })
    ]);
  }

  /* ---------- Mobile Sticky Quick Contact Widget ---------- */
  function initMobileQuickContact() {
    let existing = doc.getElementById('quick-contact-widget');
    if (!existing) {
      // הווידג'ט נבנה במנגנון DOM בטוח (חלופה ל-innerHTML)
      const aside = el('aside', { id: 'quick-contact-widget', class: 'quick-contact-widget', 'aria-label': 'יצירת קשר מהירה' }, [
        el('div', { class: 'qc-backdrop', 'aria-hidden': 'true' }),
        el('button', {
          type: 'button', class: 'qc-trigger', id: 'qc-trigger',
          'aria-expanded': 'false', 'aria-controls': 'qc-menu', 'aria-label': 'פתח אפשרויות ליצירת קשר'
        }, [
          chatIcon('qc-trigger-icon qc-icon-chat', 19),
          closeIcon('qc-trigger-icon qc-icon-close', 19, '2.5')
        ]),
        el('nav', { class: 'qc-menu', id: 'qc-menu', 'aria-label': 'אפשרויות יצירת קשר מהירה' }, [
          el('a', {
            class: 'qc-btn qc-btn-wa',
            href: 'https://wa.me/972559535605?text=%D7%A9%D7%9C%D7%95%D7%9D%20%D7%A8%D7%97%D7%9C%2C%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%9E%D7%94%D7%90%D7%AA%D7%A8%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%99%D7%97%D7%94.',
            target: '_blank', rel: 'noopener'
          }, [
            el('span', { class: 'qc-btn-text', text: 'הודעת וואטסאפ' }),
            el('span', { class: 'qc-btn-icon' }, [waIcon(22)])
          ]),
          el('a', { class: 'qc-btn qc-btn-call', href: 'tel:+972559535605' }, [
            el('span', { class: 'qc-btn-text', text: 'חייג עכשיו' }),
            el('span', { class: 'qc-btn-icon' }, [phoneIcon('', 22)])
          ]),
          el('button', { type: 'button', class: 'qc-btn qc-btn-form', id: 'qc-btn-scroll-form' }, [
            el('span', { class: 'qc-btn-text', text: 'השאר פרטים' }),
            el('span', { class: 'qc-btn-icon' }, [formIcon()])
          ])
        ])
      ]);
      doc.body.appendChild(aside);
      existing = aside;
    }

    const trigger = doc.getElementById('qc-trigger');
    const backdrop = existing.querySelector('.qc-backdrop');
    const formBtn = doc.getElementById('qc-btn-scroll-form');

    function toggleMenu(forceOpen) {
      const isOpen = typeof forceOpen === 'boolean' ? forceOpen : !existing.classList.contains('is-open');
      existing.classList.toggle('is-open', isOpen);
      if (backdrop) backdrop.classList.toggle('is-open', isOpen);
      if (trigger) {
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        trigger.setAttribute('aria-label', isOpen ? 'סגור אפשרויות ליצירת קשר' : 'פתח אפשרויות ליצירת קשר');
      }
    }

    if (trigger) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => {
        toggleMenu(false);
      });
    }

    if (formBtn) {
      formBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMenu(false);
        const form = doc.getElementById('contact') || doc.querySelector('form.card.lead') || doc.querySelector('form.lead');
        if (form) {
          form.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => {
            const firstInput = form.querySelector('input:not([type="hidden"]), select, textarea');
            if (firstInput) {
              try { firstInput.focus({ preventScroll: true }); } catch (err) { firstInput.focus(); }
            }
          }, 400);
        } else {
          window.location.href = '/#contact';
        }
      });
    }

    doc.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && existing.classList.contains('is-open')) {
        toggleMenu(false);
        if (trigger) trigger.focus();
      }
    });

    // Bind Drag & Drop Dismiss to Phone Button
    if (trigger) {
      makeDraggableAndDismissible({
        triggerElement: trigger,
        containerToDismiss: existing,
        storageKey: 'qc_phone_widget_dismissed',
        removedText: 'כפתור הטלפון הוסר מהמסך',
        onDragStart() {
          toggleMenu(false);
        },
        onBeforeDismiss() {
          toggleMenu(false);
        }
      });
    }

    // Also bind Sienna Accessibility Button
    bindSiennaAccessibilityDragDismiss();
  }

  /* ==========================================================================
     Drag to Dismiss ("X" Target) for Floating Buttons (Phone & Accessibility)
     ========================================================================== */
  let floatingDismissTargetEl = null;
  let floatingUndoToastEl = null;
  let undoToastTimer = null;

  function getOrCreateDismissTarget() {
    if (!floatingDismissTargetEl) {
      floatingDismissTargetEl = doc.getElementById('floating-dismiss-target');
      if (!floatingDismissTargetEl) {
        const node = el('div', { id: 'floating-dismiss-target', class: 'floating-dismiss-target', 'aria-hidden': 'true' }, [
          el('div', { class: 'fdt-circle' }, [closeIcon('', 26, '2.6', false)]),
          el('span', { class: 'fdt-label', text: 'גרור לכאן להסרה' })
        ]);
        doc.body.appendChild(node);
        floatingDismissTargetEl = node;
      }
    }
    return floatingDismissTargetEl;
  }

  function showUndoToast(message, onUndo) {
    if (!floatingUndoToastEl) {
      floatingUndoToastEl = doc.getElementById('floating-undo-toast');
      if (!floatingUndoToastEl) {
        const node = el('div', { id: 'floating-undo-toast', class: 'floating-undo-toast', role: 'status', 'aria-live': 'polite' }, [
          el('span', { class: 'fut-text' }),
          el('button', { type: 'button', class: 'fut-undo-btn', text: 'בטל' }),
          el('button', { type: 'button', class: 'fut-close-btn', 'aria-label': 'סגור הודעה', text: '×' })
        ]);
        doc.body.appendChild(node);
        floatingUndoToastEl = node;

        floatingUndoToastEl.querySelector('.fut-close-btn').addEventListener('click', () => {
          floatingUndoToastEl.classList.remove('is-visible');
        });
      }
    }

    floatingUndoToastEl.querySelector('.fut-text').textContent = message;
    const undoBtn = floatingUndoToastEl.querySelector('.fut-undo-btn');
    const newUndoBtn = undoBtn.cloneNode(true);
    undoBtn.parentNode.replaceChild(newUndoBtn, undoBtn);

    newUndoBtn.addEventListener('click', () => {
      floatingUndoToastEl.classList.remove('is-visible');
      if (typeof onUndo === 'function') onUndo();
    });

    floatingUndoToastEl.classList.add('is-visible');

    if (undoToastTimer) clearTimeout(undoToastTimer);
    undoToastTimer = setTimeout(() => {
      if (floatingUndoToastEl) floatingUndoToastEl.classList.remove('is-visible');
    }, 5500);
  }

  function makeDraggableAndDismissible(options) {
    const triggerEl = options.triggerElement;
    const container = options.containerToDismiss || triggerEl;
    const storageKey = options.storageKey;
    const removedText = options.removedText || 'הכפתור הוסר מהמסך';
    const onDragStart = options.onDragStart;
    const onBeforeDismiss = options.onBeforeDismiss;
    const onRestore = options.onRestore;

    if (!triggerEl || triggerEl.__dragDismissBound) return;
    triggerEl.__dragDismissBound = true;

    // If already marked dismissed in storage, ensure container is hidden
    if (storageKey) {
      try {
        if (localStorage.getItem(storageKey) === 'true') {
          container.style.setProperty('display', 'none', 'important');
          return;
        }
      } catch (_) {}
    }

    const dismissTarget = getOrCreateDismissTarget();
    const circle = dismissTarget.querySelector('.fdt-circle');
    const label = dismissTarget.querySelector('.fdt-label');

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentDx = 0;
    let currentDy = 0;
    let initialRect = null;
    let longPressTimer = null;
    let suppressClick = false;
    let isOverTarget = false;

    const LONG_PRESS_MS = 240;
    const MOVE_THRESHOLD = 6;

    function startDragMode(clientX, clientY) {
      if (isDragging) return;
      isDragging = true;
      initialRect = triggerEl.getBoundingClientRect();

      if (typeof onDragStart === 'function') {
        try { onDragStart(); } catch (_) {}
      }

      dismissTarget.classList.add('is-visible');
      dismissTarget.classList.remove('is-hovered');
      if (label) label.textContent = 'גרור לכאן להסרה';

      triggerEl.classList.add('is-being-dragged');
      if (navigator.vibrate) {
        try { navigator.vibrate(35); } catch (_) {}
      }
    }

    function checkProximity() {
      if (!circle || !initialRect) return false;
      const targetRect = circle.getBoundingClientRect();
      const tcX = targetRect.left + targetRect.width / 2;
      const tcY = targetRect.top + targetRect.height / 2;

      const elCenterX = initialRect.left + initialRect.width / 2 + currentDx;
      const elCenterY = initialRect.top + initialRect.height / 2 + currentDy;

      const dist = Math.hypot(elCenterX - tcX, elCenterY - tcY);
      const snapRadius = (targetRect.width / 2) + (Math.max(initialRect.width, initialRect.height) / 2) + 24;

      return dist <= snapRadius;
    }

    function onPointerDown(e) {
      if (e.type === 'mousedown' && e.button !== 0) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      startX = clientX;
      startY = clientY;
      currentDx = 0;
      currentDy = 0;
      isOverTarget = false;
      isDragging = false;
      initialRect = triggerEl.getBoundingClientRect();

      if (longPressTimer) clearTimeout(longPressTimer);
      longPressTimer = setTimeout(() => {
        startDragMode(startX, startY);
      }, LONG_PRESS_MS);

      window.addEventListener('mousemove', onPointerMove, { passive: false });
      window.addEventListener('mouseup', onPointerUp, { passive: false });
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp, { passive: false });
      window.addEventListener('touchcancel', onPointerUp, { passive: false });
    }

    function onPointerMove(e) {
      if (e.touches && e.touches.length > 1) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const dx = clientX - startX;
      const dy = clientY - startY;

      if (!isDragging) {
        if (Math.hypot(dx, dy) > MOVE_THRESHOLD) {
          if (longPressTimer) clearTimeout(longPressTimer);
          startDragMode(clientX, clientY);
        }
      }

      if (isDragging) {
        if (e.cancelable) e.preventDefault();
        currentDx = dx;
        currentDy = dy;

        const over = checkProximity();
        if (over !== isOverTarget) {
          isOverTarget = over;
          if (isOverTarget) {
            dismissTarget.classList.add('is-hovered');
            triggerEl.classList.add('is-over-target');
            if (label) label.textContent = 'שחרר כדי להסיר';
            if (navigator.vibrate) {
              try { navigator.vibrate(25); } catch (_) {}
            }
          } else {
            dismissTarget.classList.remove('is-hovered');
            triggerEl.classList.remove('is-over-target');
            if (label) label.textContent = 'גרור לכאן להסרה';
          }
        }

        const scale = isOverTarget ? 0.85 : 1.1;
        triggerEl.style.setProperty('transform', 'translate3d(' + currentDx + 'px, ' + currentDy + 'px, 0) scale(' + scale + ')', 'important');
        triggerEl.style.setProperty('transition', 'none', 'important');
      }
    }

    function onPointerUp(e) {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('touchcancel', onPointerUp);

      if (!isDragging) return;

      suppressClick = true;
      setTimeout(() => {
        suppressClick = false;
      }, 400);

      if (isOverTarget) {
        // DISMISS ACTION
        if (typeof onBeforeDismiss === 'function') {
          try { onBeforeDismiss(); } catch (_) {}
        }

        const targetRect = circle.getBoundingClientRect();
        const tcX = targetRect.left + targetRect.width / 2;
        const tcY = targetRect.top + targetRect.height / 2;
        const finalDx = tcX - (initialRect.left + initialRect.width / 2);
        const finalDy = tcY - (initialRect.top + initialRect.height / 2);

        triggerEl.style.setProperty('transition', 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease-in', 'important');
        triggerEl.style.setProperty('transform', 'translate3d(' + finalDx + 'px, ' + finalDy + 'px, 0) scale(0.1)', 'important');
        triggerEl.style.setProperty('opacity', '0', 'important');

        dismissTarget.classList.remove('is-hovered');
        if (navigator.vibrate) {
          try { navigator.vibrate([30, 45, 30]); } catch (_) {}
        }

        setTimeout(() => {
          container.style.setProperty('display', 'none', 'important');
          triggerEl.style.removeProperty('transform');
          triggerEl.style.removeProperty('opacity');
          triggerEl.style.removeProperty('transition');
          triggerEl.classList.remove('is-being-dragged', 'is-over-target');
          dismissTarget.classList.remove('is-visible', 'is-hovered');

          if (storageKey) {
            try {
              localStorage.setItem(storageKey, 'true');
              if (storageKey === 'qc_phone_widget_dismissed') {
                doc.documentElement.setAttribute('data-qc-dismissed', 'true');
              } else if (storageKey === 'asw_accessibility_widget_dismissed') {
                doc.documentElement.setAttribute('data-asw-dismissed', 'true');
              }
            } catch (_) {}
          }

          showUndoToast(removedText, () => {
            if (storageKey) {
              try {
                localStorage.removeItem(storageKey);
                if (storageKey === 'qc_phone_widget_dismissed') {
                  doc.documentElement.removeAttribute('data-qc-dismissed');
                } else if (storageKey === 'asw_accessibility_widget_dismissed') {
                  doc.documentElement.removeAttribute('data-asw-dismissed');
                }
              } catch (_) {}
            }
            container.style.removeProperty('display');
            triggerEl.style.animation = 'qc-pop-in 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
            setTimeout(() => {
              triggerEl.style.animation = '';
            }, 450);
            if (typeof onRestore === 'function') onRestore();
          });
        }, 220);

      } else {
        // CANCEL: Spring back
        dismissTarget.classList.remove('is-visible', 'is-hovered');
        triggerEl.classList.remove('is-over-target');
        triggerEl.style.setProperty('transition', 'transform 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28)', 'important');
        triggerEl.style.setProperty('transform', 'translate3d(0, 0, 0) scale(1)', 'important');

        setTimeout(() => {
          triggerEl.style.removeProperty('transform');
          triggerEl.style.removeProperty('transition');
          triggerEl.classList.remove('is-being-dragged');
        }, 360);
      }

      isDragging = false;
      isOverTarget = false;
    }

    triggerEl.addEventListener('mousedown', onPointerDown);
    triggerEl.addEventListener('touchstart', onPointerDown, { passive: true });

    triggerEl.addEventListener('click', (e) => {
      if (suppressClick) {
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
    }, true);
  }

  /* ---------- Bind Sienna Accessibility Button ---------- */
  function bindSiennaAccessibilityDragDismiss() {
    const STORAGE_KEY = 'asw_accessibility_widget_dismissed';

    function tryBind() {
      const aswBtn = doc.querySelector('.asw-menu-btn') || doc.querySelector('#asw-menu-btn') || doc.querySelector('.asw-widget button');
      if (!aswBtn) return false;

      const aswContainer = aswBtn.closest('.asw-widget') || aswBtn;

      try {
        if (localStorage.getItem(STORAGE_KEY) === 'true') {
          aswContainer.style.setProperty('display', 'none', 'important');
          doc.documentElement.setAttribute('data-asw-dismissed', 'true');
        }
      } catch (_) {}

      makeDraggableAndDismissible({
        triggerElement: aswBtn,
        containerToDismiss: aswContainer,
        storageKey: STORAGE_KEY,
        removedText: 'כפתור הנגישות הוסר מהמסך',
        onBeforeDismiss() {
          const closeBtn = doc.querySelector('.asw-menu-close') || doc.querySelector('.asw-menu .close');
          if (closeBtn) closeBtn.click();
        }
      });
      return true;
    }

    if (!tryBind()) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (tryBind() || attempts > 25) {
          clearInterval(interval);
        }
      }, 250);

      if (window.MutationObserver) {
        const observer = new MutationObserver(() => {
          if (tryBind()) {
            observer.disconnect();
          }
        });
        observer.observe(doc.body || doc.documentElement, { childList: true, subtree: true });
      }
    }
  }

  // Global reset helper for testing or recovery
  window.resetFloatingWidgets = function () {
    try {
      localStorage.removeItem('qc_phone_widget_dismissed');
      localStorage.removeItem('asw_accessibility_widget_dismissed');
      doc.documentElement.removeAttribute('data-asw-dismissed');
      doc.documentElement.removeAttribute('data-qc-dismissed');
      const qc = doc.getElementById('quick-contact-widget');
      if (qc) qc.style.removeProperty('display');
      const asw = doc.querySelector('.asw-widget') || doc.querySelector('.asw-menu-btn');
      if (asw) asw.style.removeProperty('display');
      return 'Floating widgets restored successfully.';
    } catch (e) {
      return e.message;
    }
  };

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', initMobileQuickContact);
  } else {
    initMobileQuickContact();
  }
})();
