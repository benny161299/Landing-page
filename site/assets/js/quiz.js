/* quiz.js — שאלון "איפה כדאי להתחיל?" (.quiz). נטען רק בעמוד הבית. */
(function () {
  'use strict';
  const { doc, $, $$, el, WA } = window.RL;

  const R = {
    self: { t: 'פנסיה וביטוח לעצמאים', u: '/self-employed/', p: 'כעצמאים אין מעסיק שמפריש בשבילכם, ולכן כדאי להתחיל בבדיקה של מה מופקד היום ומה נשאר בלי כיסוי. אפשר לקבל תמונה ראשונית גם בכלי החישוב.', also: [['מחשבון פער פנסיוני', '/tools/self-employed-pension/'], ['קרן השתלמות', '/study-fund/']] },
    retire: { t: 'הכנה לפרישה', u: '/retirement-planning/', p: 'ככל שהפרישה קרובה, חשוב להבין כמה נצבר, מה צפוי לקבל כל חודש ואיך המסלולים והכיסויים מתאימים לשלב הזה.', also: [['בדיקת פנסיה', '/pension/'], ['ביטוח בריאות', '/health-insurance/']] },
    pension: { t: 'בדיקת פנסיה וחיסכון', u: '/pension/', p: 'נקודת פתיחה טובה: לראות את כל הקרנות והצבירות במקום אחד, לבדוק דמי ניהול, מסלול השקעה וכיסויים ביטוחיים.', also: [['מחשבון השפעת דמי ניהול', '/tools/management-fees/'], ['ביטוח חיים', '/life-insurance/']] },
    family: { t: 'ביטוח חיים ובריאות', u: '/life-insurance/', p: 'כשיש מי שתלוי בכם, כדאי לוודא שהכיסוי למקרה פטירה, מחלה או אובדן כושר עבודה מתאים, ושאתם לא משלמים פעמיים על אותו כיסוי.', also: [['ביטוח בריאות', '/health-insurance/'], ['בדיקת פנסיה', '/pension/']] },
    invest: { t: 'קרן השתלמות וחיסכון לטווח בינוני', u: '/study-fund/', p: 'לחיסכון לטווח בינוני עד ארוך יש כמה מוצרים עם הבדלי מס ונזילות. כדאי להבין איזה מהם מתאים ליעד ולזמן שלכם.', also: [['קופת גמל להשקעה', '/investment-gemel/'], ['מחשבון ריבית דריבית', '/tools/compound-interest/']] }
  };

  // בניית תיבת התוצאה במנגנון DOM בטוח (חלופה ל-innerHTML)
  function buildResult(r, waMsg) {
    const h3 = el('h3', { tabindex: '-1', text: 'נקודת פתיחה מומלצת: ' + r.t });
    const p = el('p', { text: r.p });
    const ctaRow = el('div', { class: 'cta-row' }, [
      el('a', {
        class: 'btn btn-primary',
        href: 'https://wa.me/' + WA + '?text=' + encodeURIComponent(waMsg),
        target: '_blank',
        rel: 'noopener',
        text: 'שלחו לי את התשובות בוואטסאפ'
      }),
      el('a', { class: 'btn btn-ghost', href: r.u, text: 'קראו עוד' })
    ]);
    const also = el('p', { class: 'also' }, [
      doc.createTextNode('עוד כדאי לראות: '),
      ...r.also.map((x) => el('a', { href: x[1], text: x[0] }))
    ]);
    const finePrint = el('p', {
      class: 'fine-print',
      text: 'ההמלצה כללית ואינה ייעוץ אישי. היא מיועדת לכוון לנושא הראשון שכדאי לבדוק.'
    });
    const resetBtn = el('button', {
      type: 'button',
      class: 'btn btn-ghost q-reset',
      style: 'margin-top:8px',
      text: 'להתחיל מחדש'
    });
    return [h3, p, ctaRow, also, finePrint, resetBtn];
  }

  $$('.quiz').forEach((root) => {
    const steps = $$('.qstep', root), form = $('.q-form', root), box = $('.result', root);
    const next = $('.q-next', root), back = $('.q-back', root), prog = $('.bar-prog i', root), sn = $('.step-n', root);
    let i = 0;
    function show(n, focus) {
      if (n < 0 || n >= steps.length) return;
      i = n;
      steps.forEach((s, k) => { s.hidden = k !== n; });
      back.hidden = n === 0;
      next.textContent = n === steps.length - 1 ? 'הצגת ההמלצה' : 'הבא';
      next.disabled = !$('input:checked', steps[n]);
      prog.style.width = (n / steps.length * 100) + '%';
      sn.textContent = 'שאלה ' + (n + 1) + ' מתוך ' + steps.length;
      if (focus) { const l = $('legend', steps[n]); if (l) { l.setAttribute('tabindex', '-1'); l.focus(); } }
    }
    steps.forEach((s) => { s.addEventListener('change', () => { next.disabled = false; }); });
    back.addEventListener('click', () => {
      if (i > 0) {
        show(i - 1, true);
      }
    });
    next.addEventListener('click', () => {
      if (i < steps.length - 1) { show(i + 1, true); return; }
      const a = {};
      steps.forEach((s) => { const c = $('input:checked', s); a[c.name] = c.value; a[c.name + 'Label'] = c.parentNode.textContent.trim(); });
      const key = a.who === 'self' ? 'self' : (a.age === '50' ? 'retire' : (a.goal === 'unsure' ? 'pension' : a.goal));
      const r = R[key];
      const msg = 'שלום רחל, מילאתי את השאלון באתר.\nסטטוס: ' + a.whoLabel + '\nגיל: ' + a.ageLabel + '\nמה חשוב לי: ' + a.goalLabel + '\nההמלצה באתר: ' + r.t + '\nאשמח לשיחה.';
      box.replaceChildren(...buildResult(r, msg));
      box.hidden = false; form.hidden = true;
      prog.style.width = '100%'; sn.textContent = 'סיימתם';
      $('h3', box).focus();
      $('.q-reset', box).addEventListener('click', () => {
        steps.forEach((s) => { $$('input', s).forEach((x) => { x.checked = false; }); });
        box.hidden = true; box.replaceChildren(); form.hidden = false; show(0, true);
      });
    });
    show(0, false);
  });
})();
