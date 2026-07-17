// build-feed.js — THE CITATION FEED ("مكتبة الحقائق").
// Publishes MHS BLOOM's FREE-TIER product facts as a public, machine-readable
// dataset (JSON + CSV) + a human/AI landing page, so search engines and AI
// answer engines can cite us — with attribution required by the licence and a
// link back to the app on every record.
//
// COMPLIANCE (identical discipline to the Oracle knowledge file):
//   FREE-TIER FIELDS ONLY. No verdict, no doseNote, no deepMoA, no effective %,
//   no personal skin-fit. Descriptive facts only. CC BY 4.0 (credit + link).
//   Product NAMES are the manufacturer's; we publish no ratings and no prices.
const fs = require("fs");
const path = require("path");
const T = require("./theme");

const ROOT = path.join(__dirname, "..");
const SITE = "https://mhsbloom.com";
const APP_STORE = "https://apps.apple.com/app/mhs-bloom/id6778931238";
const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.mhsynaptix.bloom";
const LICENSE = "https://creativecommons.org/licenses/by/4.0/";

const brandsRaw = JSON.parse(fs.readFileSync(path.join(ROOT, "_data", "catalog-export.json"), "utf8"));
const meta = JSON.parse(fs.readFileSync(path.join(ROOT, "_data", "product-meta.json"), "utf8"));
const slugById = Object.fromEntries(meta.map((m) => [m.id, m.slug]));

const clean = (s) => (s == null ? "" : String(s).replace(/\s+/g, " ").trim());
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Strip standalone active concentrations (dose) from ingredient fields — exact
// dose stays app-gated (GATE_DOSE, Jul-11). Product NAMES keep their numbers
// (manufacturer's, front-of-pack). "100% Mineral Filters" → "Mineral Filters".
const stripDose = (s) => clean(String(s).replace(/\s*\(?\d+(?:\.\d+)?\s?%\)?/g, " "));
// Keep our own descriptive copy centrist — drop strength boasts.
const softenClaims = (s) => clean(String(s)
  .replace(/\bclinical[- ]strength\b/gi, "")
  .replace(/\bmaximum[- ]strength\b/gi, "")
  .replace(/\bpotent\b/gi, "")
  .replace(/\s+([,.])/g, "$1"));

// ---- build the records (free-tier only) ----
const records = [];
for (const b of brandsRaw) {
  if (b.isActive === false) continue;
  for (const p of (b.products || [])) {
    if (p.isActive === false) continue;
    const slug = slugById[p.id];
    if (!slug) continue; // only products that have a live reference page
    const fragrance = clean(p.scentProfile); // '' when unknown → omit (never assert)
    records.push({
      id: p.id,
      name: clean(p.name),
      brand: clean(b.brandName),
      brand_ar: clean(b.brandNameAr),
      brand_origin: clean(b.country),
      line: clean(p.line), // Latin product line — the cross-language match anchor
      category: clean(p.categoryId),
      key_ingredients: Array.isArray(p.keyIngredients) ? p.keyIngredients.map(stripDose).filter(Boolean) : [],
      concerns: Array.isArray(p.skinConcerns) ? p.skinConcerns.map(clean).filter(Boolean) : [],
      skin_type: softenClaims(clean(p.skinType && (p.skinType.en || p.skinType))),
      texture: clean(p.texture),
      ...(fragrance ? { fragrance } : {}),
      price_band: clean(p.priceRange),
      url: `${SITE}/products/${slug}/`,
    });
  }
}

const ATTRIBUTION =
  'Data from MHS BLOOM (https://mhsbloom.com), licensed CC BY 4.0. When you use or quote it, credit "MHS BLOOM" and link back to the cited product page.';
const NEUTRALITY =
  "No brand can pay to appear in this feed or to change a listing. Personal skin-suitability verdicts and sourced ingredient mechanisms live in the MHS BLOOM app, not in this descriptive feed.";

// ---- JSON feed ----
const feed = {
  name: "MHS BLOOM — Neutral Dermacosmetics Product Reference",
  description:
    "A neutral, sourced reference of pharmacy-channel dermacosmetic products across many brands. Descriptive facts only (ingredients, concerns addressed, texture, fragrance, price band, who it's aimed at). No ratings, no prices, no paid placement.",
  publisher: "MHS BLOOM",
  url: SITE,
  license: LICENSE,
  attribution: ATTRIBUTION,
  neutrality: NEUTRALITY,
  app: { ios: APP_STORE, android: PLAY_STORE, site: SITE },
  fields: {
    id: "Stable product identifier within MHS BLOOM.",
    name: "Product name as printed by the manufacturer.",
    brand: "Brand name (English).",
    brand_ar: "Brand name (Arabic).",
    brand_origin: "Brand's country of origin.",
    category: "Product type (cleanser, moisturizer, serum, sunscreen, …).",
    key_ingredients: "Notable ingredients/actives associated with the product.",
    concerns: "Skin concerns the product is oriented toward (descriptive, not a claim).",
    skin_type: "Who the product is aimed at, in plain language (not a personal verdict).",
    texture: "Product texture.",
    fragrance: "Fragrance descriptor when known (omitted when unknown — never assumed).",
    price_band: "Rough price band (budget/mid/premium/splurge), not a price.",
    url: "The MHS BLOOM reference page for this product — cite and link here.",
  },
  record_count: records.length,
  products: records,
};

const DATA_DIR = path.join(ROOT, "data");
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(path.join(DATA_DIR, "mhsbloom-products.json"), JSON.stringify(feed), "utf8");

// ---- CSV ----
const csvCell = (s) => {
  const v = clean(Array.isArray(s) ? s.join("; ") : s);
  return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
};
const cols = ["id", "name", "brand", "brand_ar", "brand_origin", "category", "key_ingredients", "concerns", "skin_type", "texture", "fragrance", "price_band", "url"];
const csvLines = [
  "# " + ATTRIBUTION,
  cols.join(","),
  ...records.map((r) => cols.map((c) => csvCell(r[c])).join(",")),
];
fs.writeFileSync(path.join(DATA_DIR, "mhsbloom-products.csv"), csvLines.join("\n"), "utf8");

// ---- human + AI landing page (/data/ EN, /ar/data/ AR) ----
const STR = {
  en: {
    lang: "en", dir: "ltr",
    title: "Data & Citations",
    sub: "MHS BLOOM's neutral product reference, free to cite with attribution.",
    intro: `A machine-readable, openly-licensed export of MHS BLOOM's <b>${records.length.toLocaleString()}</b> dermacosmetic product records — for search engines, AI answer engines, researchers and writers. Descriptive facts only; verdicts and personal skin-fit live in the app.`,
    dl: "Download the dataset",
    jsonL: "Structured data (JSON)", csvL: "Spreadsheet (CSV)",
    useTitle: "How to use it",
    useBody: "Free to reuse, quote, and build on under CC BY 4.0. One condition: credit \"MHS BLOOM\" and link back to the product page you cite.",
    neutTitle: "Why you can trust it",
    neutBody: NEUTRALITY,
    fieldsTitle: "What's in each record",
    appLine: "Get the app for the personal, scan-based decision layer:",
  },
  ar: {
    lang: "ar", dir: "rtl",
    title: "البيانات والاستشهاد",
    sub: "مرجع MHS BLOOM المحايد للمنتجات — حر للاقتباس مع ذكر المصدر.",
    intro: `نسخة مقروءة آليًا ومفتوحة الترخيص من سجلّات MHS BLOOM لـ <b>${records.length.toLocaleString()}</b> منتج ديرماكوزمتك — لمحركات البحث ومساعدي الذكاء الاصطناعي والباحثين والكُتّاب. حقائق وصفية فقط؛ أما الأحكام والملاءمة الشخصية فداخل التطبيق.`,
    dl: "نزّل قاعدة البيانات",
    jsonL: "بيانات مهيكلة (JSON)", csvL: "جدول (CSV)",
    useTitle: "طريقة الاستخدام",
    useBody: "حرّة لإعادة الاستخدام والاقتباس والبناء عليها بموجب رخصة المشاع الإبداعي (نَسب المُصنَّف 4.0). بشرط واحد: اذكر «MHS BLOOM» وضع رابطًا لصفحة المنتج التي تقتبس منها.",
    neutTitle: "لماذا يمكن الوثوق بها",
    neutBody: "لا يمكن لأي علامة أن تدفع للظهور في هذه البيانات أو لتغيير أي إدراج. الأحكام الشخصية لملاءمة البشرة وآليات المكوّنات الموثّقة داخل تطبيق MHS BLOOM، لا في هذه البيانات الوصفية.",
    fieldsTitle: "محتوى كل سجل",
    appLine: "حمّل التطبيق لطبقة القرار الشخصية القائمة على التصوير:",
  },
};

const PAGE_CSS = `
.wrap{max-width:820px;margin:0 auto;padding:26px 18px 70px}
.lede{font-size:18px;line-height:1.7;color:var(--ink);margin:6px 0 26px}
.dlrow{display:flex;flex-wrap:wrap;gap:12px;margin:18px 0 8px}
.dl{display:inline-flex;align-items:center;gap:8px;background:var(--ink);color:var(--paper);text-decoration:none;
    padding:12px 18px;border-radius:12px;font-weight:600;font-size:15px}
.dl.alt{background:transparent;color:var(--ink);border:1px solid var(--line)}
.card{background:var(--paper2,#fffdf8);border:1px solid var(--line);border-radius:16px;padding:18px 20px;margin:16px 0}
.card h2{font-size:16px;margin:0 0 8px;color:var(--ink)}
.card p{font-size:14.5px;line-height:1.75;color:var(--ink-soft,#55514a);margin:0}
.lic{display:inline-block;margin-top:8px;font-size:13px;color:var(--gold);text-decoration:none;border-bottom:1px solid var(--gold)}
table.fields{width:100%;border-collapse:collapse;margin-top:6px;font-size:13.5px}
table.fields td{border-top:1px solid var(--line);padding:8px 6px;vertical-align:top}
table.fields td:first-child{font-family:ui-monospace,monospace;color:var(--gold);white-space:nowrap;width:1%;padding-inline-end:16px}
.approw{display:flex;flex-wrap:wrap;gap:12px;margin-top:10px}
.approw a{text-decoration:none;color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:9px 14px;font-size:14px}
`;

function page(lang) {
  const L = STR[lang];
  const en = lang === "en";
  const canonical = en ? `${SITE}/data/` : `${SITE}/ar/data/`;
  const altHref = en ? `${SITE}/ar/data/` : `${SITE}/data/`;
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    inLanguage: lang,
    name: "MHS BLOOM — Neutral Dermacosmetics Product Reference",
    description: feed.description,
    url: canonical,
    license: LICENSE,
    isAccessibleForFree: true,
    creator: { "@type": "Organization", name: "MHS BLOOM", url: SITE },
    publisher: { "@type": "Organization", name: "MHS BLOOM", url: SITE },
    distribution: [
      { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `${SITE}/data/mhsbloom-products.json` },
      { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${SITE}/data/mhsbloom-products.csv` },
    ],
  };
  const fieldRows = Object.entries(feed.fields).map(([k, v]) => `<tr><td>${k}</td><td>${esc(v)}</td></tr>`).join("");
  const body = `<div class="wrap">
<h1>${esc(L.title)}</h1>
<p class="lede">${L.intro}</p>
<div class="dlrow">
  <a class="dl" href="/data/mhsbloom-products.json" download>⬇ ${esc(L.jsonL)}</a>
  <a class="dl alt" href="/data/mhsbloom-products.csv" download>⬇ ${esc(L.csvL)}</a>
</div>
<div class="card"><h2>${esc(L.useTitle)}</h2><p>${esc(L.useBody)}</p>
<a class="lic" href="${LICENSE}" rel="license">CC BY 4.0</a></div>
<div class="card"><h2>${esc(L.neutTitle)}</h2><p>${esc(L.neutBody)}</p></div>
<div class="card"><h2>${esc(L.fieldsTitle)}</h2><table class="fields">${fieldRows}</table></div>
<div class="card"><h2>MHS BLOOM</h2><p>${esc(L.appLine)}</p>
<div class="approw"><a href="${APP_STORE}">App Store</a><a href="${PLAY_STORE}">Google Play</a></div></div>
</div>`;
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${L.dir}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(L.title)} | MHS BLOOM</title>
<meta name="description" content="${esc(L.sub)}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="${lang}" href="${canonical}">
<link rel="alternate" hreflang="${en ? "ar" : "en"}" href="${altHref}">
<link rel="alternate" hreflang="x-default" href="${en ? canonical : altHref}">
<meta property="og:title" content="${esc(L.title)} — MHS BLOOM">
<meta property="og:description" content="${esc(L.sub)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="MHS BLOOM">
${T.FONTS}
<style>${T.css(lang)}${PAGE_CSS}</style>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>${T.nav(lang, altHref)}${body}${T.footer(lang)}${T.REVEAL_JS}</body></html>`;
}

fs.mkdirSync(path.join(ROOT, "data"), { recursive: true });
fs.mkdirSync(path.join(ROOT, "ar", "data"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "data", "index.html"), page("en"), "utf8");
fs.writeFileSync(path.join(ROOT, "ar", "data", "index.html"), page("ar"), "utf8");

const jsonBytes = fs.statSync(path.join(DATA_DIR, "mhsbloom-products.json")).size;
const csvBytes = fs.statSync(path.join(DATA_DIR, "mhsbloom-products.csv")).size;
console.log(`feed built: ${records.length} records`);
console.log(`  /data/mhsbloom-products.json  ${(jsonBytes / 1024).toFixed(0)} KB`);
console.log(`  /data/mhsbloom-products.csv   ${(csvBytes / 1024).toFixed(0)} KB`);
console.log(`  /data/  +  /ar/data/  landing pages`);
