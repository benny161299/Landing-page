/* forms.js — טפסי ליד (form.lead): ולידציה, שליחת AJAX ל-/api/lead,
   ניתוב מחדש לעמוד תודה, ו-fallback לוואטסאפ. נטען רק בעמודים עם טופס. */
(function () {
  'use strict';
  const { doc, $, $$, el, svgEl, WA } = window.RL;

  function setErr(field, input, msg) {
    const err = $('.err', field);
    if (err) err.textContent = msg || '';
    field.classList.toggle('bad', Boolean(msg));
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  // שמירת תוכן הכפתור המקורי כשכפול צמתים (במקום שמירת innerHTML)
  function saveBtnContent(btn) {
    if (!btn._origContent) {
      btn._origContent = Array.from(btn.childNodes).map((n) => n.cloneNode(true));
    }
  }
  function restoreBtnContent(btn, fallbackText) {
    if (btn._origContent) {
      btn.replaceChildren(...btn._origContent.map((n) => n.cloneNode(true)));
    } else {
      btn.textContent = fallbackText;
    }
  }

  function resetFormState(form, clearInputs) {
    if (clearInputs) {
      form.reset();
    }
    form.classList.remove('is-submitting');
    const btn = $('button[type="submit"]', form);
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('is-loading');
      if (btn._origContent) {
        restoreBtnContent(btn);
      }
    }
    const status = $('.status', form);
    if (status) {
      status.textContent = '';
      status.className = 'status';
    }
    $$('.field', form).forEach((f) => {
      f.classList.remove('bad');
      const err = $('.err', f);
      if (err) err.textContent = '';
      const inp = $('input, select, textarea', f);
      if (inp) inp.setAttribute('aria-invalid', 'false');
    });
    const consent = $('.consent', form);
    if (consent) consent.classList.remove('bad');
    const cerr = $('.cerr', form);
    if (cerr) cerr.textContent = '';
  }

  function buildSpinner() {
    return [
      svgEl('svg', { class: 'btn-spinner', viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' }, [
        svgEl('circle', { cx: '12', cy: '12', r: '9', 'stroke-width': '2.8' }),
        svgEl('path', { d: 'M12 3a9 9 0 0 1 9 9', 'stroke-width': '2.8', 'stroke-linecap': 'round' })
      ]),
      el('span', { text: 'הפנייה נשלחת...' })
    ];
  }

  const WA_ICON_PATH = 'M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.64C9.36 7.64 9.09 7.7 8.87 7.95C8.65 8.19 8.04 8.76 8.04 9.94C8.04 11.11 8.9 12.24 9.01 12.4C9.13 12.56 10.66 14.91 13 15.93C13.56 16.17 14 16.33 14.34 16.44C14.9 16.62 15.41 16.59 15.82 16.53C16.27 16.46 17.21 15.96 17.41 15.41C17.61 14.85 17.61 14.38 17.55 14.28C17.49 14.18 17.33 14.12 17.08 14C16.83 13.88 15.61 13.28 15.38 13.2C15.16 13.11 15 13.07 14.83 13.32C14.66 13.57 14.18 14.12 14.04 14.29C13.89 14.46 13.75 14.48 13.5 14.36C13.25 14.23 12.46 13.97 11.53 13.14C10.8 12.49 10.31 11.68 10.17 11.43C10.03 11.18 10.15 11.05 10.28 10.92C10.39 10.81 10.53 10.63 10.66 10.48C10.79 10.33 10.83 10.22 10.91 10.06C11 9.89 10.95 9.75 10.89 9.63C10.83 9.5 10.34 8.3 10.14 7.81C9.94 7.32 9.74 7.39 9.58 7.38L9.53 7.64Z';

  // בניית הודעת מצב-ביניים + כפתור הוואטסאפ במנגנון DOM בטוח (ה-URL מכיל קלט משתמש מקודד).
  // לא מכריזים על כשל: אחרי timeout ייתכן שהשרת עדיין מעבד את הפנייה או כבר קלט אותה,
  // ואין הבטחה לחזרה אל הלקוח אם הרישום לא הצליח - לכן מוצעת גם חלופת הוואטסאפ.
  function buildWaFallback(waUrl) {
    const link = el('a', {
      class: 'btn btn-brass btn-wa-fallback',
      href: waUrl,
      target: '_blank',
      rel: 'noopener',
      'aria-label': 'שליחת הפרטים בוואטסאפ (נפתח בחלון חדש)'
    }, [
      svgEl('svg', { class: 'wa-btn-icon', viewBox: '0 0 24 24', width: '20', height: '20', fill: 'currentColor', 'aria-hidden': 'true' }, [
        svgEl('path', { d: WA_ICON_PATH })
      ]),
      el('span', { text: 'שליחה בוואטסאפ' })
    ]);
    return [
      el('span', { class: 'status-err-text', text: 'השליחה מתעכבת.' }),
      doc.createTextNode(' ייתכן שהפנייה התקבלה, ובמקרה כזה נחזור אלייך. אם לא, ניתן לנסות שוב בעוד מספר דקות או לשלוח את הפרטים בוואטסאפ: '),
      link
    ];
  }

  // מזהה ייחודי לכל ניסיון הגשה - מאפשר לשרת למנוע רישום/שליחה כפולים של אותה הגשה.
  // נשמר על פני ניסיונות חוזרים אחרי כשל, ומתחדש אחרי הצלחה (הגשה חדשה = מזהה חדש).
  const newRequestId_ = () => (crypto.randomUUID ? crypto.randomUUID() : 'rid-' + Date.now() + '-' + Math.random().toString(36).slice(2));

  $$('form.lead').forEach((form) => {
    const status = $('.status', form);
    const btn = $('button[type="submit"]', form);
    if (btn) saveBtnContent(btn);
    let requestId = newRequestId_();

    form.addEventListener('submit', (e) => {
      const el_ = form.elements;
      const name = el_.fullname.value.trim();
      const phone = el_.phone.value.trim();
      const digits = phone.replace(/[\s\-().]/g, '');
      let first = null;
      const badName = !name, badPhone = !/^(\+?972|0)\d{8,9}$/.test(digits), badOk = !el_.consent.checked;
      setErr(el_.fullname.closest('.field'), el_.fullname, badName ? 'נא למלא שם מלא.' : '');
      setErr(el_.phone.closest('.field'), el_.phone, badPhone ? 'נא להזין מספר טלפון תקין, למשל 050-1234567.' : '');
      const cWrap = el_.consent.closest('.consent');
      cWrap.classList.toggle('bad', badOk);
      el_.consent.setAttribute('aria-invalid', badOk ? 'true' : 'false');
      $('.cerr', form).textContent = badOk ? 'כדי להמשיך יש לאשר יצירת קשר.' : '';
      if (badName) first = el_.fullname; else if (badPhone) first = el_.phone; else if (badOk) first = el_.consent;
      status.className = 'status';
      if (first) {
        e.preventDefault();
        status.textContent = 'יש לתקן את השדות המסומנים.';
        status.classList.add('err');
        first.focus();
        return;
      }
      // הגדרת יעד עמוד תודה מדויק
      if (form.elements._next) {
        form.elements._next.value = window.location.origin + '/thank-you/';
      }

      // שליחה חלקה ברקע (AJAX) ללא מעבר לאתר חיצוני
      e.preventDefault();
      form.classList.add('is-submitting');
      if (btn) {
        saveBtnContent(btn);
        btn.disabled = true;
        btn.classList.add('is-loading');
        btn.replaceChildren(...buildSpinner());
      }
      status.textContent = 'הפנייה נשלחת, רק רגע...';
      status.className = 'status is-loading';

      // שליחה לנקודת הקצה שלנו (/api/lead - פרוקסי ב-Vercel ל-Google Apps Script).
      // הטוקן מתווסף בצד שרת בלבד; כאן נשלחים רק שדות הטופס.
      const topicEl2 = form.elements.topic || form.elements.subject || null;
      const topicValue = (topicEl2 && topicEl2.value) ? topicEl2.value : '';
      // שחזור request_id של הגשה זהה שנתקעה (למשל רענון דף באמצע שליחה). המפתח נקבע
      // לפי תוכן השדות: שינוי תוכן מקבל מזהה חדש, כי השרת מזהה כפילות לפי המזהה בלבד.
      let pending = null;
      try {
        pending = JSON.parse(sessionStorage.getItem('lead_pending') || 'null');
      } catch (storageErr2) {}
      if (pending && pending.rid && pending.name === name && pending.phone === phone && pending.topic === topicValue) {
        requestId = pending.rid;
      } else {
        requestId = newRequestId_();
      }
      try {
        sessionStorage.setItem('lead_pending', JSON.stringify({ rid: requestId, name: name, phone: phone, topic: topicValue }));
      } catch (storageErr3) {}
      const payload = JSON.stringify({
        fullname: name,
        phone: phone,
        request_id: requestId,
        topic: topicValue,
        _honey: (form.elements._honey && form.elements._honey.value) || ''
      });

      // תור שידור סובלני: מספר ניסיונות עם אותו request_id (השרת אידמפוטנטי -
      // ניסיון חוזר אחרי שהשרת סיים מחזיר הצלחה בלי רישום/מייל כפולים).
      // תקלה חולפת (timeout / רשת / שרת עסוק) אינה "כשל" אלא "עדיין מעבדים".
      // מסגרת הסבלנות אינה ערובה לעיכובים ארוכים במיוחד; במקרה כזה יוצג מצב ביניים כן.
      const MAX_ATTEMPTS = 8;
      const ATTEMPT_TIMEOUT_MS = 35000;
      const RETRY_DELAY_MS = 8000;

      const postLead = () => {
        const controller = new AbortController();
        const timer = setTimeout(() => { controller.abort(); }, ATTEMPT_TIMEOUT_MS);
        return fetch('/api/lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: payload,
          signal: controller.signal
        }).then((res) => {
          clearTimeout(timer);
          // הצלחה רק בתשובת JSON תקינה; תשובה שאינה JSON (למשל דף HTML) נחשבת כשל זמני
          return res.json().catch(() => null).then((data) => ({ httpStatus: res.status, data: data }));
        }, () => {
          clearTimeout(timer);
          return { httpStatus: 0, data: null }; // timeout/רשת - ניתן לנסות שוב
        });
      };

      const onSuccess = () => {
        requestId = newRequestId_();
        try {
          sessionStorage.removeItem('lead_pending');
          sessionStorage.setItem('form_submitted', '1');
        } catch (storageErr) {}
        // איפוס הטופס ושיחזור הכפתור לקראת חזרה אפשרית
        resetFormState(form, true);
        window.location.href = '/thank-you/';
      };

      const onGiveUp = () => {
        form.classList.remove('is-submitting');
        if (btn) {
          btn.disabled = false;
          btn.classList.remove('is-loading');
          restoreBtnContent(btn, 'השאירו פרטים');
        }

        // בניית קישור wa.me עם הנתונים שהוזנו - fallback אוטומטי
        const nameVal = (form.elements.fullname && form.elements.fullname.value.trim()) || '';
        const phoneVal = (form.elements.phone && form.elements.phone.value.trim()) || '';
        const topicEl = form.elements.topic || form.elements.subject || null;
        const topicVal = (topicEl && topicEl.value) ? topicEl.value.trim() : '';
        const waMsg = 'שלום רחל,' +
          (nameVal ? '\nשם: ' + nameVal : '') +
          (phoneVal ? '\nטלפון: ' + phoneVal : '') +
          (topicVal ? '\nנושא: ' + topicVal : '') +
          '\nאשמח שתחזרי אליי.';
        const waUrl = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(waMsg);
        status.replaceChildren(...buildWaFallback(waUrl));
        status.className = 'status err has-wa-fallback';
      };

      let attempt = 0;
      const trySend = () => {
        attempt += 1;
        postLead().then(({ httpStatus, data }) => {
          if (data && data.ok === true) {
            onSuccess();
            return;
          }
          // שגיאת קלט/הרשאה קבועה - אין טעם בניסיון חוזר עם אותם נתונים
          const fatal = httpStatus === 400 || httpStatus === 401 || httpStatus === 403 || httpStatus === 405;
          if (!fatal && attempt < MAX_ATTEMPTS) {
            status.textContent = 'השליחה נמשכת קצת יותר מהרגיל, עוד רגע...';
            status.className = 'status is-loading';
            setTimeout(trySend, RETRY_DELAY_MS);
            return;
          }
          onGiveUp();
        });
      };
      trySend();
    });
  });

  // איפוס אוטומטי של הטופס בחזרה אחורה בדפדפן (Back button / bfcache)
  window.addEventListener('pageshow', (e) => {
    let wasSubmitted = false;
    try {
      if (sessionStorage.getItem('form_submitted') === '1') {
        wasSubmitted = true;
        sessionStorage.removeItem('form_submitted');
      }
    } catch (err) {}

    $$('form.lead').forEach((form) => {
      if (wasSubmitted || e.persisted || form.classList.contains('is-submitting')) {
        resetFormState(form, true);
      } else {
        const btn = $('button[type="submit"]', form);
        if (btn && (btn.disabled || btn.classList.contains('is-loading'))) {
          resetFormState(form, false);
        }
      }
    });
  });
})();
