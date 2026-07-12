// Build the /stats page — descriptive, citable facts from MHS BLOOM's 1,682-product reference.
// Numbers are computed live from the catalog export (verifiable, no hand-typed figures).
// Compliance: descriptive COUNTS only ("labelled fragrance-free", "catalogued as sunscreens") —
// never efficacy/safety claims. Frame everything as "in MHS BLOOM's reference".
const fs = require("fs");
const T = require("./theme");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "_data", "catalog-export.json"), "utf8"));
const SITE = "https://mhsbloom.com";
const APP_STORE = "https://apps.apple.com/app/mhs-bloom/id6778931238";
const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.mhsynaptix.bloom";
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const brands = data.filter((b) => b.isActive !== false);
const products = brands.flatMap((b) => (b.products || []).filter((p) => p.isActive !== false));
const P = products.length, B = brands.length;
const pct = (n) => Math.round((n / P) * 100);
const tally = (arr) => { const m = {}; for (const x of arr) { if (x == null || x === "") continue; m[x] = (m[x] || 0) + 1; } return m; };

const scent = tally(products.map((p) => p.scentProfile));
const cat = tally(products.map((p) => p.categoryId));
const price = tally(products.map((p) => p.priceRange));
const when = tally(products.map((p) => p.whenToUse));
const tex = tally(products.map((p) => p.texture));
const ki = tally(products.flatMap((p) => (Array.isArray(p.keyIngredients) ? p.keyIngredients : [])));
const concern = tally(products.flatMap((p) => (Array.isArray(p.skinConcerns) ? p.skinConcerns : [])));
const country = tally(brands.map((b) => b.country));
const usMerged = (country["USA"] || 0) + (country["United States"] || 0);
const perBrand = tally(products.map((p) => { const b = brands.find((x) => (x.products || []).includes(p)); return b ? b.brandName : ""; }));
const topBrand = Object.entries(perBrand).sort((a, b) => b[1] - a[1])[0];
const spf = (cat["sunscreen"] || 0) + (cat["moisturizer-spf"] || 0);

// Each stat: { en, ar } — descriptive only.
const STATS = [
  { en: `MHS BLOOM's reference covers <b>${P.toLocaleString()} products</b> across <b>${B} brands</b>, each with its ingredients decoded and every claim sourced.`,
    ar: `مرجع MHS BLOOM يغطّي <b>${P.toLocaleString()} منتج</b> من <b>${B} براند</b>، كل واحد بمكوّناته مفكوكة وكل معلومة بمصدرها.` },
  { en: `<b>${scent["fragrance-free"]}</b> of the ${P.toLocaleString()} products (<b>${pct(scent["fragrance-free"])}%</b>) are labelled fragrance-free.`,
    ar: `<b>${scent["fragrance-free"]}</b> منتج من الـ ${P.toLocaleString()} (<b>${pct(scent["fragrance-free"])}%</b>) موصوفة بأنها خالية من العطور.` },
  { en: `The most-catalogued product type is moisturizers (<b>${cat["moisturizer"]}</b>), followed by serums (<b>${cat["serum"]}</b>) and sunscreens (<b>${cat["sunscreen"]}</b>).`,
    ar: `أكثر نوع منتج في المرجع هو المرطّبات (<b>${cat["moisturizer"]}</b>)، يليه السيرومات (<b>${cat["serum"]}</b>) ثم واقيات الشمس (<b>${cat["sunscreen"]}</b>).` },
  { en: `Hyaluronic acid is the most-catalogued key ingredient, listed in <b>${ki["Hyaluronic Acid"]}</b> products; glycerin (<b>${ki["Glycerin"]}</b>) and niacinamide (<b>${ki["Niacinamide"]}</b>) follow.`,
    ar: `حمض الهيالورونيك هو أكثر مكوّن رئيسي تكرارًا، مذكور في <b>${ki["Hyaluronic Acid"]}</b> منتج؛ يليه الجليسرين (<b>${ki["Glycerin"]}</b>) والنياسيناميد (<b>${ki["Niacinamide"]}</b>).` },
  { en: `<b>${spf}</b> products carry SPF (${cat["sunscreen"]} dedicated sunscreens plus ${cat["moisturizer-spf"]} SPF moisturizers).`,
    ar: `<b>${spf}</b> منتج يحتوي على عامل حماية من الشمس (${cat["sunscreen"]} واقي شمس مخصّص + ${cat["moisturizer-spf"]} مرطّب بعامل حماية).` },
  { en: `<b>${when["both"].toLocaleString()}</b> products (<b>${pct(when["both"])}%</b>) are suited to both morning and night use.`,
    ar: `<b>${when["both"].toLocaleString()}</b> منتج (<b>${pct(when["both"])}%</b>) مناسب للاستخدام صباحًا ومساءً معًا.` },
  { en: `By price band the mix is <b>${price["budget"]}</b> budget, <b>${price["mid"]}</b> mid-range, <b>${price["premium"]}</b> premium and <b>${price["splurge"]}</b> splurge.`,
    ar: `حسب الفئة السعرية: <b>${price["budget"]}</b> اقتصادي، <b>${price["mid"]}</b> متوسط، <b>${price["premium"]}</b> راقٍ، <b>${price["splurge"]}</b> فاخر.` },
  { en: `The most common texture is cream (<b>${tex["cream"]}</b>), followed by serum (<b>${tex["serum"]}</b>) and liquid (<b>${tex["liquid"]}</b>).`,
    ar: `أكثر قوام شائع هو الكريم (<b>${tex["cream"]}</b>)، يليه السيروم (<b>${tex["serum"]}</b>) ثم السائل (<b>${tex["liquid"]}</b>).` },
  { en: `The skin concerns most often addressed across the catalog are dryness (<b>${concern["dryness"]}</b>), sensitivity (<b>${concern["sensitivity"]}</b>) and dehydration (<b>${concern["dehydration"]}</b>).`,
    ar: `أكثر اهتمامات البشرة تكرارًا في المرجع هي الجفاف (<b>${concern["dryness"]}</b>)، الحساسية (<b>${concern["sensitivity"]}</b>) ونقص الترطيب (<b>${concern["dehydration"]}</b>).` },
  { en: `Brands come from more than <b>${Object.keys(country).length - 1}</b> countries; France is the most-represented origin (<b>${country["France"]}</b> brands), then the United States (<b>${usMerged}</b>) and South Korea (<b>${country["South Korea"]}</b>).`,
    ar: `البراندات من أكثر من <b>${Object.keys(country).length - 1}</b> دولة؛ فرنسا هي الأكثر تمثيلًا (<b>${country["France"]}</b> براند)، ثم الولايات المتحدة (<b>${usMerged}</b>) وكوريا الجنوبية (<b>${country["South Korea"]}</b>).` },
  { en: `The single most-catalogued brand is ${esc(topBrand[0])} (<b>${topBrand[1]}</b> products); the average brand has about <b>${Math.round(P / B)}</b> products decoded.`,
    ar: `أكثر براند تمثيلًا هو ${esc(topBrand[0])} (<b>${topBrand[1]}</b> منتج)؛ ومتوسط البراند حوالي <b>${Math.round(P / B)}</b> منتج مفكوك.` },
  { en: `Among well-known actives: vitamin C is listed in <b>${ki["Vitamin C"]}</b> products, salicylic acid in <b>${ki["Salicylic Acid"]}</b>, peptides in <b>${ki["Peptides"]}</b> and ceramides in <b>${ki["Ceramides"]}</b>.`,
    ar: `من المكوّنات الفعّالة المعروفة: فيتامين سي مذكور في <b>${ki["Vitamin C"]}</b> منتج، حمض الساليسيليك في <b>${ki["Salicylic Acid"]}</b>، الببتيدات في <b>${ki["Peptides"]}</b>، والسيراميدات في <b>${ki["Ceramides"]}</b>.` },
];

const CSS = `
:root{--cream:#FAF6F2;--card:#FFF;--ink:#2B2626;--muted:#8A7F7B;--rose:#B85C68;--rose-deep:#9E4552;--rose-soft:#F3E2E4;--gold:#B99256;--line:#EADFD8;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:"Segoe UI",-apple-system,Tahoma,Arial,sans-serif;background:var(--cream);color:var(--ink);line-height:1.75;font-size:16px;}
.wrap{max-width:760px;margin:0 auto;padding:22px 18px 80px;}
.top{display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;border-bottom:1px solid var(--line);margin-bottom:22px;font-size:13px;}
.brand{font-weight:700;letter-spacing:2px;color:var(--rose-deep);text-decoration:none;}.brand span{color:var(--gold);}
.langlink{color:var(--muted);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:4px 12px;}.langlink:hover{border-color:var(--rose);}
h1{font-size:27px;color:var(--rose-deep);margin-bottom:6px;}
.sub{color:var(--muted);font-size:15px;margin-bottom:24px;}
.stat{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 18px;margin-bottom:11px;font-size:16px;}
.stat b{color:var(--rose-deep);}
.note{font-size:12.5px;color:var(--muted);font-style:italic;border-top:1px solid var(--line);margin-top:22px;padding-top:14px;}
.cta{margin-top:22px;display:inline-flex;gap:10px;flex-wrap:wrap;}
.cta a{background:var(--rose);color:#fff;text-decoration:none;border-radius:12px;padding:11px 20px;font-size:14.5px;font-weight:600;}
.cta a.alt{background:var(--card);color:var(--rose-deep);border:1px solid var(--rose);}
footer{text-align:center;font-size:12px;color:var(--muted);margin-top:26px;}footer a{color:var(--muted);}
`;

function buildPage(lang) {
  const en = lang === "en";
  const dir = en ? "ltr" : "rtl";
  const canonical = en ? `${SITE}/stats/` : `${SITE}/ar/stats/`;
  const altHref = en ? `${SITE}/ar/stats/` : `${SITE}/stats/`;
  const L = en
    ? { title: "Skincare by the Numbers", sub: `Descriptive facts drawn from MHS BLOOM's reference of ${P.toLocaleString()} decoded products across ${B} brands. Counts only — no brand can pay to change a rating.`, note: "These are descriptive figures about the products catalogued in MHS BLOOM's reference, not efficacy or safety claims. Cosmetic reference only.", get: "Get MHS BLOOM", alt: "Also on Android", lang: "العربية", home: "Home" }
    : { title: "العناية بالبشرة بالأرقام", sub: `حقائق وصفية من مرجع MHS BLOOM الذي يضم ${P.toLocaleString()} منتج مفكوك عبر ${B} براند. أعداد فقط — ولا براند يقدر يدفع عشان يغيّر تقييم.`, note: "دي أرقام وصفية عن المنتجات المُدرَجة في مرجع MHS BLOOM، وليست ادعاءات فعالية أو أمان. مرجع تجميلي فقط.", get: "حمّلي MHS BLOOM", alt: "متاح على أندرويد", lang: "English", home: "الرئيسية" };
  const items = STATS.map((s) => `<div class="stat">${en ? s.en : s.ar}</div>`).join("\n");
  const body = `
<h1>${esc(L.title)}</h1>
<div class="sub">${esc(L.sub)}</div>
${items}
<div class="note">${esc(L.note)}</div>
<div class="cta"><a href="${APP_STORE}">${L.get}</a><a class="alt" href="${PLAY_STORE}">${L.alt}</a></div>
`;
  // strip HTML tags for meta/JSON-LD plain text
  const plain = (s) => s.replace(/<[^>]+>/g, "");
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    inLanguage: lang,
    name: L.title,
    description: plain(L.sub),
    url: canonical,
    creator: { "@type": "Organization", name: "MHS BLOOM", url: SITE },
    variableMeasured: STATS.map((s) => plain(en ? s.en : s.ar)),
  };
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(L.title)} | MHS BLOOM</title>
<meta name="description" content="${esc(plain(L.sub))}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="${lang}" href="${canonical}">
<link rel="alternate" hreflang="${en ? "ar" : "en"}" href="${altHref}">
<link rel="alternate" hreflang="x-default" href="${canonical}">
<meta property="og:title" content="${esc(L.title)}">
<meta property="og:description" content="${esc(plain(L.sub))}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="MHS BLOOM">
${T.FONTS}
<style>${CSS}${T.css(lang)}</style>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>${T.nav(lang, altHref)}<div class="wrap">${body}</div>${T.footer(lang)}${T.REVEAL_JS}</body></html>`;
}

fs.mkdirSync(path.join(ROOT, "stats"), { recursive: true });
fs.mkdirSync(path.join(ROOT, "ar", "stats"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "stats", "index.html"), buildPage("en"), "utf8");
fs.writeFileSync(path.join(ROOT, "ar", "stats", "index.html"), buildPage("ar"), "utf8");
console.log(`stats pages built (${STATS.length} facts, EN + AR).`);
// print the EN sentences (plain) for founder review
STATS.forEach((s, i) => console.log(`${i + 1}. ${s.en.replace(/<[^>]+>/g, "")}`));
