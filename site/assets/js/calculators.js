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

    $$('.f', root).forEach((f) => {
      const n = $('input[type=number]', f), r = $('input[type=range]', f);
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
        const e = els[k], n = e.n;
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

      // Cross-field validation for retirement calculator (self)
      if (type === 'self' && els['age'] && els['retire']) {
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
