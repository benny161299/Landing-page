# תוכנית עבודה: נגישות · קידום אתרים · FormSubmit
**אתר:** רחל לסקר – סוכנת פנסיונית  
**תאריך:** אוקטובר 2026  
**סטטוס:** ✅ FormSubmit בוצע (א2–א5, א7) | ✅ לוגו ומיתוג הוטמעו | ✅ גוש ב׳ נגישות (ב1–ב6) | ✅ גוש ג׳ SEO (ג2–ג7) | ✅ גוש ד׳ מיתוג ו-PWA (ד1–ד2) | ✅ כל 29 הסעיפים המקצועיים הוטמעו (0 סימוני todo נותרו באתר) | ⏳ ממתין: ג1 (דומיין סופי להחלפה לפני עלייה לאוויר)

---

## 📋 סיכום ממצאים – מה יש ומה חסר

### ✅ מה כבר קיים ועובד טוב
- `lang="he" dir="rtl"` על `<html>`
- דף נגישות (`/accessibility-statement/`) עם תוכן מלא
- Skip-link (`דלגו לתוכן הראשי`) בכל עמוד
- `aria-label` על ניווטים ראשיים
- `aria-expanded` / `aria-controls` בתפריט ותת-תפריטים
- `aria-live="polite"` על שאלון ועל שדה status בטופס
- `aria-required="true"` ו-`aria-describedby` על שדות טופס
- `aria-invalid` דינמי בוולידציה (app.js)
- `:focus-visible` עם outline ברור
- כותרות היררכיות (H1→H2→H3) בכל הדפים
- `alt` על כל התמונות
- Schema.org מפורט (InsuranceAgency, FAQ, BreadcrumbList)
- Open Graph + Twitter Card
- `sitemap.xml` + `robots.txt`
- `canonical` על כל עמוד
- `preconnect` לגופנים
- נגישות מקלדת בשאלון (focus לאחר מעבר שלב)
- `fetchpriority="high"` על תמונת ה-Hero
- `loading="lazy"` על תמונות פנימיות

---

### ❌ מה חסר / בעיות שיש לתקן

#### א. נגישות (Accessibility – WCAG 2.1 AA / ת"י 5568)
1. **תפריט מובייל** – כפתור `תפריט` חסר `aria-label` תיאורי (טקסט "תפריט" תקין אך צריך לוודא שהצבע עומד ב-4.5:1 כשהוא לבן על רקע)
2. **כפתורי WhatsApp** בסרגל התחתון – חסר `aria-label` עם תיאור יעד (`rel="noopener"` קיים אך חסר `aria-label="פתיחת וואטסאפ בחלון חדש"`)
3. **טופס יצירת קשר** – `<select>` חסר `aria-describedby` (לשיקול תוספת הסבר)
4. **SVG בגרפים** – חסר `role="img"` ו-`aria-label` על ה-`<svg>` עצמו (בדפי הכלים)
5. **`<details>`/`<summary>` בשאלות נפוצות** – חסר `aria-expanded` מפורש (דפדפנים ישנים לא מחשיפים אותו אוטומטית)
6. **כפתורי "לפרטים" בשירותים** – הלינק עוטף H3, אך `<span class="go">לפרטים</span>` לא ברור ל-screen reader בלי הקשר (לשקול `aria-label` על ה-anchor)
7. **צבע `--muted` על רקע `--bg`** – יש לבדוק ניגודיות (ייתכן שמתחת ל-4.5:1 בחלק מהמצבים)
8. **`<noscript>`** – קיים בשני מקומות, אך הטופס שמופיע כ-`novalidate` מבלבל (הסיבה: הוולידציה ב-JS, זה תקין)
9. **הצהרת נגישות** – חסרה תאריך עדכון עתידי ואמצעי פנייה נגיש (קיים חלקית אבל חסרה כתובת דוא"ל כקישור ברור)
10. **`lang` על מילות לועזית** – מינימלי; "L-00139348" וקידומות בינלאומיות לא מסומנות (שוליים)

#### ב. קידום אתרים (SEO)
1. **`sitemap.xml`** – `example.co.il` במקום הדומיין האמיתי (יש להחליף לפני העלאה)
2. **`canonical`** – כל הדפים מפנים ל-`example.co.il` (חובה לעדכן לדומיין האמיתי)
3. **`robots.txt`** – מפנה ל-`example.co.il` (לעדכן)
4. **OG image** – ה-URL מפנה ל-`example.co.il`; אין ממדי תמונה מפורשים (`og:image:width`, `og:image:height`)
5. **`sitemap.xml`** – חסר `<priority>` ו-`<changefreq>` (לא חובה אך מומלץ)
6. **`sitemap.xml`** – חסר עמוד הבית (`/`) בראש הרשימה (קיים בסוף – לשים בראש עם priority גבוה)
7. **Schema.org** – חסר `priceRange` בסכמת InsuranceAgency (מועיל ל-rich results)
8. **מטא robots** – כל הדפים `index, follow`; דפי legal (תנאי שימוש, מדיניות פרטיות) ראוי לשקול `noindex` (אופציונלי)
9. **Twitter meta** – חסר `twitter:title` ו-`twitter:description` מפורשים (לא חובה אבל מומלץ)
10. **`hreflang`** – האתר בעברית בלבד, אין צורך דחוף אך יש לוודא שאין גרסה אנגלית ללא תיוג

#### ג. חיבור טופס ל-FormSubmit
1. **הטופס הנוכחי** שולח לוואטסאפ דרך JavaScript – יש לשנות לשליחה ל-FormSubmit (POST)
2. **אין `action` על הטופס** – הטופס עם `method="post"` אבל ללא `action` (הטיפול ב-JS בלבד)
3. **יש לחבר** עם הגדרות: `_next`, `_subject`, `_autoresponse`, `_honey`, `_captcha`

---

## 🗂️ תוכנית עבודה – שלבים מפורטים

---

### 🔴 גוש א׳ – FormSubmit (עדיפות ראשונה)

#### שלב א1 – הכנה: מה צריך לדעת לפני הכל
- **מהו FormSubmit?** שירות שמקבל POST מטופס HTML ושולח אותו למייל שלך – ללא שרת, ללא PHP
- **אימות:** בפעם הראשונה שטופס נשלח, FormSubmit ישלח מייל אימות לכתובת שבה משתמשים → יש ללחוץ "Confirm"
- **הכתובת בטופס:** `https://formsubmit.co/YOUR_EMAIL`

#### שלב א2 – שינוי `<form>` ב-`index.html`
**קובץ:** `site/index.html` שורה 156

**לפני:**
```html
<form class="card lead" id="home-form" method="post" novalidate style="color:var(--ink)" aria-label="השארת פרטים">
```

**אחרי:**
```html
<form class="card lead" id="home-form"
      action="https://formsubmit.co/rl0548479120@gmail.com"
      method="POST"
      novalidate
      style="color:var(--ink)"
      aria-label="השארת פרטים">
```

#### שלב א3 – הוספת שדות hidden לטופס ב-`index.html`
**יש להוסיף לפני `</form>`:**
```html
<!-- FormSubmit configuration -->
<input type="hidden" name="_subject" value="פנייה חדשה מהאתר – רחל לסקר">
<input type="hidden" name="_next" value="https://www.YOUR-DOMAIN.co.il/thank-you/">
<input type="hidden" name="_autoresponse" value="קיבלתי את פנייתך! רחל לסקר תחזור אליך בהקדם.">
<input type="hidden" name="_template" value="table">
<input type="text" name="_honey" style="display:none" tabindex="-1" aria-hidden="true">
<input type="hidden" name="_captcha" value="true">
```

> **הערה:** להחליף `YOUR-DOMAIN` בדומיין האמיתי של האתר.

#### שלב א4 – יצירת עמוד תודה `thank-you/index.html`
**קובץ חדש:** `site/thank-you/index.html`

יצור עמוד תודה פשוט עם:
- הודעה: "תודה! קיבלנו את פנייתך ורחל תחזור אליך בהקדם."
- כפתור "חזרה לדף הבית"
- אותו עיצוב כמו שאר האתר (header, footer, skip-link)
- כותרת: `תודה על פנייתך | רחל לסקר`
- `meta robots: noindex` (לא צריך שהעמוד יופיע בגוגל)

#### שלב א5 – עדכון הלוגיקה ב-`app.js`
**קובץ:** `site/assets/app.js` שורות 69-99

הטופס נשלח כרגע רק לוואטסאפ. לאחר הוספת FormSubmit, הלוגיקה תשתנה:

**אפשרות א (פשוטה):** הסרת `e.preventDefault()` וטיפול רגיל בשליחה HTML – FormSubmit יקבל את הנתונים ויעביר לאימייל. ה-JS ישמש רק לוולידציה לפני שליחה.

**אפשרות ב (AJAX):** שליחה ל-`https://formsubmit.co/ajax/EMAIL` עם fetch, תוצאה: המשתמש נשאר בעמוד.

> **המלצה:** אפשרות א – פשוטה ואמינה יותר. עמוד התודה ידאג לחוויית משתמש.

**שינוי ב-app.js (שורה 72):**
```javascript
// לפני:
form.addEventListener('submit', function (e) {
  e.preventDefault();
  // ... validation ...
  window.open(url, '_blank', 'noopener'); // whatsapp

// אחרי:
form.addEventListener('submit', function (e) {
  // עושים validation; אם יש שגיאות – e.preventDefault()
  var hasErrors = badName || badPhone || badOk;
  if (hasErrors) {
    e.preventDefault();
    // ... existing error handling ...
    return;
  }
  // אם הכל תקין – הטופס נשלח ל-FormSubmit (ללא preventDefault)
  // (הסרת שורות שפותחות WhatsApp)
});
```

#### שלב א6 – אימות FormSubmit (לאחר עלייה לאוויר)
1. להעלות את האתר לשרת
2. למלא ולשלוח את הטופס פעם אחת
3. לבדוק את תיבת הדואר של `rl0548479120@gmail.com`
4. ללחוץ "Confirm" במייל שיגיע מ-FormSubmit
5. לשלוח שוב – לוודא שמייל מגיע

#### שלב א7 – הוספת FormSubmit לטפסים נוספים (אם יש)
- לבדוק בדפי `/about/`, `/pension/`, `/beit-shemesh/` האם יש טפסים נוספים עם class `lead`
- לחזור על שלבים א2-א5 לכל טופס

---

### 🟡 גוש ב׳ – נגישות (WCAG 2.1 AA / ת"י 5568)

#### שלב ב1 – תיקון aria-label על כפתורי WhatsApp בסרגל התחתון
**קובץ:** כל קובץ HTML שמכיל את `<nav class="bar">`  
**שינוי:**
```html
<!-- לפני: -->
<a class="btn btn-primary" href="https://wa.me/972559535605" rel="noopener">וואטסאפ</a>

<!-- אחרי: -->
<a class="btn btn-primary" href="https://wa.me/972559535605" rel="noopener"
   aria-label="שליחת הודעת וואטסאפ לרחל לסקר (נפתח בחלון חדש)" target="_blank">וואטסאפ</a>
```

#### שלב ב2 – aria-label על קישורי שירותים (ה-"go" cards)
**קובץ:** `site/index.html` שורה 89  
**הבעיה:** כל `<a href="/pension/">` מכיל H3 + P + span "לפרטים" – קורא המסך יקרא הכל ביחד  
**שינוי:** להוסיף `aria-label` ספציפי לכל קישור:
```html
<!-- לפני: -->
<a href="/pension/"><h3>בדיקת פנסיה</h3><p>...</p><span class="go">לפרטים</span></a>

<!-- אחרי: -->
<a href="/pension/" aria-label="בדיקת פנסיה – לפרטים נוספים"><h3>בדיקת פנסיה</h3><p>...</p><span class="go" aria-hidden="true">לפרטים</span></a>
```

#### שלב ב3 – aria-label על SVG גרפים (דפי כלים)
**קבצים:** `site/tools/management-fees/index.html`, `compound-interest`, `self-employed-pension`  
**שינוי:** להוסיף על כל `<svg class="chart">`:
```html
<svg class="chart" role="img" aria-label="גרף השוואה" aria-describedby="chart-desc-[id]">
  <title id="chart-desc-[id]">תיאור הגרף יוחלף דינמית על ידי JavaScript</title>
  ...
</svg>
```
ב-`app.js` – לעדכן `aria-label` דינמית לאחר חישוב:
```javascript
if (svg) {
  svg.setAttribute('aria-label', s); // s = תיאור הטקסטואלי שכבר מחושב
}
```

#### שלב ב4 – בדיקת ניגודיות צבעים
**צבעים לבדוק (כלי: WebAIM Contrast Checker):**
| צבע טקסט | רקע | יחס נדרש | לבדוק |
|---|---|---|---|
| `--muted` (#475A5D) | `--bg` (#F2F5F3) | 4.5:1 | ✅ בדוק |
| `--muted` | dark mode `--bg` (#0C1A1D) | 4.5:1 | ✅ בדוק |
| `--band-muted` (#B7CBC8) | `--band` (#14393D) | 4.5:1 | ✅ בדוק |
| `--brass` (#A97B3C) | `--bg` (#F2F5F3) | 3:1 (לאייקונים) | בדוק |

**כלי מומלץ:** https://webaim.org/resources/contrastchecker/

#### שלב ב5 – תוספת `autocomplete` לשדה נושא (select)
**קובץ:** `index.html` שורה 162  
```html
<!-- הוספת autocomplete ו-aria-describedby -->
<select id="home-topic" name="topic" autocomplete="off" aria-label="בחרו נושא לפנייה">
```

#### שלב ב6 – הוספת `role="status"` לאחר שליחת טופס
**כבר קיים** `<p class="status" role="status" aria-live="polite">` – לוודא שהוא נותר ב-DOM גם בעת שגיאה.

#### שלב ב7 – בדיקת קוד עם כלים אוטומטיים
**כלים:**
1. **axe DevTools** (תוסף Chrome/Firefox) – להריץ על כל עמוד
2. **WAVE** (https://wave.webaim.org/) – להעלות URL לאחר פרסום
3. **Lighthouse Accessibility** (Chrome DevTools → Lighthouse) – יעד: ציון 90+

---

### 🟢 גוש ג׳ – קידום אתרים (SEO)

#### שלב ג1 – עדכון הדומיין (קריטי!)
**חובה לבצע לפני העלייה לאוויר:**

יש לחפש ולהחליף `example.co.il` בדומיין האמיתי בכל הקבצים:
```powershell
# בדוק אילו קבצים מכילים את הדומיין הישן:
Get-ChildItem -Path ".\site" -Recurse -Filter "*.html" | 
  Select-String -Pattern "example.co.il" | 
  Select-Object Filename, LineNumber
```

**קבצים שיש לעדכן:**
- `site/index.html` – canonical, OG, Schema
- כל `site/*/index.html` – canonical, OG, Schema
- `site/sitemap.xml` – כל ה-URLs
- `site/robots.txt` – URL של ה-sitemap

#### שלב ג2 – שיפור `sitemap.xml`
**קובץ:** `site/sitemap.xml`

**שינויים:**
1. הזזת עמוד הבית לראש הרשימה עם `<priority>1.0</priority>`
2. הוספת `<changefreq>` ו-`<priority>` לכל URL

**לפני:**
```xml
<url><loc>https://www.example.co.il/pension/</loc><lastmod>2026-10-19</lastmod></url>
```

**אחרי:**
```xml
<url>
  <loc>https://www.DOMAIN.co.il/</loc>
  <lastmod>2026-10-22</lastmod>
  <changefreq>monthly</changefreq>
  <priority>1.0</priority>
</url>
<url>
  <loc>https://www.DOMAIN.co.il/pension/</loc>
  <lastmod>2026-10-22</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
<!-- שאר דפי שירותים: priority 0.8 -->
<!-- דפי כלים ובלוג: priority 0.6 -->
<!-- דפי legal: priority 0.3 -->
```

#### שלב ג3 – הוספת `twitter:title` ו-`twitter:description`
**קבצים:** כל קובצי HTML  
**יש להוסיף לאחר `twitter:card`:**
```html
<meta name="twitter:title" content="[אותו תוכן כמו og:title]">
<meta name="twitter:description" content="[אותו תוכן כמו og:description]">
<meta name="twitter:image" content="[אותו URL כמו og:image]">
```

#### שלב ג4 – הוספת ממדי OG image
**קבצים:** כל קובצי HTML  
**יש להוסיף:**
```html
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/jpeg">
```
> **הערה:** לוודא שהתמונה `portrait.jpg` מוכנה בגודל 1200×630 (OG standard). כרגע היא 400×400 – יש ליצור גרסה מתאימה.

#### שלב ג5 – Schema.org: הוספת `priceRange`
**קבצים:** כל קובצי HTML  
**יש להוסיף ל-InsuranceAgency schema:**
```json
"priceRange": "ללא עלות לשיחה ראשונה"
```

#### שלב ג6 – שקילת `noindex` לדפי legal
**קבצים:** `privacy-policy/`, `terms-of-use/`, `accessibility-statement/`  
**שקול לשנות:**
```html
<meta name="robots" content="noindex, follow">
```
> **שיקול:** אם רוצים שגוגל יציג את דפי הנגישות בתוצאות – להשאיר `index`.

#### שלב ג7 – הוספת `thank-you` ל-sitemap (לא!)
עמוד התודה **לא** צריך להיות בסיטמפ (הוא `noindex`).  
לוודא שמוסיפים `<meta name="robots" content="noindex">` לעמוד התודה.

#### שלב ג8 – Google Search Console
לאחר פרסום האתר:
1. להיכנס ל-https://search.google.com/search-console/
2. להוסיף את הדומיין
3. לאמת בעלות (DNS / HTML tag)
4. להגיש את ה-sitemap: `https://www.DOMAIN.co.il/sitemap.xml`
5. לבדוש דוחות Coverage, Core Web Vitals

---

### 🔵 גוש ד׳ – שיפורים נוספים מומלצים

#### שלב ד1 – OG image מותאמת (1200×630)
- ליצור גרסה של תמונת הפורטרט בפורמט 1200×630 המתאים ל-Facebook/WhatsApp shares
- לשמור כ-`site/assets/og-image.jpg`
- לעדכן את כל קובצי ה-`og:image`

#### שלב ד2 – `apple-touch-icon` ו-`manifest`
```html
<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
```
**`manifest.json`:**
```json
{
  "name": "רחל לסקר – סוכנת פנסיונית",
  "short_name": "רחל לסקר",
  "start_url": "/",
  "display": "browser",
  "background_color": "#F2F5F3",
  "theme_color": "#14393D",
  "lang": "he",
  "dir": "rtl"
}
```

#### שלב ד3 – אימות Schema.org
לאחר פרסום, לבדוק ב:
- https://validator.schema.org/
- https://search.google.com/test/rich-results

---

## ✅ רשימת בדיקות לפני העלייה לאוויר

```
☑ א1 – הגדרת FormSubmit עודכנה למייל הרשמי (rl0548479120@gmail.com) בכל 18 הטפסים וב-app.js
☑ א2 – action="" על הטופס בindex.html
☑ א3 – שדות hidden של FormSubmit
☑ א4 – עמוד thank-you נוצר
☑ א5 – app.js מעודכן (validation בלבד, לא WhatsApp)
□ א6 – אימות FormSubmit לאחר עלייה
☑ א7 – טפסים נוספים (אם יש) – כל 18 הטפסים חוברו

☑ ב1 – aria-label על כפתורי WhatsApp בסרגל
☑ ב2 – aria-label על כרטיסיות שירותים
☑ ב3 – aria-label/role על SVG גרפים
☑ ב4 – בדיקת ניגודיות (WebAIM) – אומת
☑ ב5 – autocomplete/aria על select – הוטמע בכל 18 הטפסים
☑ ב6 – לוודא role="status" נשמר – קיים ותקין בכל הטפסים
□ ב7 – axe DevTools + WAVE + Lighthouse (לאחר העלאה לרשת)

□ ג1 – החלפת example.co.il בדומיין האמיתי (לפני עלייה לאוויר)
☑ ג2 – שיפור sitemap.xml עם priority + changefreq + דף הבית בראש
☑ ג3 – twitter meta tags בכל הדפים
☑ ג4 – og:image:width/height/type בכל הדפים
☑ ג5 – priceRange ב-Schema בכל הדפים
☑ ג6 – noindex, follow לדפי legal (תנאי שימוש ומדיניות פרטיות)
☑ ג7 – thank-you ← noindex
□ ג8 – Google Search Console + הגשת sitemap (לאחר העלאה לרשת)

☑ ד1 – OG image 1200×630 (נוצר og-image.jpg והוטמע בכל העמודים)
☑ ד2 – apple-touch-icon + manifest.json (נוצר והוטמע בכל 22 העמודים)
□ ד3 – Schema validator (לאחר העלאה לרשת)
```

---

## 🚨 סדר עדיפויות להתחלה

| # | משימה | חשיבות | קובץ |
|---|---|---|---|
| 1 | החלפת `example.co.il` בדומיין אמיתי | 🔴 קריטי | כל הקבצים |
| 2 | חיבור טופס ל-FormSubmit | 🔴 קריטי | index.html + app.js |
| 3 | יצירת עמוד thank-you | 🔴 קריטי | thank-you/index.html |
| 4 | aria-label על לינקים/כפתורים | 🟡 חשוב | כל HTML |
| 5 | SVG accessibility | 🟡 חשוב | tools/*.html + app.js |
| 6 | Twitter meta + OG dimensions | 🟢 מומלץ | כל HTML |
| 7 | sitemap priority/changefreq | 🟢 מומלץ | sitemap.xml |
| 8 – | Google Search Console | 🟢 לאחר פרסום | – |

---

*הופק על ידי Antigravity AI · אוקטובר 2026*
