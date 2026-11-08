/* calculators.js — גרפים ומחשבונים ([data-calc]). נטען רק בעמודי הכלים. */
(function () {
  'use strict';
  const { doc, $, $$, el, svgEl, reduce, nf, nf1, fmtN, ils } = window.RL;

  /* ---------- Charts ---------- */
  function niceMax(v) {
    if (v <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log(v) / Math.LN10)), m = v / p;
    const n = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
    return n * p;
  }
  function fmtAxis(v) {
    if (v >= 1e6) return nf1.format(v / 1e6) + ' מיליון';
    if (v >= 1e3) return nf.format(v / 1e3) + ' אלף';
    return nf.format(v);
  }
  // בניית הגרף במנגנון DOM בטוח (createElementNS) — חלופה ל-svg.innerHTML
  function chart(svg, series) {
    if (!svg) return; // כלים ללא גרף (הערכות צורך) מדלגים
    const W = 640, H = 300, pl = 92, pr = 16, pt = 14, pb = 36;
    const n = series[0].v.length - 1;
    let max = 0;
    series.forEach((s) => { s.v.forEach((x) => { if (x > max) max = x; }); });
    max = niceMax(max);
    const X = (k) => pl + (W - pl - pr) * k / (n || 1);
    const Y = (v) => pt + (H - pt - pb) * (1 - v / max);
    svg.replaceChildren();
    for (let g = 0; g <= 4; g++) {
      const gv = max * g / 4, gy = Y(gv);
      svg.appendChild(svgEl('line', { class: 'grid', x1: pl, x2: W - pr, y1: gy, y2: gy }));
      svg.appendChild(svgEl('text', { x: pl - 8, y: gy + 4, 'text-anchor': 'end', text: fmtAxis(gv) }));
    }
    const step = Math.max(1, Math.ceil(n / 6));
    for (let k = 0; k <= n; k += step) {
      svg.appendChild(svgEl('text', { x: X(k), y: H - 12, 'text-anchor': 'middle', text: k }));
    }
    svg.appendChild(svgEl('text', { x: W - pr, y: H - 1, 'text-anchor': 'end', text: 'שנים' }));
    series.forEach((s) => {
      let d = '';
      s.v.forEach((val, idx) => { d += (idx ? 'L' : 'M') + X(idx).toFixed(1) + ' ' + Y(val).toFixed(1); });
      if (s.fill) {
        svg.appendChild(svgEl('path', {
          d: d + 'L' + X(n) + ' ' + Y(0) + 'L' + X(0) + ' ' + Y(0) + 'Z',
          fill: s.color, opacity: '.14'
        }));
      }
      const lineAttrs = {
        d, fill: 'none', stroke: s.color, 'stroke-width': '3',
        'stroke-linejoin': 'round', 'stroke-linecap': 'round'
      };
      if (s.dash) lineAttrs['stroke-dasharray'] = '7 6';
      svg.appendChild(svgEl('path', lineAttrs));
      svg.appendChild(svgEl('circle', { cx: X(n), cy: Y(s.v[n]), r: '4.5', fill: s.color }));
    });
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('style', 'direction:ltr');
  }

  /* ---------- Calculators ---------- */
  function setNum(node, val, fmt) {
    if (!node) return;
    const from = node._v == null ? val : node._v;
    node._v = val;
    if (reduce || from === val) { node.textContent = fmt(val); return; }
    cancelAnimationFrame(node._r);
    const t0 = performance.now();
    (function step(t) {
      const p = Math.min(1, (t - t0) / 350), e = 1 - Math.pow(1 - p, 3);
      node.textContent = fmt(from + (val - from) * e);
      if (p < 1) node._r = requestAnimationFrame(step);
    })(t0);
  }
  function simFee(p, fd, fa) {
    const i = Math.pow(1 + p.y / 100, 1 / 12) - 1;
    let b = p.bal;
    const s = [b];
    for (let m = 1; m <= p.years * 12; m++) {
      b = b * (1 + i) + p.dep * (1 - fd / 100);
      b = b * (1 - fa / 100 / 12);
      if (m % 12 === 0) s.push(b);
    }
    return { final: b, s };
  }
  function simGrow(bal, dep, rate, years) {
    const i = Math.pow(1 + rate / 100, 1 / 12) - 1;
    let b = bal, put = bal;
    const s = [b], d = [bal];
    for (let m = 1; m <= years * 12; m++) {
      b = b * (1 + i) + dep; put += dep;
      if (m % 12 === 0) { s.push(b); d.push(put); }
    }
    return { final: b, put, s, d };
  }
  const C1 = 'var(--c1)', C2 = 'var(--c2)';
  /* תקרות שנת מס 2026 (מקור: לוח העזר של רשות המסים). מתעדכן מדי שנה. */
  const SF_SAL_CAP = 15712; // תקרת שכר חודשי להטבת קרן השתלמות לשכיר
  const SF_SELF_CAP = 20566; // תקרת הפקדה מוטבת שנתית לעצמאי (פטור על הרווחים)
  const GEMEL_CAP = 83641; // תקרת הפקדה שנתית לקופת גמל להשקעה, לכל הקופות יחד
  const Q_CAP = 9430; // תקרת קצבה מזכה חודשית
  const Q_BASKET = 976005; // סל הפטור המלא בקיבוע זכויות: 180 קצבאות מזעריות (5,306 ₪) כפול 57.5% כפול התקרה
  const Q_PCT = { '2026': 57.5, '2027': 62.5, '2028': 67 }; // שיעור הפטור לקצבה מזכה לפי שנה
  const CALC = {
    fees(o, v) {
      const p = { bal: v.bal, dep: v.dep, years: v.years, y: v.y };
      const A = simFee(p, v.fdA, v.faA), B = simFee(p, v.fdB, v.faB);
      const diff = B.final - A.final, pct = A.final > 0 ? diff / A.final * 100 : 0;
      o.num('a', A.final, ils); o.num('b', B.final, ils); o.num('diff', diff, ils);
      o.cls('diff', diff > 0.5 ? 'pos' : diff < -0.5 ? 'neg' : '');
      const t = Math.abs(diff) < 0.5 ? 'אין הבדל בצבירה בין שני התרחישים.' :
        diff > 0 ? 'בתרחיש ב׳ הצבירה בסוף ' + v.years + ' השנים גבוהה ב־' + ils(diff) + ' (כ־' + nf1.format(Math.abs(pct)) + '%).' :
          'בתרחיש ב׳ הצבירה בסוף ' + v.years + ' השנים נמוכה ב־' + ils(-diff) + ' (כ־' + nf1.format(Math.abs(pct)) + '%).';
      o.text('verdict', t);
      chart(o.svg, [{ v: A.s, color: C2, dash: true }, { v: B.s, color: C1, fill: true }]);
      return 'תרחיש א׳: ' + ils(A.final) + '. תרחיש ב׳: ' + ils(B.final) + '. ' + t;
    },
    compound(o, v) {
      const g = simGrow(v.init, v.monthly, v.rate, v.years), gain = g.final - g.put;
      o.num('final', g.final, ils); o.num('put', g.put, ils); o.num('gain', gain, ils);
      const share = g.final > 0 ? gain / g.final * 100 : 0;
      const t = 'בהנחות שהוזנו, כ־' + nf.format(share) + '% מהסכום הסופי מגיע מתשואה ולא מהפקדות.';
      o.text('verdict', t);
      chart(o.svg, [{ v: g.s, color: C1, fill: true }, { v: g.d, color: C2, dash: true }]);
      return 'סכום סופי: ' + ils(g.final) + '. הפקדות: ' + ils(g.put) + '. רווח: ' + ils(gain) + '. ' + t;
    },
    self(o, v) {
      if (v.retire <= v.age) { return ''; }
      const yrs = v.retire - v.age, n = yrs * 12, i = Math.pow(1 + v.y / 100, 1 / 12) - 1;
      const ann = i > 0 ? (Math.pow(1 + i, n) - 1) / i : n;
      const cap = v.bal * Math.pow(1 + i, n) + v.dep * ann;
      const pension = cap / v.coef, target = v.income * v.target / 100, have = pension + v.ni;
      const gap = Math.max(0, target - have), extra = gap * v.coef / ann;
      const cur = simGrow(v.bal, v.dep, v.y, yrs), alt = simGrow(v.bal, v.dep + extra, v.y, yrs);
      o.num('cap', cap, ils); o.num('pension', pension, ils); o.num('target', target, ils);
      o.num('gap', gap, ils); o.num('extra', extra, ils);
      o.cls('gap', gap > 0 ? 'neg' : 'pos');
      const t = gap > 0 ?
        'לפי ההנחות, חסרים כ־' + ils(gap) + ' בחודש ביחס ליעד. כדי לסגור את הפער היה צריך להפקיד עוד כ־' + ils(extra) + ' בחודש.' :
        'לפי ההנחות שהוזנו, היעד מתקיים. כדאי לבדוק גם כיסויים ביטוחיים ובחינה תקופתית של הנתונים.';
      o.text('verdict', t);
      chart(o.svg, [{ v: cur.s, color: C2, dash: true }, { v: alt.s, color: C1, fill: true }]);
      return 'צבירה צפויה: ' + ils(cap) + '. קצבה חודשית צפויה: ' + ils(pension) + '. יעד: ' + ils(target) + '. ' + t;
    },
    pension(o, v) {
      if (v.retire <= v.age) { return ''; }
      const yrs = v.retire - v.age, n = yrs * 12, i = Math.pow(1 + v.y / 100, 1 / 12) - 1;
      const ann = i > 0 ? (Math.pow(1 + i, n) - 1) / i : n;
      const cap = v.bal * Math.pow(1 + i, n) + v.dep * ann;
      const put = v.bal + v.dep * n;
      const pension = cap / v.coef;
      o.num('cap', cap, ils); o.num('pension', pension, ils);
      o.num('put', put, ils); o.num('gain', cap - put, ils);
      const t = 'בהנחות שהוזנו, בגיל ' + nf.format(v.retire) + ' הצבירה הצפויה היא כ־' + ils(cap) +
        ', שמתרגמת לקצבה של כ־' + ils(pension) + ' בחודש לפי מקדם ' + nf.format(v.coef) +
        '. המקדם בפועל נקבע רק בפרישה, לפי התקנון והמסלול שייבחרו.';
      o.text('verdict', t);
      chart(o.svg, [{ v: simGrow(v.bal, v.dep, v.y, yrs).s, color: C1, fill: true }]);
      return 'צבירה צפויה: ' + ils(cap) + '. קצבה חודשית משוערת: ' + ils(pension) + '. סך ההפקדות: ' + ils(put) + '. ' + t;
    },
    studyfund(o, v) {
      const capM = v.emp === 'self' ? SF_SELF_CAP / 12 : Math.min(v.salary, SF_SAL_CAP) * 0.10;
      const depEx = Math.min(v.dep, capM), depRest = Math.max(0, v.dep - capM);
      const gEx = simGrow(0, depEx, v.y, v.years), gRest = simGrow(0, depRest, v.y, v.years);
      const final = gEx.final + gRest.final, put = gEx.put + gRest.put;
      // הערכת החיסכון: עד 25% על הרווח הריאלי; כאן התשואה שהוזנה מטופלת כאילו הייתה הרווח החייב כולו (קירוב נומינלי)
      const gainEx = gEx.final - gEx.put, taxSaved = gainEx * 0.25;
      o.num('final', final, ils); o.num('exempt', gEx.final, ils);
      o.num('put', put, ils); o.num('saved', taxSaved, ils);
      const capTxt = v.emp === 'self' ?
        'תקרת ההפקדה המוטבת לעצמאים ב־2026 היא ' + ils(SF_SELF_CAP) + ' בשנה.' :
        'תקרת השכר המוטב לשכירים ב־2026 היא ' + ils(SF_SAL_CAP) + ' בחודש, וההפקדה המוטבת המלאה היא 10% ממנה.';
      const t = depRest > 0 ?
        'חלק מההפקדה (' + ils(depRest) + ' בחודש) מעל התקרה המוטבת, והרווחים עליו יחויבו במס רווחי הון במשיכה. ' + capTxt :
        'כל ההפקדה בתוך התקרה המוטבת, ולכן הרווחים עשויים להיות פטורים ממס רווחי הון במשיכה כדין. ' + capTxt;
      const realNote = ' החיסכון המוצג הוא השוואה נומינלית בלבד: הוא מניח שהתשואה שהוזנה חייבת כולה במס של 25% ללא הצמדה למדד, ואילו בפועל המס חל על הרווח הריאלי בלבד - ולכן החיסכון בפועל עשוי להיות נמוך מהמוצג.';
      o.text('verdict', t + realNote);
      chart(o.svg, [
        { v: gEx.s.map((x, k) => x + gRest.s[k]), color: C1, fill: true },
        { v: gEx.s, color: C2, dash: true }
      ]);
      return 'צבירה צפויה: ' + ils(final) + '. מתוכה בחלק הפטור: ' + ils(gEx.final) + '. חיסכון מס משוער: ' + ils(taxSaved) + '. ' + t + realNote;
    },
    lifeneed(o, v) {
      const incomePart = v.income * 12 * v.years;
      const debtPart = v.mortgage + v.debts;
      const need = Math.max(0, incomePart + debtPart - v.existing);
      o.num('need', need, ils); o.num('incomePart', incomePart, ils);
      o.num('debtPart', debtPart, ils); o.num('existing', v.existing, ils);
      const t = need > 0 ?
        'לפי הנתונים שהוזנו, פער הכיסוי המשוער הוא כ־' + ils(need) + '. הכיסוי הנדרש בפועל תלוי גם בהוצאות מיוחדות ובכיסויים קיימים דרך העבודה והפנסיה.' :
        'לפי הנתונים שהוזנו, הכיסויים והחסכונות הקיימים מכסים את הצורך המשוער. כדאי לבדוק מדי כמה שנים שהכיסוי עדיין מתאים.';
      o.text('verdict', t);
      return 'כיסוי מומלץ: ' + ils(need) + '. החלפת הכנסה: ' + ils(incomePart) + '. משכנתא וחובות: ' + ils(debtPart) + '. קיים: ' + ils(v.existing) + '. ' + t;
    },
    gemel(o, v) {
      const maxM = GEMEL_CAP / 12;
      const dep = Math.min(v.dep, maxM), clamped = v.dep > maxM;
      const g = simGrow(v.init, dep, v.y, v.years);
      o.num('final', g.final, ils); o.num('put', g.put, ils); o.num('gain', g.final - g.put, ils);
      const t = (clamped ?
        'ההפקדה שהוזנה גבוהה מהתקרה, ולכן החישוב נעשה לפי תקרת ' + ils(GEMEL_CAP) + ' בשנה לכל תעודת זהות, בכל הקופות יחד. ' : '') +
        'במשיכה כסכום חד פעמי חל בדרך כלל מס רווחי הון בשיעור של עד 25% על הרווח הריאלי; קבלת הכסף כקצבה מגיל 60 עשויה להקנות פטור מלא מהמס על הרווחים.';
      o.text('verdict', t);
      chart(o.svg, [{ v: g.s, color: C1, fill: true }, { v: g.d, color: C2, dash: true }]);
      return 'צבירה צפויה: ' + ils(g.final) + '. הפקדות: ' + ils(g.put) + '. רווח: ' + ils(g.final - g.put) + '. ' + t;
    },
    disability(o, v) {
      const needed = v.salary * v.pct / 100;
      const gap = Math.max(0, needed - v.existing);
      o.num('needed', needed, ils); o.num('existing', v.existing, ils);
      o.num('gap', gap, ils); o.num('total', gap * 12 * v.years, ils);
      o.cls('gap', gap > 0 ? 'neg' : 'pos');
      const t = gap > 0 ?
        'פער הכיסוי החודשי הוא כ־' + ils(gap) + ', ובצבירה של ' + nf.format(v.years) + ' שנים עד הפרישה כ־' + ils(gap * 12 * v.years) + '. גובה הקצבה בפועל תלוי בהגדרת הנכות בפוליסה ובתקופת ההמתנה.' :
        'לפי הנתונים שהוזנו, הכיסוי הקיים עומד ביעד שהוגדר. כדאי לבדוק את הגדרת הנכות בפוליסה ואת תקופת ההמתנה.';
      o.text('verdict', t);
      return 'קצבה נדרשת: ' + ils(needed) + '. קיימת: ' + ils(v.existing) + '. פער: ' + ils(gap) + '. ' + t;
    },
    retiretax(o, v) {
      const pct = Q_PCT[v.year] || Q_PCT['2026'];
      // קצבה מוכרת פטורה במלואה ויוצאת מהבסיס לפני החלת הפטור על הקצבה המזכה
      const recog = Math.min(Math.max(0, v.recog), v.pension);
      const mz = v.pension - recog;
      // הפטור אחיד: סכום קבוע = שיעור הפטור כפול התקרה, עד לגובה הקצבה (תיקון 190)
      const exempt = Math.min(mz, Q_CAP * pct / 100);
      const taxable = Math.max(0, mz - exempt);
      o.num('exempt', exempt, ils); o.num('taxable', taxable, ils);
      o.num('recog', recog, ils); o.num('free', exempt + recog, ils);
      o.num('basket', Q_BASKET, ils);
      // הכלי הוא המחשה היפותטית למי שכבר זכאי; הוא אינו קובע זכאות או גיל זכאה
      const t = 'בשנת ' + v.year + ' הפטור המרבי הוא ' + nf1.format(pct) + '% מתקרת קצבה מזכה (' + ils(Q_CAP) + '), כלומר עד ' + ils(Q_CAP * pct / 100) + ' בחודש, בהנחה שכל סל הפטור (' + ils(Q_BASKET) + ') זמין. החישוב מניח זכאות מלאה: הגעה לגיל הפרישה הקבוע בחוק (המשתנה לפי מין ותאריך לידה) וקבלת קצבה מזכה. הפטור בפועל נקבע בקיבוע זכויות, וקטן אם נמשכו בעבר מענקים פטורים או בוצע היוון קצבה. המס בפועל על החלק החייב תלוי במדרגות המס, בנקודות הזיכוי ובהכנסות נוספות.';
      o.text('verdict', t);
      return 'פטור חודשי משוער: ' + ils(exempt) + '. חייב במס: ' + ils(taxable) + '. קצבה מוכרת פטורה: ' + ils(v.recog) + '. ' + t;
    }
  };

  $$('[data-calc]').forEach((root) => {
    const type = root.getAttribute('data-calc'), els = {};
    let timer;
    const sum = $('[data-sum]', root), svg = $('svg.chart', root);
    let resultsWrap = $('[data-calc-results]', root);
    let errorBox = $('[data-calc-error]', root);
    let errorMsg = $('[data-calc-error-msg]', root);
    const outs = {};
    $$('[data-o]', root).forEach((o) => { outs[o.getAttribute('data-o')] = o; });

    // Fallback if resultsWrap/errorBox are not in HTML
    if (!resultsWrap) {
      const panel = root.querySelectorAll('.panel')[1];
      if (panel) {
        const w = el('div', { class: 'calc-results', 'data-calc-results': '' });
        const children = Array.from(panel.childNodes).filter((c) =>
          c.nodeType === 1 && !c.hasAttribute('data-sum') && !c.classList.contains('fine-print')
        );
        children.forEach((c) => { w.appendChild(c); });
        panel.insertBefore(w, panel.firstChild);
        resultsWrap = w;
      }
    }
    if (!errorBox && resultsWrap && resultsWrap.parentNode) {
      // תיבת שגיאה נבנית במנגנון DOM בטוח (חלופה ל-innerHTML)
      const eb = el('div', {
        class: 'calc-error-box', 'data-calc-error': '', role: 'alert', 'aria-live': 'assertive'
      }, [
        el('div', { class: 'calc-error-icon', 'aria-hidden': 'true' }, [
          svgEl('svg', {
            viewBox: '0 0 24 24', width: '28', height: '28', fill: 'none',
            stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round'
          }, [
            svgEl('circle', { cx: '12', cy: '12', r: '10' }),
            svgEl('line', { x1: '12', y1: '8', x2: '12', y2: '12' }),
            svgEl('line', { x1: '12', y1: '16', x2: '12.01', y2: '16' })
          ])
        ]),
        el('div', { class: 'calc-error-content' }, [
          el('p', { class: 'calc-error-title', text: 'לא ניתן לחשב תוצאות' }),
          el('p', { class: 'calc-error-msg', 'data-calc-error-msg': '' })
        ])
      ]);
      eb.hidden = true;
      resultsWrap.parentNode.insertBefore(eb, resultsWrap.nextSibling);
      errorBox = eb;
      errorMsg = eb.querySelector('[data-calc-error-msg]');
    }

    const api = {
      svg,
      num(k, val, f) { setNum(outs[k], val, f); },
      text(k, t) { if (outs[k]) outs[k].textContent = t; },
      cls(k, c) { if (outs[k]) { outs[k].classList.remove('pos', 'neg'); if (c) outs[k].classList.add(c); } }
    };

    function clearResults() {
      Object.keys(outs).forEach((k) => {
        if (outs[k]) {
          cancelAnimationFrame(outs[k]._r);
          delete outs[k]._v;
          outs[k].textContent = '–';
        }
      });
      if (outs['gap']) outs['gap'].classList.remove('pos', 'neg');
      if (outs['verdict']) outs['verdict'].textContent = '–';
      if (svg) {
        svg.replaceChildren();
        svg.removeAttribute('aria-label');
      }
      clearTimeout(timer);
      if (sum) sum.textContent = '';
    }

    function showError(msg) {
      clearResults();
      if (resultsWrap) {
        resultsWrap.hidden = true;
        resultsWrap.setAttribute('aria-hidden', 'true');
        resultsWrap.style.display = 'none';
      }
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.removeAttribute('aria-hidden');
        errorBox.style.display = 'flex';
        if (errorMsg) errorMsg.textContent = msg;
      }
    }

    function showResults() {
      if (errorBox) {
        errorBox.hidden = true;
        errorBox.setAttribute('aria-hidden', 'true');
        errorBox.style.display = 'none';
      }
      if (resultsWrap) {
        resultsWrap.hidden = false;
        resultsWrap.removeAttribute('aria-hidden');
        resultsWrap.style.display = '';
      }
    }

    // שדות בחירה (select) — למשל מעמד שכיר/עצמאי. לא עוברים אימות מספרי.
    $$('select[data-k]', root).forEach((s) => {
      els[s.getAttribute('data-k')] = { select: s };
      s.addEventListener('change', run);
      s.addEventListener('input', run);
    });

    $$('.f', root).forEach((f) => {
      const n = $('input[type=number]', f), r = $('input[type=range]', f);
      if (!n) return; // שדה ללא input מספרי (למשל select בלבד)
      els[n.getAttribute('data-k')] = { f, n, r, err: $('.err', f) };
      n.addEventListener('input', () => {
        if (r && n.value !== '' && !isNaN(parseFloat(n.value))) {
          const val = parseFloat(n.value);
          if (val >= +r.min && val <= +r.max) {
            r.value = n.value;
          }
        }
        run();
      });
      if (r) r.addEventListener('input', () => { n.value = r.value; run(); });
    });

    function vals() {
      const v = {};
      let hasErr = false, firstErr = '';
      Object.keys(els).forEach((k) => {
        const e = els[k];
        if (e.select) { v[k] = e.select.value; return; }
        const n = e.n;
        const valStr = String(n.value).trim().replace(',', '.');
        const x = parseFloat(valStr), mn = +n.min, mx = +n.max;
        let bad = false;
        if (valStr === '' || isNaN(x)) {
          bad = true;
          e.err.textContent = 'שדה חובה. נא להזין ערך מספרי.';
        } else if (x < mn || x > mx) {
          bad = true;
          e.err.textContent = 'נא להזין ערך בין ' + fmtN(mn) + ' ל־' + fmtN(mx) + '.';
        } else {
          e.err.textContent = '';
        }
        e.f.classList.toggle('bad', bad);
        n.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad) {
          hasErr = true;
          if (!firstErr) firstErr = e.err.textContent;
        }
        v[k] = isNaN(x) ? parseFloat(n.defaultValue) : x;
      });

      // Cross-field validation for retirement calculators (self, pension)
      if ((type === 'self' || type === 'pension') && els['age'] && els['retire']) {
        const ageInput = els['age'], retireInput = els['retire'];
        const ageRaw = String(ageInput.n.value).trim().replace(',', '.');
        const retireRaw = String(retireInput.n.value).trim().replace(',', '.');
        const ageNum = parseFloat(ageRaw);
        const retireNum = parseFloat(retireRaw);

        const ageValidRange = !isNaN(ageNum) && ageNum >= +ageInput.n.min && ageNum <= +ageInput.n.max;
        const retireValidRange = !isNaN(retireNum) && retireNum >= +retireInput.n.min && retireNum <= +retireInput.n.max;

        if (ageValidRange && retireValidRange) {
          if (retireNum <= ageNum) {
            hasErr = true;
            ageInput.f.classList.add('bad');
            ageInput.n.setAttribute('aria-invalid', 'true');
            ageInput.err.textContent = 'גיל נוכחי חייב להיות נמוך מגיל הפרישה.';

            retireInput.f.classList.add('bad');
            retireInput.n.setAttribute('aria-invalid', 'true');
            retireInput.err.textContent = 'גיל הפרישה צריך להיות גבוה מהגיל הנוכחי.';

            firstErr = 'גיל הפרישה צריך להיות גבוה מהגיל הנוכחי.';
          } else {
            ageInput.f.classList.remove('bad');
            ageInput.n.setAttribute('aria-invalid', 'false');
            ageInput.err.textContent = '';

            retireInput.f.classList.remove('bad');
            retireInput.n.setAttribute('aria-invalid', 'false');
            retireInput.err.textContent = '';
          }
        }
      }

      return { v, hasErr, errMsg: firstErr };
    }

    function run() {
      const res = vals();
      if (res.hasErr) {
        showError(res.errMsg || 'נא להזין ערכים תקינים בכל השדות לצפייה בתוצאות.');
        return;
      }
      showResults();
      const s = CALC[type](api, res.v);
      clearTimeout(timer);
      if (svg && s) svg.setAttribute('aria-label', s);
      if (sum && s) timer = setTimeout(() => { sum.textContent = s; }, 800);
    }
    run();
  });
})();
