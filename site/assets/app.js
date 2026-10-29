(function () {
  'use strict';
  var doc = document;
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
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nf = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 0 });
  var nf1 = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 });
  function fmtN(n) { return nf1.format(n); }
  function ils(n) { return nf.format(Math.round(n)) + ' ₪'; }
  var WA = '972559535605';

  /* ---------- Navigation ---------- */
  var menuBtn = $('.menu-btn'), nav = $('#nav');
  function closeSubs(except) {
    $$('.sub-btn').forEach(function (b) {
      if (b === except) return;
      b.setAttribute('aria-expanded', 'false');
      var s = doc.getElementById(b.getAttribute('aria-controls'));
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
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var o = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', o ? 'true' : 'false');
      doc.body.classList.toggle('nav-open', o);
    });
  }
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1000 && nav && nav.classList.contains('open')) {
      closeMenu();
    }
  });
  $$('.sub-btn').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var s = doc.getElementById(b.getAttribute('aria-controls'));
      var open = b.getAttribute('aria-expanded') !== 'true';
      closeSubs(b);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (s) s.classList.toggle('open', open);
    });
  });
  doc.addEventListener('click', function (e) {
    if (!e.target.closest('.has-sub')) closeSubs();
    if (e.target.closest('#nav a')) closeMenu();
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var openBtn = $('.sub-btn[aria-expanded="true"]');
    if (openBtn) { closeSubs(); openBtn.focus(); }
    else if (nav && nav.classList.contains('open')) { closeMenu(); if (menuBtn) menuBtn.focus(); }
  });
  var skip = $('a.skip');
  if (skip) skip.addEventListener('click', function (e) {
    e.preventDefault();
    var m = doc.getElementById('main');
    if (m) { m.setAttribute('tabindex', '-1'); m.focus(); }
  });

  /* ---------- Lead forms ---------- */
  function setErr(field, input, msg) {
    var err = $('.err', field);
    if (err) err.textContent = msg || '';
    field.classList.toggle('bad', !!msg);
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function resetFormState(form, clearInputs) {
    if (clearInputs) {
      form.reset();
    }
    form.classList.remove('is-submitting');
    var btn = $('button[type="submit"]', form);
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('is-loading');
      if (btn.dataset.origHtml) {
        btn.innerHTML = btn.dataset.origHtml;
      }
    }
    var status = $('.status', form);
    if (status) {
      status.textContent = '';
      status.className = 'status';
    }
    $$('.field', form).forEach(function (f) {
      f.classList.remove('bad');
      var err = $('.err', f);
      if (err) err.textContent = '';
      var inp = $('input, select, textarea', f);
      if (inp) inp.setAttribute('aria-invalid', 'false');
    });
    var consent = $('.consent', form);
    if (consent) consent.classList.remove('bad');
    var cerr = $('.cerr', form);
    if (cerr) cerr.textContent = '';
  }

  var SPINNER_SVG = '<svg class="btn-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="9" stroke-width="2.8"/>' +
    '<path d="M12 3a9 9 0 0 1 9 9" stroke-width="2.8" stroke-linecap="round"/>' +
    '</svg>';

  $$('form.lead').forEach(function (form) {
    var status = $('.status', form);
    var btn = $('button[type="submit"]', form);
    if (btn && !btn.dataset.origHtml) {
      btn.dataset.origHtml = btn.innerHTML;
    }

    form.addEventListener('submit', function (e) {
      var el = form.elements;
      var name = el.fullname.value.trim();
      var phone = el.phone.value.trim();
      var digits = phone.replace(/[\s\-().]/g, '');
      var first = null;
      var badName = !name, badPhone = !/^(\+?972|0)\d{8,9}$/.test(digits), badOk = !el.consent.checked;
      setErr(el.fullname.closest('.field'), el.fullname, badName ? 'נא למלא שם מלא.' : '');
      setErr(el.phone.closest('.field'), el.phone, badPhone ? 'נא להזין מספר טלפון תקין, למשל 050-1234567.' : '');
      var cWrap = el.consent.closest('.consent');
      cWrap.classList.toggle('bad', badOk);
      el.consent.setAttribute('aria-invalid', badOk ? 'true' : 'false');
      $('.cerr', form).textContent = badOk ? 'כדי להמשיך יש לאשר יצירת קשר.' : '';
      if (badName) first = el.fullname; else if (badPhone) first = el.phone; else if (badOk) first = el.consent;
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
        if (!btn.dataset.origHtml) btn.dataset.origHtml = btn.innerHTML;
        btn.disabled = true;
        btn.classList.add('is-loading');
        btn.innerHTML = SPINNER_SVG + '<span>הפנייה נשלחת...</span>';
      }
      status.textContent = 'הפנייה נשלחת, רק רגע...';
      status.className = 'status is-loading';

      var actionAttr = form.getAttribute('action') || '';
      var submitEndpoint = 'https://formsubmit.co/rl0548479120@gmail.com';
      if (actionAttr && actionAttr.indexOf('formsubmit.co') !== -1) {
        submitEndpoint = actionAttr;
      }
      var ajaxUrl = submitEndpoint.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');
      var formData = new FormData(form);
      if (!formData.has('_subject')) formData.append('_subject', 'פנייה חדשה מהאתר – רחל לסקר');
      if (!formData.has('_template')) formData.append('_template', 'table');
      if (!formData.has('_captcha')) formData.append('_captcha', 'false');
      if (!formData.has('_next')) formData.append('_next', window.location.origin + '/thank-you/');

      fetch(ajaxUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      })
      .then(function (res) {
        if (!res.ok) throw new Error('Network error: ' + res.status);
        return res.json().catch(function () { return { success: 'true' }; });
      })
      .then(function (data) {
        if (data.success === 'true' || data.success === true) {
          try {
            sessionStorage.setItem('form_submitted', '1');
          } catch (storageErr) {}
          // איפוס הטופס ושיחזור הכפתור לקראת חזרה אפשרית
          resetFormState(form, true);
          window.location.href = '/thank-you/';
        } else {
          throw new Error(data.message || 'שגיאה בשליחה');
        }
      })
      .catch(function (err) {
        form.classList.remove('is-submitting');
        if (btn) {
          btn.disabled = false;
          btn.classList.remove('is-loading');
          btn.innerHTML = btn.dataset.origHtml || 'השאירו פרטים';
        }

        // בניית קישור wa.me עם הנתונים שהוזנו — fallback אוטומטי
        var nameVal = (form.elements.fullname && form.elements.fullname.value.trim()) || '';
        var phoneVal = (form.elements.phone && form.elements.phone.value.trim()) || '';
        var topicEl = form.elements.topic || form.elements.subject || null;
        var topicVal = (topicEl && topicEl.value) ? topicEl.value.trim() : '';
        var waMsg = 'שלום רחל,' +
          (nameVal ? '\nשם: ' + nameVal : '') +
          (phoneVal ? '\nטלפון: ' + phoneVal : '') +
          (topicVal ? '\nנושא: ' + topicVal : '') +
          '\nאשמח שתחזרי אליי.';
        var waUrl = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(waMsg);
        var WA_SVG = '<svg class="wa-btn-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">' +
          '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.64C9.36 7.64 9.09 7.7 8.87 7.95C8.65 8.19 8.04 8.76 8.04 9.94C8.04 11.11 8.9 12.24 9.01 12.4C9.13 12.56 10.66 14.91 13 15.93C13.56 16.17 14 16.33 14.34 16.44C14.9 16.62 15.41 16.59 15.82 16.53C16.27 16.46 17.21 15.96 17.41 15.41C17.61 14.85 17.61 14.38 17.55 14.28C17.49 14.18 17.33 14.12 17.08 14C16.83 13.88 15.61 13.28 15.38 13.2C15.16 13.11 15 13.07 14.83 13.32C14.66 13.57 14.18 14.12 14.04 14.29C13.89 14.46 13.75 14.48 13.5 14.36C13.25 14.23 12.46 13.97 11.53 13.14C10.8 12.49 10.31 11.68 10.17 11.43C10.03 11.18 10.15 11.05 10.28 10.92C10.39 10.81 10.53 10.63 10.66 10.48C10.79 10.33 10.83 10.22 10.91 10.06C11 9.89 10.95 9.75 10.89 9.63C10.83 9.5 10.34 8.3 10.14 7.81C9.94 7.32 9.74 7.39 9.58 7.38L9.53 7.64Z"/>' +
          '</svg>';
        status.innerHTML =
          '<span class="status-err-text">שליחת הטופס נכשלה.</span> ' +
          'ניתן לנסות שוב מאוחר יותר, או לשלוח את הפרטים בוואטסאפ: ' +
          '<a class="btn btn-brass btn-wa-fallback" href="' + waUrl + '" target="_blank" rel="noopener" aria-label="שליחת הפרטים בוואטסאפ (נפתח בחלון חדש)">' +
            WA_SVG +
            '<span>שליחה בוואטסאפ</span>' +
          '</a>';
        status.className = 'status err has-wa-fallback';
      });
    });
  });

  // איפוס אוטומטי של הטופס בחזרה אחורה בדפדפן (Back button / bfcache)
  window.addEventListener('pageshow', function (e) {
    var wasSubmitted = false;
    try {
      if (sessionStorage.getItem('form_submitted') === '1') {
        wasSubmitted = true;
        sessionStorage.removeItem('form_submitted');
      }
    } catch (err) {}

    $$('form.lead').forEach(function (form) {
      if (wasSubmitted || e.persisted || form.classList.contains('is-submitting')) {
        resetFormState(form, true);
      } else {
        var btn = $('button[type="submit"]', form);
        if (btn && (btn.disabled || btn.classList.contains('is-loading'))) {
          resetFormState(form, false);
        }
      }
    });
  });

  /* ---------- Quiz ---------- */
  var R = {
    self: { t: 'פנסיה וביטוח לעצמאים', u: '/self-employed/', p: 'כעצמאים אין מעסיק שמפריש בשבילכם, ולכן כדאי להתחיל בבדיקה של מה מופקד היום ומה נשאר בלי כיסוי. אפשר לקבל תמונה ראשונית גם בכלי החישוב.', also: [['מחשבון פער פנסיוני', '/tools/self-employed-pension/'], ['קרן השתלמות', '/study-fund/']] },
    retire: { t: 'הכנה לפרישה', u: '/retirement-planning/', p: 'ככל שהפרישה קרובה, חשוב להבין כמה נצבר, מה צפוי לקבל כל חודש ואיך המסלולים והכיסויים מתאימים לשלב הזה.', also: [['בדיקת פנסיה', '/pension/'], ['ביטוח בריאות', '/health-insurance/']] },
    pension: { t: 'בדיקת פנסיה וחיסכון', u: '/pension/', p: 'נקודת פתיחה טובה: לראות את כל הקרנות והצבירות במקום אחד, לבדוק דמי ניהול, מסלול השקעה וכיסויים ביטוחיים.', also: [['מחשבון השפעת דמי ניהול', '/tools/management-fees/'], ['ביטוח חיים', '/life-insurance/']] },
    family: { t: 'ביטוח חיים ובריאות', u: '/life-insurance/', p: 'כשיש מי שתלוי בכם, כדאי לוודא שהכיסוי למקרה פטירה, מחלה או אובדן כושר עבודה מתאים, ושאתם לא משלמים פעמיים על אותו כיסוי.', also: [['ביטוח בריאות', '/health-insurance/'], ['בדיקת פנסיה', '/pension/']] },
    invest: { t: 'קרן השתלמות וחיסכון לטווח בינוני', u: '/study-fund/', p: 'לחיסכון לטווח בינוני עד ארוך יש כמה מוצרים עם הבדלי מס ונזילות. כדאי להבין איזה מהם מתאים ליעד ולזמן שלכם.', also: [['קופת גמל להשקעה', '/investment-gemel/'], ['מחשבון ריבית דריבית', '/tools/compound-interest/']] }
  };
  $$('.quiz').forEach(function (root) {
    var steps = $$('.qstep', root), form = $('.q-form', root), box = $('.result', root);
    var next = $('.q-next', root), back = $('.q-back', root), prog = $('.bar-prog i', root), sn = $('.step-n', root);
    var i = 0;
    function show(n, focus) {
      i = n;
      steps.forEach(function (s, k) { s.hidden = k !== n; });
      back.hidden = n === 0;
      next.textContent = n === steps.length - 1 ? 'הצגת ההמלצה' : 'הבא';
      next.disabled = !$('input:checked', steps[n]);
      prog.style.width = (n / steps.length * 100) + '%';
      sn.textContent = 'שאלה ' + (n + 1) + ' מתוך ' + steps.length;
      if (focus) { var l = $('legend', steps[n]); l.setAttribute('tabindex', '-1'); l.focus(); }
    }
    steps.forEach(function (s) { s.addEventListener('change', function () { next.disabled = false; }); });
    back.addEventListener('click', function () { show(i - 1, true); });
    next.addEventListener('click', function () {
      if (i < steps.length - 1) { show(i + 1, true); return; }
      var a = {};
      steps.forEach(function (s) { var c = $('input:checked', s); a[c.name] = c.value; a[c.name + 'Label'] = c.parentNode.textContent.trim(); });
      var key = a.who === 'self' ? 'self' : (a.age === '50' ? 'retire' : (a.goal === 'unsure' ? 'pension' : a.goal));
      var r = R[key];
      var msg = 'שלום רחל, מילאתי את השאלון באתר.\nסטטוס: ' + a.whoLabel + '\nגיל: ' + a.ageLabel + '\nמה חשוב לי: ' + a.goalLabel + '\nההמלצה באתר: ' + r.t + '\nאשמח לשיחה.';
      var h = '<h3 tabindex="-1">נקודת פתיחה מומלצת: ' + r.t + '</h3><p>' + r.p + '</p>' +
        '<div class="cta-row"><a class="btn btn-primary" href="https://wa.me/' + WA + '?text=' + encodeURIComponent(msg) + '" target="_blank" rel="noopener">שלחו לי את התשובות בוואטסאפ</a>' +
        '<a class="btn btn-ghost" href="' + r.u + '">קראו עוד</a></div>' +
        '<p class="also">עוד כדאי לראות: ' + r.also.map(function (x) { return '<a href="' + x[1] + '">' + x[0] + '</a>'; }).join('') + '</p>' +
        '<p class="fine-print">ההמלצה כללית ואינה ייעוץ אישי. היא מיועדת לכוון לנושא הראשון שכדאי לבדוק.</p>' +
        '<button type="button" class="btn btn-ghost q-reset" style="margin-top:8px">להתחיל מחדש</button>';
      box.innerHTML = h;
      box.hidden = false; form.hidden = true;
      prog.style.width = '100%'; sn.textContent = 'סיימתם';
      $('h3', box).focus();
      $('.q-reset', box).addEventListener('click', function () {
        steps.forEach(function (s) { $$('input', s).forEach(function (x) { x.checked = false; }); });
        box.hidden = true; box.innerHTML = ''; form.hidden = false; show(0, true);
      });
    });
    show(0, false);
  });

  /* ---------- Charts ---------- */
  function niceMax(v) {
    if (v <= 0) return 1;
    var p = Math.pow(10, Math.floor(Math.log(v) / Math.LN10)), m = v / p;
    var n = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
    return n * p;
  }
  function fmtAxis(v) {
    if (v >= 1e6) return nf1.format(v / 1e6) + ' מיליון';
    if (v >= 1e3) return nf.format(v / 1e3) + ' אלף';
    return nf.format(v);
  }
  function chart(svg, series) {
    var W = 640, H = 300, pl = 92, pr = 16, pt = 14, pb = 36, NS = 'http://www.w3.org/2000/svg';
    var n = series[0].v.length - 1, max = 0;
    series.forEach(function (s) { s.v.forEach(function (x) { if (x > max) max = x; }); });
    max = niceMax(max);
    function X(k) { return pl + (W - pl - pr) * k / (n || 1); }
    function Y(v) { return pt + (H - pt - pb) * (1 - v / max); }
    var h = '';
    for (var g = 0; g <= 4; g++) {
      var gv = max * g / 4, gy = Y(gv);
      h += '<line class="grid" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + gy + '" y2="' + gy + '"/>';
      h += '<text x="' + (pl - 8) + '" y="' + (gy + 4) + '" text-anchor="end">' + fmtAxis(gv) + '</text>';
    }
    var step = Math.max(1, Math.ceil(n / 6));
    for (var k = 0; k <= n; k += step) h += '<text x="' + X(k) + '" y="' + (H - 12) + '" text-anchor="middle">' + k + '</text>';
    h += '<text x="' + (W - pr) + '" y="' + (H - 1) + '" text-anchor="end">שנים</text>';
    series.forEach(function (s) {
      var d = '';
      s.v.forEach(function (val, idx) { d += (idx ? 'L' : 'M') + X(idx).toFixed(1) + ' ' + Y(val).toFixed(1); });
      if (s.fill) h += '<path d="' + d + 'L' + X(n) + ' ' + Y(0) + 'L' + X(0) + ' ' + Y(0) + 'Z" fill="' + s.color + '" opacity=".14"/>';
      h += '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"' + (s.dash ? ' stroke-dasharray="7 6"' : '') + '/>';
      h += '<circle cx="' + X(n) + '" cy="' + Y(s.v[n]) + '" r="4.5" fill="' + s.color + '"/>';
    });
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('style', 'direction:ltr');
    svg.innerHTML = h;
  }

  /* ---------- Calculators ---------- */
  function setNum(el, val, fmt) {
    if (!el) return;
    var from = el._v == null ? val : el._v;
    el._v = val;
    if (reduce || from === val) { el.textContent = fmt(val); return; }
    cancelAnimationFrame(el._r);
    var t0 = performance.now();
    (function step(t) {
      var p = Math.min(1, (t - t0) / 350), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (val - from) * e);
      if (p < 1) el._r = requestAnimationFrame(step);
    })(t0);
  }
  function simFee(p, fd, fa) {
    var i = Math.pow(1 + p.y / 100, 1 / 12) - 1, b = p.bal, s = [b];
    for (var m = 1; m <= p.years * 12; m++) {
      b = b * (1 + i) + p.dep * (1 - fd / 100);
      b = b * (1 - fa / 100 / 12);
      if (m % 12 === 0) s.push(b);
    }
    return { final: b, s: s };
  }
  function simGrow(bal, dep, rate, years) {
    var i = Math.pow(1 + rate / 100, 1 / 12) - 1, b = bal, s = [b], d = [bal], put = bal;
    for (var m = 1; m <= years * 12; m++) {
      b = b * (1 + i) + dep; put += dep;
      if (m % 12 === 0) { s.push(b); d.push(put); }
    }
    return { final: b, put: put, s: s, d: d };
  }
  var C1 = 'var(--c1)', C2 = 'var(--c2)';
  var CALC = {
    fees: function (o, v) {
      var p = { bal: v.bal, dep: v.dep, years: v.years, y: v.y };
      var A = simFee(p, v.fdA, v.faA), B = simFee(p, v.fdB, v.faB);
      var diff = B.final - A.final, pct = A.final > 0 ? diff / A.final * 100 : 0;
      o.num('a', A.final, ils); o.num('b', B.final, ils); o.num('diff', diff, ils);
      o.cls('diff', diff > 0.5 ? 'pos' : diff < -0.5 ? 'neg' : '');
      var t = Math.abs(diff) < 0.5 ? 'אין הבדל בצבירה בין שני התרחישים.' :
        diff > 0 ? 'בתרחיש ב׳ הצבירה בסוף ' + v.years + ' השנים גבוהה ב־' + ils(diff) + ' (כ־' + nf1.format(Math.abs(pct)) + '%).' :
          'בתרחיש ב׳ הצבירה בסוף ' + v.years + ' השנים נמוכה ב־' + ils(-diff) + ' (כ־' + nf1.format(Math.abs(pct)) + '%).';
      o.text('verdict', t);
      chart(o.svg, [{ v: A.s, color: C2, dash: true }, { v: B.s, color: C1, fill: true }]);
      return 'תרחיש א׳: ' + ils(A.final) + '. תרחיש ב׳: ' + ils(B.final) + '. ' + t;
    },
    compound: function (o, v) {
      var g = simGrow(v.init, v.monthly, v.rate, v.years), gain = g.final - g.put;
      o.num('final', g.final, ils); o.num('put', g.put, ils); o.num('gain', gain, ils);
      var share = g.final > 0 ? gain / g.final * 100 : 0;
      var t = 'בהנחות שהוזנו, כ־' + nf.format(share) + '% מהסכום הסופי מגיע מתשואה ולא מהפקדות.';
      o.text('verdict', t);
      chart(o.svg, [{ v: g.s, color: C1, fill: true }, { v: g.d, color: C2, dash: true }]);
      return 'סכום סופי: ' + ils(g.final) + '. הפקדות: ' + ils(g.put) + '. רווח: ' + ils(gain) + '. ' + t;
    },
    self: function (o, v) {
      if (v.retire <= v.age) { o.text('verdict', 'גיל הפרישה צריך להיות גבוה מהגיל הנוכחי.'); return ''; }
      var yrs = v.retire - v.age, n = yrs * 12, i = Math.pow(1 + v.y / 100, 1 / 12) - 1;
      var ann = i > 0 ? (Math.pow(1 + i, n) - 1) / i : n;
      var cap = v.bal * Math.pow(1 + i, n) + v.dep * ann;
      var pension = cap / v.coef, target = v.income * v.target / 100, have = pension + v.ni;
      var gap = Math.max(0, target - have), extra = gap * v.coef / ann;
      var cur = simGrow(v.bal, v.dep, v.y, yrs), alt = simGrow(v.bal, v.dep + extra, v.y, yrs);
      o.num('cap', cap, ils); o.num('pension', pension, ils); o.num('target', target, ils);
      o.num('gap', gap, ils); o.num('extra', extra, ils);
      o.cls('gap', gap > 0 ? 'neg' : 'pos');
      var t = gap > 0 ?
        'לפי ההנחות, חסרים כ־' + ils(gap) + ' בחודש ביחס ליעד. כדי לסגור את הפער היה צריך להפקיד עוד כ־' + ils(extra) + ' בחודש.' :
        'לפי ההנחות שהוזנו, היעד מתקיים. כדאי לבדוק גם כיסויים ביטוחיים ובחינה תקופתית של הנתונים.';
      o.text('verdict', t);
      chart(o.svg, [{ v: cur.s, color: C2, dash: true }, { v: alt.s, color: C1, fill: true }]);
      return 'צבירה צפויה: ' + ils(cap) + '. קצבה חודשית צפויה: ' + ils(pension) + '. יעד: ' + ils(target) + '. ' + t;
    }
  };
  $$('[data-calc]').forEach(function (root) {
    var type = root.getAttribute('data-calc'), els = {}, timer;
    var sum = $('[data-sum]', root), svg = $('svg.chart', root);
    var outs = {};
    $$('[data-o]', root).forEach(function (e) { outs[e.getAttribute('data-o')] = e; });
    var api = {
      svg: svg,
      num: function (k, val, f) { setNum(outs[k], val, f); },
      text: function (k, t) { if (outs[k]) outs[k].textContent = t; },
      cls: function (k, c) { if (outs[k]) { outs[k].classList.remove('pos', 'neg'); if (c) outs[k].classList.add(c); } }
    };
    $$('.f', root).forEach(function (f) {
      var n = $('input[type=number]', f), r = $('input[type=range]', f);
      els[n.getAttribute('data-k')] = { f: f, n: n, err: $('.err', f) };
      n.addEventListener('input', function () { if (r && n.value !== '' && !isNaN(parseFloat(n.value))) r.value = n.value; run(); });
      if (r) r.addEventListener('input', function () { n.value = r.value; run(); });
    });
    function vals() {
      var v = {};
      Object.keys(els).forEach(function (k) {
        var e = els[k], n = e.n, x = parseFloat(String(n.value).replace(',', '.')), mn = +n.min, mx = +n.max, bad = false;
        if (isNaN(x)) { bad = true; x = parseFloat(n.defaultValue); }
        else if (x < mn || x > mx) { bad = true; x = Math.min(mx, Math.max(mn, x)); }
        e.f.classList.toggle('bad', bad);
        n.setAttribute('aria-invalid', bad ? 'true' : 'false');
        e.err.textContent = bad ? 'נא להזין ערך בין ' + fmtN(mn) + ' ל־' + fmtN(mx) + '.' : '';
        v[k] = x;
      });
      return v;
    }
    function run() {
      var s = CALC[type](api, vals());
      clearTimeout(timer);
      if (svg && s) svg.setAttribute('aria-label', s);
      if (sum && s) timer = setTimeout(function () { sum.textContent = s; }, 800);
    }
    run();
  });

  /* ---------- Sienna Accessibility Enhancements (Polyfill for Hide Images & Image Tooltips) ---------- */
  function initSiennaEnhancements() {
    var tooltipEl = doc.createElement('div');
    tooltipEl.className = 'asw-floating-tooltip';
    tooltipEl.setAttribute('role', 'tooltip');
    tooltipEl.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(tooltipEl);

    function updateSiennaFeatures() {
      var raw = '';
      try { raw = localStorage.getItem('asw-user-settings') || ''; } catch (e) {}
      var states = {};
      try { if (raw) states = JSON.parse(raw).states || {}; } catch (e) {}

      var hideBtn = doc.querySelector('[data-key="hide-images"]');
      var isHide = hideBtn ? hideBtn.classList.contains('asw-selected') : false;

      var tooltipBtn = doc.querySelector('[data-key="image-tooltips"]');
      var isTooltips = tooltipBtn ? tooltipBtn.classList.contains('asw-selected') : false;

      var adhdBtn = doc.querySelector('[data-key="adhd-friendly"]');
      if (adhdBtn && adhdBtn.classList.contains('asw-selected')) isHide = true;
      var blindBtn = doc.querySelector('[data-key="blind"]');
      if (blindBtn && blindBtn.classList.contains('asw-selected')) isTooltips = true;

      doc.documentElement.classList.toggle('asw-hide-images', isHide);
      doc.documentElement.classList.toggle('asw-image-tooltips', isTooltips);
    }

    doc.addEventListener('mouseover', function (e) {
      if (!doc.documentElement.classList.contains('asw-image-tooltips')) return;
      var img = e.target && e.target.closest ? e.target.closest('img:not(.asw-menu img):not(.asw-widget img)') : null;
      if (img) {
        var alt = (img.getAttribute('alt') || '').trim();
        tooltipEl.textContent = 'תיאור תמונה: ' + (alt || 'ללא תיאור טקסטואלי');
        tooltipEl.classList.add('is-visible');
      }
    });

    doc.addEventListener('mousemove', function (e) {
      if (!tooltipEl.classList.contains('is-visible')) return;
      var x = e.clientX - 20;
      var y = e.clientY + 20;
      if (x + 320 > window.innerWidth) x = window.innerWidth - 330;
      if (x < 10) x = 10;
      if (y + 60 > window.innerHeight) y = e.clientY - 50;
      tooltipEl.style.left = x + 'px';
      tooltipEl.style.top = y + 'px';
    });

    doc.addEventListener('mouseout', function (e) {
      var img = e.target && e.target.closest ? e.target.closest('img:not(.asw-menu img):not(.asw-widget img)') : null;
      if (img) tooltipEl.classList.remove('is-visible');
    });

    // Run on startup
    updateSiennaFeatures();

    // Listen to clicks on accessibility menu or reset buttons
    doc.addEventListener('click', function (e) {
      if (e.target && e.target.closest && (e.target.closest('.asw-menu') || e.target.closest('.asw-widget') || e.target.closest('.asw-btn'))) {
        setTimeout(updateSiennaFeatures, 40);
        setTimeout(updateSiennaFeatures, 200);
      }
    });

    // Listen to storage changes across tabs
    window.addEventListener('storage', function (e) {
      if (e.key === 'asw-user-settings') updateSiennaFeatures();
    });

    // Check periodically during the first few seconds until Sienna is initialized
    var checks = 0;
    var interval = setInterval(function () {
      updateSiennaFeatures();
      checks++;
      if (checks > 15) clearInterval(interval);
    }, 400);
  }
  initSiennaEnhancements();

  /* ---------- Mobile Sticky Quick Contact Widget ---------- */
  function initMobileQuickContact() {
    var existing = doc.getElementById('quick-contact-widget');
    if (!existing) {
      var aside = doc.createElement('aside');
      aside.id = 'quick-contact-widget';
      aside.className = 'quick-contact-widget';
      aside.setAttribute('aria-label', 'יצירת קשר מהירה');
      aside.innerHTML =
        '<div class="qc-backdrop" aria-hidden="true"></div>' +
        '<button type="button" class="qc-trigger" id="qc-trigger" aria-expanded="false" aria-controls="qc-menu" aria-label="פתח אפשרויות ליצירת קשר">' +
          '<svg class="qc-trigger-icon qc-icon-phone" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>' +
          '<svg class="qc-trigger-icon qc-icon-close" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' +
        '</button>' +
        '<nav class="qc-menu" id="qc-menu" aria-label="אפשרויות יצירת קשר מהירה">' +
          '<a class="qc-btn qc-btn-wa" href="https://wa.me/972559535605?text=%D7%A9%D7%9C%D7%95%D7%9D%20%D7%A8%D7%97%D7%9C%2C%20%D7%94%D7%92%D7%A2%D7%AA%D7%99%20%D7%9E%D7%94%D7%90%D7%AA%D7%A8%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%99%D7%97%D7%94." target="_blank" rel="noopener">' +
            '<span class="qc-btn-text">הודעת וואטסאפ</span>' +
            '<span class="qc-btn-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.64C9.36 7.64 9.09 7.7 8.87 7.95C8.65 8.19 8.04 8.76 8.04 9.94C8.04 11.11 8.9 12.24 9.01 12.4C9.13 12.56 10.66 14.91 13 15.93C13.56 16.17 14 16.33 14.34 16.44C14.9 16.62 15.41 16.59 15.82 16.53C16.27 16.46 17.21 15.96 17.41 15.41C17.61 14.85 17.61 14.38 17.55 14.28C17.49 14.18 17.33 14.12 17.08 14C16.83 13.88 15.61 13.28 15.38 13.2C15.16 13.11 15 13.07 14.83 13.32C14.66 13.57 14.18 14.12 14.04 14.29C13.89 14.46 13.75 14.48 13.5 14.36C13.25 14.23 12.46 13.97 11.53 13.14C10.8 12.49 10.31 11.68 10.17 11.43C10.03 11.18 10.15 11.05 10.28 10.92C10.39 10.81 10.53 10.63 10.66 10.48C10.79 10.33 10.83 10.22 10.91 10.06C11 9.89 10.95 9.75 10.89 9.63C10.83 9.5 10.34 8.3 10.14 7.81C9.94 7.32 9.74 7.39 9.58 7.38L9.53 7.64Z"/></svg></span>' +
          '</a>' +
          '<a class="qc-btn qc-btn-call" href="tel:+972559535605">' +
            '<span class="qc-btn-text">חייג עכשיו</span>' +
            '<span class="qc-btn-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg></span>' +
          '</a>' +
          '<button type="button" class="qc-btn qc-btn-form" id="qc-btn-scroll-form">' +
            '<span class="qc-btn-text">השאר פרטים</span>' +
            '<span class="qc-btn-icon"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></span>' +
          '</button>' +
        '</nav>';
      doc.body.appendChild(aside);
      existing = aside;
    }

    var trigger = doc.getElementById('qc-trigger');
    var backdrop = existing.querySelector('.qc-backdrop');
    var formBtn = doc.getElementById('qc-btn-scroll-form');

    function toggleMenu(forceOpen) {
      var isOpen = typeof forceOpen === 'boolean' ? forceOpen : !existing.classList.contains('is-open');
      existing.classList.toggle('is-open', isOpen);
      if (backdrop) backdrop.classList.toggle('is-open', isOpen);
      if (trigger) {
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        trigger.setAttribute('aria-label', isOpen ? 'סגור אפשרויות ליצירת קשר' : 'פתח אפשרויות ליצירת קשר');
      }
    }

    if (trigger) {
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleMenu();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', function () {
        toggleMenu(false);
      });
    }

    if (formBtn) {
      formBtn.addEventListener('click', function (e) {
        e.preventDefault();
        toggleMenu(false);
        var form = doc.getElementById('contact') || doc.querySelector('form.card.lead') || doc.querySelector('form.lead') || doc.querySelector('form[action*="formsubmit"]');
        if (form) {
          form.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(function () {
            var firstInput = form.querySelector('input:not([type="hidden"]), select, textarea');
            if (firstInput) {
              try { firstInput.focus({ preventScroll: true }); } catch (err) { firstInput.focus(); }
            }
          }, 400);
        } else {
          window.location.href = '/#contact';
        }
      });
    }

    doc.addEventListener('keydown', function (e) {
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
        onDragStart: function () {
          toggleMenu(false);
        },
        onBeforeDismiss: function () {
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
  var floatingDismissTargetEl = null;
  var floatingUndoToastEl = null;
  var undoToastTimer = null;

  function getOrCreateDismissTarget() {
    if (!floatingDismissTargetEl) {
      floatingDismissTargetEl = doc.getElementById('floating-dismiss-target');
      if (!floatingDismissTargetEl) {
        var el = doc.createElement('div');
        el.id = 'floating-dismiss-target';
        el.className = 'floating-dismiss-target';
        el.setAttribute('aria-hidden', 'true');
        el.innerHTML =
          '<div class="fdt-circle">' +
            '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
              '<line x1="18" y1="6" x2="6" y2="18"></line>' +
              '<line x1="6" y1="6" x2="18" y2="18"></line>' +
            '</svg>' +
          '</div>' +
          '<span class="fdt-label">גרור לכאן להסרה</span>';
        doc.body.appendChild(el);
        floatingDismissTargetEl = el;
      }
    }
    return floatingDismissTargetEl;
  }

  function showUndoToast(message, onUndo) {
    if (!floatingUndoToastEl) {
      floatingUndoToastEl = doc.getElementById('floating-undo-toast');
      if (!floatingUndoToastEl) {
        var el = doc.createElement('div');
        el.id = 'floating-undo-toast';
        el.className = 'floating-undo-toast';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        el.innerHTML =
          '<span class="fut-text"></span>' +
          '<button type="button" class="fut-undo-btn">בטל</button>' +
          '<button type="button" class="fut-close-btn" aria-label="סגור הודעה">&times;</button>';
        doc.body.appendChild(el);
        floatingUndoToastEl = el;

        floatingUndoToastEl.querySelector('.fut-close-btn').addEventListener('click', function () {
          floatingUndoToastEl.classList.remove('is-visible');
        });
      }
    }

    floatingUndoToastEl.querySelector('.fut-text').textContent = message;
    var undoBtn = floatingUndoToastEl.querySelector('.fut-undo-btn');
    var newUndoBtn = undoBtn.cloneNode(true);
    undoBtn.parentNode.replaceChild(newUndoBtn, undoBtn);

    newUndoBtn.addEventListener('click', function () {
      floatingUndoToastEl.classList.remove('is-visible');
      if (typeof onUndo === 'function') onUndo();
    });

    floatingUndoToastEl.classList.add('is-visible');

    if (undoToastTimer) clearTimeout(undoToastTimer);
    undoToastTimer = setTimeout(function () {
      if (floatingUndoToastEl) floatingUndoToastEl.classList.remove('is-visible');
    }, 5500);
  }

  function makeDraggableAndDismissible(options) {
    var triggerEl = options.triggerElement;
    var container = options.containerToDismiss || triggerEl;
    var storageKey = options.storageKey;
    var removedText = options.removedText || 'הכפתור הוסר מהמסך';
    var onDragStart = options.onDragStart;
    var onBeforeDismiss = options.onBeforeDismiss;
    var onRestore = options.onRestore;

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

    var dismissTarget = getOrCreateDismissTarget();
    var circle = dismissTarget.querySelector('.fdt-circle');
    var label = dismissTarget.querySelector('.fdt-label');

    var isDragging = false;
    var startX = 0;
    var startY = 0;
    var currentDx = 0;
    var currentDy = 0;
    var initialRect = null;
    var longPressTimer = null;
    var suppressClick = false;
    var isOverTarget = false;

    var LONG_PRESS_MS = 240;
    var MOVE_THRESHOLD = 6;

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
      var targetRect = circle.getBoundingClientRect();
      var tcX = targetRect.left + targetRect.width / 2;
      var tcY = targetRect.top + targetRect.height / 2;

      var elCenterX = initialRect.left + initialRect.width / 2 + currentDx;
      var elCenterY = initialRect.top + initialRect.height / 2 + currentDy;

      var dist = Math.hypot(elCenterX - tcX, elCenterY - tcY);
      var snapRadius = (targetRect.width / 2) + (Math.max(initialRect.width, initialRect.height) / 2) + 24;

      return dist <= snapRadius;
    }

    function onPointerDown(e) {
      if (e.type === 'mousedown' && e.button !== 0) return;

      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;

      startX = clientX;
      startY = clientY;
      currentDx = 0;
      currentDy = 0;
      isOverTarget = false;
      isDragging = false;
      initialRect = triggerEl.getBoundingClientRect();

      if (longPressTimer) clearTimeout(longPressTimer);
      longPressTimer = setTimeout(function () {
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

      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;

      var dx = clientX - startX;
      var dy = clientY - startY;

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

        var over = checkProximity();
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

        var scale = isOverTarget ? 0.85 : 1.1;
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
      setTimeout(function () {
        suppressClick = false;
      }, 400);

      if (isOverTarget) {
        // DISMISS ACTION
        if (typeof onBeforeDismiss === 'function') {
          try { onBeforeDismiss(); } catch (_) {}
        }

        var targetRect = circle.getBoundingClientRect();
        var tcX = targetRect.left + targetRect.width / 2;
        var tcY = targetRect.top + targetRect.height / 2;
        var finalDx = tcX - (initialRect.left + initialRect.width / 2);
        var finalDy = tcY - (initialRect.top + initialRect.height / 2);

        triggerEl.style.setProperty('transition', 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease-in', 'important');
        triggerEl.style.setProperty('transform', 'translate3d(' + finalDx + 'px, ' + finalDy + 'px, 0) scale(0.1)', 'important');
        triggerEl.style.setProperty('opacity', '0', 'important');

        dismissTarget.classList.remove('is-hovered');
        if (navigator.vibrate) {
          try { navigator.vibrate([30, 45, 30]); } catch (_) {}
        }

        setTimeout(function () {
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

          showUndoToast(removedText, function () {
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
            setTimeout(function () {
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

        setTimeout(function () {
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

    triggerEl.addEventListener('click', function (e) {
      if (suppressClick) {
        e.stopPropagation();
        e.preventDefault();
        return false;
      }
    }, true);
  }

  /* ---------- Bind Sienna Accessibility Button ---------- */
  function bindSiennaAccessibilityDragDismiss() {
    var STORAGE_KEY = 'asw_accessibility_widget_dismissed';

    function tryBind() {
      var aswBtn = doc.querySelector('.asw-menu-btn') || doc.querySelector('#asw-menu-btn') || doc.querySelector('.asw-widget button');
      if (!aswBtn) return false;

      var aswContainer = aswBtn.closest('.asw-widget') || aswBtn;

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
        onBeforeDismiss: function () {
          var closeBtn = doc.querySelector('.asw-menu-close') || doc.querySelector('.asw-menu .close');
          if (closeBtn) closeBtn.click();
        }
      });
      return true;
    }

    if (!tryBind()) {
      var attempts = 0;
      var interval = setInterval(function () {
        attempts++;
        if (tryBind() || attempts > 25) {
          clearInterval(interval);
        }
      }, 250);

      if (window.MutationObserver) {
        var observer = new MutationObserver(function () {
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
      var qc = doc.getElementById('quick-contact-widget');
      if (qc) qc.style.removeProperty('display');
      var asw = doc.querySelector('.asw-widget') || doc.querySelector('.asw-menu-btn');
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
