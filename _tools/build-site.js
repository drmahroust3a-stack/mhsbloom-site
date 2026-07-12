// MHS BLOOM — static site generator (Phase A).
// Generates bilingual (EN/AR) ingredient pages from the sourced ingredients dataset.
// FREE/PRO boundary is enforced here: educational layer is published; the dose-precise
// deep-dive + product verdicts stay in the app (teased). Toggle GATE_DEEPDIVE to change.
//
// Usage:
//   node _tools/build-site.js            -> build ALL ingredient pages into /ingredients + /ar
//   node _tools/build-site.js --sample   -> build only SAMPLE_SLUGS (for format review)

const fs = require("fs");
const T = require("./theme");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ING = JSON.parse(fs.readFileSync("C:/Users/drmah/MHS-BLOOM-old/_docs/ingredients_v25_ALL.json", "utf8"));

const SITE = "https://mhsbloom.com";
const APP_STORE = "https://apps.apple.com/app/mhs-bloom/id6778931238";
const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.mhsynaptix.bloom";
// Publishing boundary (founder decision Jul 11, "middle"):
//   PUBLISH plain-language mechanism (deepMoA) — commodity education, strengthens citations.
//   GATE exact dose thresholds (doseNote / effective %) + personal skin-fit — the PRO "dose-aware" value.
const PUBLISH_MECHANISM = true; // deepMoA shown on the public page
const GATE_DOSE = true;         // doseNote + effective % stay in the app
const SAMPLE_SLUGS = ["niacinamide", "retinal"];

const args = process.argv.slice(2);
const sampleOnly = args.includes("--sample");

const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const list = (arr) => (Array.isArray(arr) ? arr : []).filter(Boolean);

// ---------- shared CSS (inlined; no external requests) ----------
const CSS = `
:root{--cream:#FAF6F2;--card:#FFF;--ink:#2B2626;--muted:#8A7F7B;--rose:#B85C68;--rose-deep:#9E4552;--rose-soft:#F3E2E4;--gold:#B99256;--line:#EADFD8;--lock:#7A4E5A;--ok:#4E7A5A;--ok-soft:#E4EFE7;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:"Segoe UI",-apple-system,Tahoma,Arial,sans-serif;background:var(--cream);color:var(--ink);line-height:1.8;font-size:16px;}
.wrap{max-width:760px;margin:0 auto;padding:22px 18px 80px;}
.top{display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;border-bottom:1px solid var(--line);margin-bottom:22px;font-size:13px;}
.brand{font-weight:700;letter-spacing:2px;color:var(--rose-deep);text-decoration:none;}
.brand span{color:var(--gold);}
.langlink{color:var(--muted);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:4px 12px;}
.langlink:hover{border-color:var(--rose);}
.crumb{font-size:12.5px;color:var(--muted);margin-bottom:10px;}
.crumb a{color:var(--muted);text-decoration:none;}
h1{font-size:29px;color:var(--rose-deep);line-height:1.35;margin-bottom:4px;}
.sub{color:var(--muted);font-size:15px;margin-bottom:26px;}
h2{font-size:20px;color:var(--rose-deep);margin:30px 0 10px;padding-inline-start:11px;border-inline-start:4px solid var(--rose);}
p{margin-bottom:12px;}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 4px;}
.chip{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:5px 13px;font-size:13.5px;}
.chip.good{background:var(--ok-soft);border-color:#CBE0D1;color:var(--ok);}
.chip.avoid{background:var(--rose-soft);border-color:#E5C9CD;color:var(--rose-deep);}
.safety{background:#FBF8F5;border:1px solid var(--line);border-radius:14px;padding:14px 18px;font-size:14.5px;margin:12px 0;}
.gate{background:linear-gradient(180deg,#fff,#FBF3EE);border:1px solid var(--rose-soft);border-radius:16px;padding:20px 22px;margin:20px 0;text-align:center;}
.gate .lock{font-size:13px;color:var(--lock);font-weight:600;letter-spacing:1px;}
.gate h3{font-size:17px;color:var(--rose-deep);margin:6px 0 8px;}
.gate p{font-size:14px;color:var(--muted);margin-bottom:14px;}
.cta{display:inline-flex;gap:10px;flex-wrap:wrap;justify-content:center;}
.cta a{background:var(--rose);color:#fff;text-decoration:none;border-radius:12px;padding:11px 20px;font-size:14.5px;font-weight:600;}
.cta a.alt{background:var(--card);color:var(--rose-deep);border:1px solid var(--rose);}
.cta a:hover{background:var(--rose-deep);}
.sources{font-size:13px;color:var(--muted);}
.sources ol{padding-inline-start:20px;}
.sources li{margin-bottom:7px;}
.sources a{color:var(--rose-deep);}
.disc{font-size:12.5px;color:var(--muted);font-style:italic;border-top:1px solid var(--line);margin-top:26px;padding-top:14px;}
footer{text-align:center;font-size:12px;color:var(--muted);margin-top:30px;}
footer a{color:var(--muted);}
`;

function page({ lang, dir, title, desc, canonical, altHref, altLang, jsonld, body }) {
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="${lang}" href="${canonical}">
<link rel="alternate" hreflang="${altLang}" href="${altHref}">
<link rel="alternate" hreflang="x-default" href="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="MHS BLOOM">
${T.FONTS}
<style>${CSS}${T.css(lang)}</style>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>
${T.nav(lang, altHref)}
<div class="wrap">
${body}
</div>
${T.footer(lang)}
${T.REVEAL_JS}
</body>
</html>`;
}

function ingredientPage(rec, lang) {
  const en = lang === "en";
  const dir = en ? "ltr" : "rtl";
  const t = (k) => rec[k + "_" + lang] || rec[k + "_en"] || "";
  const name = t("commonName") || rec.inci;
  const slug = rec._slug;
  const canonical = en ? `${SITE}/ingredients/${slug}/` : `${SITE}/ar/ingredients/${slug}/`;
  const altHref = en ? `${SITE}/ar/ingredients/${slug}/` : `${SITE}/ingredients/${slug}/`;
  const altLang = en ? "ar" : "en";

  const L = en
    ? { home: "Home", ings: "Ingredients", what: "What it is", how: "How it works", pairs: "Works well with", avoid: "Introduce carefully alongside", safety: "Who should take care", sources: "Sources",
        gateTitle: "The dose that actually works — and is it right for your skin?",
        gateBody: "The concentration that actually makes a difference, and whether this fits YOUR skin profile, lives in the MHS BLOOM app.",
        get: "Get MHS BLOOM", both: "Also on Android", sub: "Skincare ingredient, decoded — every claim sourced." }
    : { home: "الرئيسية", ings: "المكونات", what: "إيه هو", how: "إزاي بيشتغل", pairs: "يتناسب مع", avoid: "أدخليه بحذر مع", safety: "مين ياخد باله", sources: "المصادر",
        gateTitle: "التركيز اللي فعلاً بيشتغل — وهل يناسب بشرتك إنتي؟",
        gateBody: "التركيز اللي فعلاً بيفرق، وهل ده يناسب ملف بشرتك إنتي، موجود في تطبيق MHS BLOOM.",
        get: "حمّلي MHS BLOOM", both: "متاح على أندرويد كمان", sub: "مكوّن عناية بالبشرة، مبسّط — وكل معلومة بمصدرها." };

  let body = `
<div class="crumb"><a href="${en ? SITE + "/" : SITE + "/ar/"}">${L.home}</a> › <a href="${en ? SITE + "/ingredients/" : SITE + "/ar/ingredients/"}">${L.ings}</a> › ${esc(name)}</div>
<h1>${esc(name)}</h1>
<div class="sub">${L.sub}</div>

<h2>${L.what}</h2>
<p>${esc(t("whatItDoes"))}</p>`;

  if (PUBLISH_MECHANISM && t("deepMoA")) body += `\n<h2>${L.how}</h2>\n<p>${esc(t("deepMoA"))}</p>`;

  const pairs = list(rec.pairsWellWith);
  const avoid = list(rec.avoidCombiningWith);
  if (pairs.length) body += `\n<h2>${L.pairs}</h2>\n<div class="chips">${pairs.map((x) => `<span class="chip good">${esc(x)}</span>`).join("")}</div>`;
  if (avoid.length) body += `\n<h2>${L.avoid}</h2>\n<div class="chips">${avoid.map((x) => `<span class="chip avoid">${esc(x)}</span>`).join("")}</div>`;

  if (t("whoShouldSkip")) body += `\n<h2>${L.safety}</h2>\n<div class="safety">${esc(t("whoShouldSkip"))}</div>`;

  // PRO tease — the dose-precise deep-dive stays in the app
  body += `
<div class="gate">
  <div class="lock">🔒 ${en ? "IN THE APP" : "في التطبيق"}</div>
  <h3>${esc(L.gateTitle)}</h3>
  <p>${esc(L.gateBody)}</p>
  <div class="cta"><a href="${APP_STORE}">${L.get}</a><a class="alt" href="${PLAY_STORE}">${L.both}</a></div>
</div>`;

  const sources = list(rec.sources);
  if (sources.length) {
    body += `\n<h2>${L.sources}</h2>\n<div class="sources"><ol>${sources
      .map((s) => `<li>${s.url ? `<a href="${esc(s.url)}" rel="nofollow noopener" target="_blank">${esc(s.title)}</a>` : esc(s.title)}</li>`)
      .join("")}</ol></div>`;
  }

  body += `\n<div class="disc">${esc(t("disclaimer"))}</div>
`;

  const desc = (t("whatItDoes") || "").replace(/\s+/g, " ").slice(0, 155);
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    inLanguage: lang,
    name: `${name} — ${en ? "skincare ingredient decoded" : "مكوّن عناية بالبشرة مبسّط"}`,
    description: desc,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: "MHS BLOOM", url: SITE },
    citation: sources.map((s) => ({ "@type": "CreativeWork", name: s.title, url: s.url })),
  };

  return page({ lang, dir, title: `${name} — ${en ? "Ingredients Decoded | MHS BLOOM" : "المكونات مبسّطة | MHS BLOOM"}`, desc, canonical, altHref, altLang, jsonld, body });
}

// ---------- index page (list of all ingredients) ----------
function indexPage(recs, lang) {
  const en = lang === "en";
  const dir = en ? "ltr" : "rtl";
  const canonical = en ? `${SITE}/ingredients/` : `${SITE}/ar/ingredients/`;
  const altHref = en ? `${SITE}/ar/ingredients/` : `${SITE}/ingredients/`;
  const L = en
    ? { title: "Skincare Ingredients, Decoded", sub: "Plain-language, sourced explainers for the actives that matter. Every claim referenced.", home: "Home" }
    : { title: "مكونات العناية بالبشرة، مبسّطة", sub: "شرح مبسّط وموثّق للمكونات الفعّالة اللي بتفرق. كل معلومة بمصدرها.", home: "الرئيسية" };
  const items = recs
    .slice()
    .sort((a, b) => (a["commonName_" + lang] || a.inci).localeCompare(b["commonName_" + lang] || b.inci))
    .map((r) => {
      const nm = r["commonName_" + lang] || r["commonName_en"] || r.inci;
      const href = en ? `${SITE}/ingredients/${r._slug}/` : `${SITE}/ar/ingredients/${r._slug}/`;
      const blurb = (r["whatItDoes_" + lang] || r["whatItDoes_en"] || "").replace(/\s+/g, " ").slice(0, 110);
      return `<a class="ing" href="${href}"><b>${esc(nm)}</b><span>${esc(blurb)}…</span></a>`;
    })
    .join("\n");
  const body = `
<h1>${esc(L.title)}</h1>
<div class="sub">${esc(L.sub)}</div>
<style>.ing{display:block;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:13px 16px;margin-bottom:10px;text-decoration:none;color:var(--ink);}
.ing:hover{border-color:var(--rose);}.ing b{color:var(--rose-deep);display:block;font-size:16px;}.ing span{font-size:13px;color:var(--muted);}</style>
${items}
`;
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    inLanguage: lang,
    name: L.title,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: "MHS BLOOM", url: SITE },
  };
  return page({ lang, dir, title: `${L.title} | MHS BLOOM`, desc: L.sub, canonical, altHref, altLang: en ? "ar" : "en", jsonld, body });
}

// ---------- run ----------
// Compliance gate: publish ONLY founder-reviewed records. "filled" (not yet signed off) are held.
const pool = ING.filter((r) => r._slug && r._pass !== false && r._status === "founder-revised");
const targets = sampleOnly ? pool.filter((r) => SAMPLE_SLUGS.includes(r._slug)) : pool;
let count = 0;
const urls = [];
for (const rec of targets) {
  for (const lang of ["en", "ar"]) {
    const rel = lang === "en" ? `ingredients/${rec._slug}` : `ar/ingredients/${rec._slug}`;
    const dir = path.join(ROOT, rel);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), ingredientPage(rec, lang), "utf8");
    urls.push(`${SITE}/${rel}/`);
    count++;
  }
}

if (!sampleOnly) {
  // index pages
  fs.mkdirSync(path.join(ROOT, "ingredients"), { recursive: true });
  fs.mkdirSync(path.join(ROOT, "ar", "ingredients"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "ingredients", "index.html"), indexPage(targets, "en"), "utf8");
  fs.writeFileSync(path.join(ROOT, "ar", "ingredients", "index.html"), indexPage(targets, "ar"), "utf8");
  urls.push(`${SITE}/ingredients/`, `${SITE}/ar/ingredients/`, `${SITE}/`);

  // sitemap.xml
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join("\n")}\n</urlset>\n`;
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap, "utf8");

  // robots.txt (allow all + sitemap)
  fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`, "utf8");

  // llms.txt — machine-readable guide for answer engines
  const llms =
    `# MHS BLOOM\n\n> A bilingual (English/Arabic) skincare reference. ${targets.length} sourced ingredient explainers and 1,682 decoded products. Every claim is referenced to a primary source. No brand can pay to change a rating.\n\n## Ingredients\n\n` +
    targets
      .slice()
      .sort((a, b) => (a.commonName_en || a.inci).localeCompare(b.commonName_en || b.inci))
      .map((r) => `- [${r.commonName_en || r.inci}](${SITE}/ingredients/${r._slug}/): ${(r.whatItDoes_en || "").replace(/\s+/g, " ").slice(0, 120)}`)
      .join("\n") +
    `\n\n## About\n\n- [MHS BLOOM](${SITE}/): the app — App Store & Google Play\n`;
  fs.writeFileSync(path.join(ROOT, "llms.txt"), llms, "utf8");
}

console.log(`generated ${count} ingredient pages (${targets.length} ingredients x 2 langs)${sampleOnly ? " [SAMPLE]" : " + indexes + sitemap + robots + llms.txt"}`);
console.log("slugs:", targets.map((r) => r._slug).join(", "));
