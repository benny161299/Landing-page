#!/usr/bin/env node
/* build.js — שכבת תבניות לאתר רחל לסקר.
   מרכז את ה-header וה-footer המשותפים ב-src/partials/ ומרכיב את src/pages/
   לתוך site/ (פלט סטטי זהה, ללא תלויות). הרצה: node build.js
   בדיקת שוויון: git diff על site/ אמור להישאר ריק אחרי בילד תקין. */
'use strict';

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const PAGES = path.join(SRC, 'pages');
const OUT = path.join(__dirname, 'site');

/* aria-current בניווט לפי עמוד — וריאציה מכוונת, יש לשמר:
   עמוד סעיף → "page"; עמודי משנה של כלים/מגזין → "true" על הקישור הראשי. */
const CURRENT = {
  'pension': ['/pension/', 'page'],
  'life-insurance': ['/life-insurance/', 'page'],
  'health-insurance': ['/health-insurance/', 'page'],
  'study-fund': ['/study-fund/', 'page'],
  'investment-gemel': ['/investment-gemel/', 'page'],
  'self-employed': ['/self-employed/', 'page'],
  'retirement-planning': ['/retirement-planning/', 'page'],
  'about': ['/about/', 'page'],
  'tools': ['/tools/', 'page'],
  'tools/compound-interest': ['/tools/', 'true'],
  'tools/management-fees': ['/tools/', 'true'],
  'tools/self-employed-pension': ['/tools/', 'true'],
  'blog': ['/blog/', 'page'],
  'blog/halachic-tracks': ['/blog/', 'true'],
  'blog/how-to-check-management-fees': ['/blog/', 'true'],
  'blog/self-employed-pension-questions': ['/blog/', 'true'],
  'blog/what-is-pension-clearinghouse': ['/blog/', 'true'],
};

function pageId(rel) {
  return rel.replace(/(^|\/)index\.html$/, '$1').replace(/\/$/, '').replace(/\.html$/, '');
}

function applyCurrent(content, id) {
  const cur = CURRENT[id] || null;
  return content.replace(/\{\{current:([^}]+)\}\}/g, (m, href) =>
    cur && cur[0] === href ? ` aria-current="${cur[1]}"` : ''
  );
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.name.endsWith('.html')) yield p;
  }
}

const written = new Set();
let built = 0;
for (const pagePath of walk(PAGES)) {
  const rel = path.relative(PAGES, pagePath).split(path.sep).join('/');
  const id = pageId(rel);
  let html = fs.readFileSync(pagePath, 'utf8');

  const includes = html.match(/<!-- @include [\w/.-]+ -->/g) || [];
  html = html.replace(/^[ \t]*<!-- @include ([\w/.-]+) -->[ \t]*$/gm, (m, partial) => {
    const partialPath = path.join(SRC, partial);
    if (!fs.existsSync(partialPath)) throw new Error(`${rel}: partial not found: ${partial}`);
    let content = fs.readFileSync(partialPath, 'utf8');
    if (partial === 'partials/header.html') content = applyCurrent(content, id);
    return content.replace(/\n$/, ''); // שורת הסימון עצמה מספקת את ירידת השורה
  });
  if (html.includes('{{current:')) throw new Error(`${rel}: unresolved token left`);
  if (CURRENT[id] && !html.includes('aria-current="' + CURRENT[id][1] + '"')) {
    throw new Error(`${rel}: expected aria-current not applied`);
  }

  const outPath = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  written.add(rel);
  built++;
}

// ניקוי פלט HTML יתום: קובץ HTML ב-site/ ללא מקור ב-src/pages נמחק
// (site/ הוא פלט מחולל; כל קובץ אחר — תמונות, css, js, robots — לא נוגע)
let removed = 0;
for (const outFile of walk(OUT)) {
  const rel = path.relative(OUT, outFile).split(path.sep).join('/');
  if (!written.has(rel)) {
    fs.rmSync(outFile);
    console.log(`Removed stale output: ${rel}`);
    removed++;
  }
}

console.log(`Built ${built} pages into site/${removed ? `, removed ${removed} stale` : ''}.`);
