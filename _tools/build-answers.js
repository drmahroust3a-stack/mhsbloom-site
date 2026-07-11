// Build the Answers Hub pages from the founder-approved, verified Q&A batch.
// One bilingual answer page per Q&A (EN at /answers/<slug>/, AR at /ar/answers/<slug>/),
// plus /answers/ index (both langs), all with QAPage/FAQ JSON-LD for answer engines.
// Also refreshes sitemap.xml + llms.txt to include ingredients AND answers.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const QAS = JSON.parse(fs.readFileSync(path.join(ROOT, "_data", "answers-batch1.json"), "utf8"));
const ING = JSON.parse(fs.readFileSync("C:/Users/drmah/MHS-BLOOM-old/_docs/ingredients_v25_ALL.json", "utf8"))
  .filter((r) => r._slug && r._pass !== false && r._status === "founder-revised");

const SITE = "https://mhsbloom.com";
const APP_STORE = "https://apps.apple.com/app/mhs-bloom/id6778931238";
const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.mhsynaptix.bloom";

const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// slugify an English question into a stable URL slug
function slugify(q) {
  return q.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 70).replace(/^-|-$/g, "");
}
// ensure uniqueness
const seen = {};
for (const q of QAS) {
  let s = slugify(q.question_en);
  if (seen[s]) s = s + "-" + (seen[s] + 1);
  seen[slugify(q.question_en)] = (seen[slugify(q.question_en)] || 0) + 1;
  q._slug = s;
}

const CSS = `
:root{--cream:#FAF6F2;--card:#FFF;--ink:#2B2626;--muted:#8A7F7B;--rose:#B85C68;--rose-deep:#9E4552;--rose-soft:#F3E2E4;--gold:#B99256;--line:#EADFD8;--lock:#7A4E5A;--ok:#4E7A5A;--ok-soft:#E4EFE7;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:"Segoe UI",-apple-system,Tahoma,Arial,sans-serif;background:var(--cream);color:var(--ink);line-height:1.8;font-size:16px;}
.wrap{max-width:760px;margin:0 auto;padding:22px 18px 80px;}
.top{display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;border-bottom:1px solid var(--line);margin-bottom:22px;font-size:13px;}
.brand{font-weight:700;letter-spacing:2px;color:var(--rose-deep);text-decoration:none;}.brand span{color:var(--gold);}
.langlink{color:var(--muted);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:4px 12px;}.langlink:hover{border-color:var(--rose);}
.crumb{font-size:12.5px;color:var(--muted);margin-bottom:10px;}.crumb a{color:var(--muted);text-decoration:none;}
h1{font-size:26px;color:var(--rose-deep);line-height:1.4;margin-bottom:16px;}
.answer{font-size:17px;line-height:1.9;margin-bottom:18px;}
.gate{background:linear-gradient(180deg,#fff,#FBF3EE);border:1px solid var(--rose-soft);border-radius:16px;padding:18px 22px;margin:22px 0;text-align:center;}
.gate .lock{font-size:13px;color:var(--lock);font-weight:600;letter-spacing:1px;}
.gate p{font-size:14px;color:var(--muted);margin:6px 0 14px;}
.cta{display:inline-flex;gap:10px;flex-wrap:wrap;justify-content:center;}
.cta a{background:var(--rose);color:#fff;text-decoration:none;border-radius:12px;padding:11px 20px;font-size:14.5px;font-weight:600;}
.cta a.alt{background:var(--card);color:var(--rose-deep);border:1px solid var(--rose);}
.cta a:hover{background:var(--rose-deep);}
h2{font-size:16px;color:var(--rose-deep);margin:24px 0 8px;}
.sources{font-size:13px;color:var(--muted);}.sources ol{padding-inline-start:20px;}.sources li{margin-bottom:7px;}.sources a{color:var(--rose-deep);}
.rel{font-size:13.5px;}.rel a{color:var(--rose-deep);}
.disc{font-size:12.5px;color:var(--muted);font-style:italic;border-top:1px solid var(--line);margin-top:26px;padding-top:14px;}
footer{text-align:center;font-size:12px;color:var(--muted);margin-top:30px;}footer a{color:var(--muted);}
.qlist a{display:block;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:13px 16px;margin-bottom:10px;text-decoration:none;color:var(--rose-deep);font-weight:600;font-size:15.5px;}
.qlist a:hover{border-color:var(--rose);}
.sub{color:var(--muted);font-size:15px;margin-bottom:22px;}
`;

function shell({ lang, dir, title, desc, canonical, altHref, altLang, jsonld, body }) {
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
<style>${CSS}</style>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body><div class="wrap">
${body}
</div></body></html>`;
}

// map ingredient slug -> localized name for related links
const nameOf = {};
for (const r of ING) nameOf[r._slug] = { en: r.commonName_en || r.inci, ar: r.commonName_ar || r.commonName_en || r.inci };

function answerPage(q, lang) {
  const en = lang === "en";
  const dir = en ? "ltr" : "rtl";
  const question = en ? q.question_en : q.question_ar;
  const answer = en ? q.answer_en : q.answer_ar;
  const canonical = en ? `${SITE}/answers/${q._slug}/` : `${SITE}/ar/answers/${q._slug}/`;
  const altHref = en ? `${SITE}/ar/answers/${q._slug}/` : `${SITE}/answers/${q._slug}/`;
  const L = en
    ? { home: "Home", ans: "Answers", sources: "Sources", related: "Related ingredients", gate: "The concentration that matters, and whether it fits your skin, is in the MHS BLOOM app.", get: "Get MHS BLOOM", alt: "Also on Android", disc: "This is cosmetic reference information, not medical advice.", lang: "العربية" }
    : { home: "الرئيسية", ans: "الإجابات", sources: "المصادر", related: "مكونات ذات صلة", gate: "التركيز اللي بيفرق، وهل يناسب بشرتك إنتي، موجود في تطبيق MHS BLOOM.", get: "حمّلي MHS BLOOM", alt: "متاح على أندرويد", disc: "دي معلومات مرجعية تجميلية، مش نصيحة طبية.", lang: "English" };

  const related = (q.ingredient_slugs || []).filter((s) => nameOf[s]).map((s) => `<a href="${en ? SITE + "/ingredients/" + s + "/" : SITE + "/ar/ingredients/" + s + "/"}">${esc(nameOf[s][lang])}</a>`).join(" · ");
  const src = (q.sources || []).map((s) => `<li><a href="${esc(s.url)}" rel="nofollow noopener" target="_blank">${esc(s.title)}</a></li>`).join("");

  const body = `
<div class="top">
  <a class="brand" href="${en ? SITE : SITE + "/ar/"}">MHS <span>BLOOM</span></a>
  <a class="langlink" href="${altHref}">${L.lang}</a>
</div>
<div class="crumb"><a href="${en ? SITE + "/" : SITE + "/ar/"}">${L.home}</a> › <a href="${en ? SITE + "/answers/" : SITE + "/ar/answers/"}">${L.ans}</a></div>
<h1>${esc(question)}</h1>
<div class="answer">${esc(answer)}</div>
<div class="gate">
  <div class="lock">🔒 ${en ? "IN THE APP" : "في التطبيق"}</div>
  <p>${esc(L.gate)}</p>
  <div class="cta"><a href="${APP_STORE}">${L.get}</a><a class="alt" href="${PLAY_STORE}">${L.alt}</a></div>
</div>
${related ? `<h2>${L.related}</h2><div class="rel">${related}</div>` : ""}
${src ? `<h2>${L.sources}</h2><div class="sources"><ol>${src}</ol></div>` : ""}
<div class="disc">${esc(L.disc)}</div>
<footer>© 2026 MH-SYNAPTIX · <a href="${SITE}/">mhsbloom.com</a> · <a href="https://www.instagram.com/mhs_bloom">Instagram</a></footer>`;

  const jsonld = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    inLanguage: lang,
    mainEntity: {
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    },
    isPartOf: { "@type": "WebSite", name: "MHS BLOOM", url: SITE },
    citation: (q.sources || []).map((s) => ({ "@type": "CreativeWork", name: s.title, url: s.url })),
  };
  const desc = answer.replace(/\s+/g, " ").slice(0, 155);
  return shell({ lang, dir, title: `${question} | MHS BLOOM`, desc, canonical, altHref, altLang: en ? "ar" : "en", jsonld, body });
}

function indexPage(lang) {
  const en = lang === "en";
  const dir = en ? "ltr" : "rtl";
  const canonical = en ? `${SITE}/answers/` : `${SITE}/ar/answers/`;
  const altHref = en ? `${SITE}/ar/answers/` : `${SITE}/answers/`;
  const L = en
    ? { title: "Skincare Answers", sub: "Straight, sourced answers to the questions people actually ask. Every claim referenced.", lang: "العربية" }
    : { title: "إجابات العناية بالبشرة", sub: "إجابات مباشرة وموثّقة للأسئلة اللي الناس بتسألها فعلاً. كل معلومة بمصدرها.", lang: "English" };
  const items = QAS.map((q) => `<a href="${en ? SITE + "/answers/" + q._slug + "/" : SITE + "/ar/answers/" + q._slug + "/"}">${esc(en ? q.question_en : q.question_ar)}</a>`).join("\n");
  const body = `
<div class="top"><a class="brand" href="${en ? SITE : SITE + "/ar/"}">MHS <span>BLOOM</span></a><a class="langlink" href="${altHref}">${L.lang}</a></div>
<h1>${esc(L.title)}</h1><div class="sub">${esc(L.sub)}</div>
<div class="qlist">${items}</div>
<footer>© 2026 MH-SYNAPTIX · <a href="${SITE}/">mhsbloom.com</a></footer>`;
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang,
    mainEntity: QAS.map((q) => ({ "@type": "Question", name: en ? q.question_en : q.question_ar, acceptedAnswer: { "@type": "Answer", text: en ? q.answer_en : q.answer_ar } })),
  };
  return shell({ lang, dir, title: `${L.title} | MHS BLOOM`, desc: L.sub, canonical, altHref, altLang: en ? "ar" : "en", jsonld, body });
}

// write answer pages
let n = 0;
for (const q of QAS) {
  for (const lang of ["en", "ar"]) {
    const rel = lang === "en" ? `answers/${q._slug}` : `ar/answers/${q._slug}`;
    fs.mkdirSync(path.join(ROOT, rel), { recursive: true });
    fs.writeFileSync(path.join(ROOT, rel, "index.html"), answerPage(q, lang), "utf8");
    n++;
  }
}
fs.mkdirSync(path.join(ROOT, "answers"), { recursive: true });
fs.mkdirSync(path.join(ROOT, "ar", "answers"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "answers", "index.html"), indexPage("en"), "utf8");
fs.writeFileSync(path.join(ROOT, "ar", "answers", "index.html"), indexPage("ar"), "utf8");

// ---- refresh sitemap.xml + llms.txt (ingredients + answers) ----
const ingUrls = [];
for (const r of ING) ingUrls.push(`${SITE}/ingredients/${r._slug}/`, `${SITE}/ar/ingredients/${r._slug}/`);
const ansUrls = [];
for (const q of QAS) ansUrls.push(`${SITE}/answers/${q._slug}/`, `${SITE}/ar/answers/${q._slug}/`);
const allUrls = [`${SITE}/`, `${SITE}/ingredients/`, `${SITE}/ar/ingredients/`, `${SITE}/answers/`, `${SITE}/ar/answers/`, ...ingUrls, ...ansUrls];
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allUrls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}\n</urlset>\n`, "utf8");

const llms =
  `# MHS BLOOM\n\n> A bilingual (English/Arabic) skincare reference. ${ING.length} sourced ingredient explainers, a growing answers hub, and 1,682 decoded products. Every claim is referenced to a primary source. No brand can pay to change a rating.\n\n## Answers\n\n` +
  QAS.map((q) => `- [${q.question_en}](${SITE}/answers/${q._slug}/)`).join("\n") +
  `\n\n## Ingredients\n\n` +
  ING.slice().sort((a, b) => (a.commonName_en || a.inci).localeCompare(b.commonName_en || b.inci)).map((r) => `- [${r.commonName_en || r.inci}](${SITE}/ingredients/${r._slug}/): ${(r.whatItDoes_en || "").replace(/\s+/g, " ").slice(0, 120)}`).join("\n") +
  `\n\n## About\n\n- [MHS BLOOM](${SITE}/): the app — App Store & Google Play\n`;
fs.writeFileSync(path.join(ROOT, "llms.txt"), llms, "utf8");

console.log(`generated ${n} answer pages (${QAS.length} Q&A x 2) + 2 indexes`);
console.log(`sitemap: ${allUrls.length} urls | llms.txt refreshed`);
console.log("answer slugs:", QAS.map((q) => q._slug).join(", "));
