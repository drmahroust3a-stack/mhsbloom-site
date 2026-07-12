// MHS BLOOM — product-page generator (the AEO mothership).
// One bilingual page per catalog product, engineered so answer engines (ChatGPT, Perplexity,
// Google AI Overviews) can identify the product from OUR data and hand off to the app.
// FREE-tier fields only (name/brand/line/category/keyIngredients/skinType/concerns/format).
// The editorial VERDICT stays in the app (teased). No efficacy/medical claims — descriptive only.
//
//   node _tools/build-products.js --sample   -> a few sample pages for format review
//   node _tools/build-products.js            -> ALL products (+ index + feed + sitemap + llms refresh)

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "_data", "catalog-export.json"), "utf8"));
const ING = JSON.parse(fs.readFileSync("C:/Users/drmah/MHS-BLOOM-old/_docs/ingredients_v25_ALL.json", "utf8"))
  .filter((r) => r._slug && r._pass !== false && r._status === "founder-revised");

const SITE = "https://mhsbloom.com";
const APP_STORE = "https://apps.apple.com/app/mhs-bloom/id6778931238";
const PLAY_STORE = "https://play.google.com/store/apps/details?id=com.mhsynaptix.bloom";
const SAMPLE_IDS = ["NEU-BB-GELCREAM", "LRP-EF-GEL", "CRV-MO-CREAM", "PC-SP-BHA", "BIO-SEN-GEL"];
const sampleOnly = process.argv.includes("--sample");
const CONTACT = "contact@mhsbloom.com"; // public contact / corrections / complaints (Namecheap forwarder → brand inbox)
const REG = '<sup class="reg">®</sup>'; // registered-trademark mark after brand names

const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const plain = (s) => String(s || "").replace(/<[^>]+>/g, "");

// ---- label maps ----
const CAT = { "baby-care": ["baby care product", "منتج عناية بالأطفال"], balm: ["balm", "بلسم"], "blemish-care": ["blemish-prone skin product", "منتج للبشرة المعرّضة للحبوب"], "body-care": ["body care product", "منتج عناية بالجسم"], cleanser: ["cleanser", "غسول"], exfoliant: ["exfoliant", "مقشّر"], "eye-care": ["eye-care product", "منتج عناية بمحيط العين"], fragrance: ["fragrance", "عطر"], "hair-care": ["hair-care product", "منتج عناية بالشعر"], "hand-care": ["hand-care product", "منتج عناية باليدين"], "lip-care": ["lip-care product", "منتج عناية بالشفاه"], "micellar-cleanser": ["micellar water", "ماء ميسيلار"], moisturizer: ["moisturizer", "مرطّب"], "moisturizer-spf": ["moisturizer with SPF", "مرطّب بعامل حماية"], serum: ["serum", "سيروم"], sunscreen: ["sunscreen", "واقي شمس"], toner: ["toner", "تونر"] };
const TEX = { balm: ["balm", "بلسم"], bar: ["bar", "قالب"], cream: ["cream", "كريم"], fluid: ["light fluid", "سائل خفيف"], foam: ["foam", "رغوة"], gel: ["gel", "جل"], "gel-cream": ["gel-cream", "جل كريم"], liquid: ["liquid", "سائل"], lotion: ["lotion", "لوشن"], oil: ["oil", "زيت"], ointment: ["ointment", "مرهم"], serum: ["serum", "سيروم"], spray: ["spray", "بخّاخ"] };
const SCENT = { "fragrance-free": ["fragrance-free", "خالي من العطور"], light: ["lightly scented", "عطر خفيف"], fresh: ["fresh scent", "منعش"], warm: ["warm scent", "دافئ"], floral: ["floral scent", "زهري"], none: ["", ""] };
const WHEN = { both: ["morning and night", "صباحًا ومساءً"], morning: ["in the morning", "صباحًا"], night: ["at night", "مساءً"] };
const PRICE = { budget: ["budget", "اقتصادي"], mid: ["mid-range", "متوسط"], premium: ["premium", "راقٍ"], splurge: ["splurge", "فاخر"] };
const CONCERN = { "aging-signs": ["the look of aging", "مظهر التقدّم في السن"], antioxidant: ["antioxidant support", "دعم مضاد الأكسدة"], "baby-care": ["baby care", "عناية بالأطفال"], "barrier-repair": ["skin-barrier support", "دعم حاجز البشرة"], blackheads: ["the look of blackheads", "الرؤوس السوداء"], blemishes: ["blemish-prone skin", "البشرة المعرّضة للحبوب"], "body-care": ["body care", "عناية بالجسم"], "color-protection": ["colour protection", "حماية اللون"], combination: ["combination skin", "البشرة المختلطة"], "dark-circles": ["the look of dark circles", "الهالات الداكنة"], "dark-spots": ["the look of dark spots", "البقع الداكنة"], dehydration: ["dehydrated skin", "نقص الترطيب"], dryness: ["dryness", "الجفاف"], dullness: ["dullness", "البهتان"], "enlarged-pores": ["the look of enlarged pores", "المسام الواسعة"], "fine-lines": ["the look of fine lines", "الخطوط الدقيقة"], frizz: ["frizz", "التجعّد"], "hand-care": ["hand care", "عناية باليدين"], irritation: ["the feel of irritation", "التهيّج"], itching: ["the feel of itching", "الحكة"], "lip-care": ["lip care", "عناية بالشفاه"], "loss-of-firmness": ["the look of firmness", "المرونة"], "makeup-removal": ["makeup removal", "إزالة المكياج"], oiliness: ["oily skin", "الدهون الزائدة"], pollution: ["pollution defence", "التلوّث"], "post-blemish-marks": ["the look of post-blemish marks", "آثار الحبوب"], "post-procedure": ["post-procedure care", "ما بعد الإجراءات"], puffiness: ["the look of puffiness", "الانتفاخ"], recovery: ["skin recovery", "التعافي"], redness: ["the look of redness", "الاحمرار"], "rough-bumps": ["rough, bumpy-feeling skin", "الخشونة"], "scalp-comfort": ["scalp comfort", "راحة فروة الرأس"], sensitivity: ["sensitive skin", "البشرة الحساسة"], "sun-protection": ["sun protection", "الحماية من الشمس"], thinning: ["the look of thinning hair", "خفّة الشعر"], "tired-eyes": ["tired-looking eyes", "إجهاد العين"], "uneven-texture": ["uneven-looking texture", "عدم تجانس الملمس"], "uneven-tone": ["the look of uneven tone", "عدم توحّد اللون"], volume: ["hair volume", "كثافة الشعر"] };
const clabel = (m, k, lang) => (m[k] ? m[k][lang === "en" ? 0 : 1] : k.replace(/-/g, " "));

// ---- ingredient link map (published monographs only) ----
const ALIAS = [["hyaluronic", "sodium-hyaluronate"], ["sodium hyaluronate", "sodium-hyaluronate"], ["niacinamide", "niacinamide"], ["glycerin", "glycerin"], ["tocopherol", "tocopherol"], ["vitamin e", "tocopherol"], ["salicylic", "salicylic-acid"], ["ascorbic", "ascorbic-acid"], ["vitamin c", "ascorbic-acid"], ["ceramide", "ceramide-np"], ["squalane", "squalane"], ["centella", "centella-asiatica-extract"], ["allantoin", "allantoin"], ["panthenol", "panthenol"], ["zinc oxide", "zinc-oxide"], ["azelaic", "azelaic-acid"], ["arbutin", "alpha-arbutin"], ["tranexamic", "tranexamic-acid"], ["bakuchiol", "bakuchiol"], ["urea", "urea"], ["retinaldehyde", "retinal"], ["retinal", "retinal"]];
const ingBySlug = {};
for (const r of ING) ingBySlug[r._slug] = { en: r.commonName_en || r.inci, ar: r.commonName_ar || r.commonName_en || r.inci, blurbEn: (r.whatItDoes_en || "").split(". ")[0], blurbAr: (r.whatItDoes_ar || "").split(". ")[0] };
function ingSlugFor(name) {
  const n = String(name || "").toLowerCase();
  if (/\bretinol\b/.test(n)) return null; // retinol monograph is held (not published)
  for (const [a, s] of ALIAS) if (n.includes(a) && ingBySlug[s]) return s;
  return null;
}

// ---- collect products ----
const brands = data.filter((b) => b.isActive !== false);
const products = [];
for (const b of brands) for (const p of (b.products || [])) if (p.isActive !== false) products.push({ ...p, _brand: b.brandName, _brandAr: b.brandNameAr || b.brandName });

// unique slug
const seen = {};
const slugify = (s) => String(s).toLowerCase().normalize("NFD").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80).replace(/^-|-$/g, "");
for (const p of products) {
  let s = slugify(p._brand + " " + p.name);
  if (seen[s]) { seen[s]++; s = s + "-" + seen[s]; } else seen[s] = 1;
  p._slug = s;
}
const byBrand = {};
for (const p of products) (byBrand[p._brand] = byBrand[p._brand] || []).push(p);

// ---- inline SVG "app-style" product card (the page's visual hero; no external requests) ----
function xesc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;"); }
function wrapName(name, max) {
  const words = String(name).split(" "); const lines = []; let cur = "";
  for (const w of words) { if ((cur + " " + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim(); }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}
function svgCard(p, lang) {
  const en = lang === "en";
  const brand = en ? p._brand : (p._brandAr || p._brand);
  const catL = clabel(CAT, p.categoryId, lang);
  const texL = clabel(TEX, p.texture, lang);
  const nameLines = wrapName(p.name, 26);
  const nameSize = nameLines.length >= 3 ? 34 : (nameLines.some(l => l.length > 22) ? 38 : 42);
  const chips = (Array.isArray(p.keyIngredients) ? p.keyIngredients : []).slice(0, 3);
  let chipX = 60, chipsSvg = "";
  for (const c of chips) {
    const w = Math.min(9.2 * c.length + 36, 300);
    if (chipX + w > 660) break;
    chipsSvg += `<rect x="${chipX}" y="308" width="${w}" height="46" rx="23" fill="#F3E2E4"/><text x="${chipX + w / 2}" y="338" text-anchor="middle" font-family="Segoe UI, Arial" font-size="19" fill="#9E4552" font-weight="600">${xesc(c)}</text>`;
    chipX += w + 12;
  }
  const nameSvg = nameLines.map((l, i) => `<text x="60" y="${190 + i * (nameSize + 12)}" font-family="Georgia, serif" font-size="${nameSize}" font-weight="bold" fill="#9E4552">${xesc(l)}</text>`).join("");
  const meta = [catL, texL, p.size].filter(Boolean).join("  ·  ");
  return `<svg viewBox="0 0 720 440" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${xesc(p.name)}">
<rect width="720" height="440" rx="28" fill="#FDFBF9"/>
<rect x="1.5" y="1.5" width="717" height="437" rx="27" fill="none" stroke="#EADFD8" stroke-width="3"/>
<circle cx="640" cy="70" r="90" fill="#F3E2E4" opacity="0.55"/>
<circle cx="680" cy="380" r="60" fill="#F6EBDD" opacity="0.6"/>
<text x="60" y="86" font-family="Segoe UI, Arial" font-size="22" letter-spacing="6" fill="#B99256" font-weight="700">${xesc(String(brand).toUpperCase())}</text>
<text x="60" y="124" font-family="Segoe UI, Arial" font-size="17" letter-spacing="2" fill="#8A7F7B">M H S   B L O O M   ·   ${en ? "DECODED" : "مفكوك"}</text>
${nameSvg}
${chipsSvg}
<text x="60" y="404" font-family="Segoe UI, Arial" font-size="19" fill="#8A7F7B">${xesc(meta)}</text>
</svg>`;
}

const CSS = `
:root{--cream:#FAF6F2;--card:#FFF;--ink:#2B2626;--muted:#8A7F7B;--rose:#B85C68;--rose-deep:#9E4552;--rose-soft:#F3E2E4;--gold:#B99256;--line:#EADFD8;--lock:#7A4E5A;--ok:#4E7A5A;--ok-soft:#E4EFE7;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:"Segoe UI",-apple-system,Tahoma,Arial,sans-serif;background:var(--cream);color:var(--ink);line-height:1.8;font-size:16px;}
.wrap{max-width:760px;margin:0 auto;padding:22px 18px 80px;}
.top{display:flex;justify-content:space-between;align-items:center;padding-bottom:14px;border-bottom:1px solid var(--line);margin-bottom:18px;font-size:13px;}
.brand{font-weight:700;letter-spacing:2px;color:var(--rose-deep);text-decoration:none;}.brand span{color:var(--gold);}
.langlink{color:var(--muted);text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:4px 12px;}.langlink:hover{border-color:var(--rose);}
.crumb{font-size:12.5px;color:var(--muted);margin-bottom:8px;}.crumb a{color:var(--muted);text-decoration:none;}
.kicker{font-size:13px;color:var(--gold);font-weight:600;}
h1{font-size:27px;color:var(--rose-deep);line-height:1.35;margin:2px 0 10px;}
.lede{font-size:17px;margin-bottom:18px;}
h2{font-size:16px;color:var(--rose-deep);margin:22px 0 8px;text-transform:uppercase;letter-spacing:.5px;}
.ing{list-style:none;}
.ing li{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:9px 13px;margin-bottom:8px;font-size:14.5px;}
.ing li a{color:var(--rose-deep);font-weight:600;text-decoration:none;}
.ing li a:hover{text-decoration:underline;}
.ing li .bl{display:block;color:var(--muted);font-size:12.5px;margin-top:2px;}
.chips{display:flex;flex-wrap:wrap;gap:7px;}
.chip{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:4px 12px;font-size:13px;}
.herocard{margin:6px 0 4px;}
.herocard svg{width:100%;height:auto;display:block;border-radius:22px;box-shadow:0 3px 14px rgba(184,92,104,.09);}
.glance{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;}
.gitem{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 14px;}
.gitem .k{font-size:11.5px;color:var(--muted);letter-spacing:.5px;text-transform:uppercase;}
.gitem .v{font-size:15px;font-weight:700;color:var(--rose-deep);margin-top:2px;}
.appshots{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:10px 0 4px;}
.appshots figure{margin:0;background:var(--card);border:1px solid var(--line);border-radius:16px;overflow:hidden;}
.appshots img{width:100%;display:block;}
.appshots figcaption{font-size:12.5px;color:var(--muted);padding:9px 12px;text-align:center;}
@media(max-width:520px){.appshots{grid-template-columns:1fr 1fr;}}
.gate{background:linear-gradient(180deg,#fff,#FBF3EE);border:1px solid var(--rose-soft);border-radius:16px;padding:18px 22px;margin:22px 0;text-align:center;}
.gate .lock{font-size:13px;color:var(--lock);font-weight:600;letter-spacing:1px;}
.gate p{font-size:14.5px;color:var(--ink);margin:6px 0 14px;}
.cta{display:inline-flex;gap:10px;flex-wrap:wrap;justify-content:center;}
.cta a{background:var(--rose);color:#fff;text-decoration:none;border-radius:12px;padding:11px 20px;font-size:14.5px;font-weight:600;}
.cta a.alt{background:var(--card);color:var(--rose-deep);border:1px solid var(--rose);}
.cta a:hover{background:var(--rose-deep);}
.rel a{color:var(--rose-deep);}
.reg{font-size:.62em;vertical-align:super;color:var(--muted);font-weight:400;}
.about{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 18px;margin-top:24px;font-size:12.5px;color:var(--muted);line-height:1.7;}
.about b{color:var(--rose-deep);}
.about a{color:var(--rose-deep);}
footer{text-align:center;font-size:12px;color:var(--muted);margin-top:22px;}footer a{color:var(--muted);}
`;

function productPage(p, lang) {
  const en = lang === "en";
  const dir = en ? "ltr" : "rtl";
  const brand = en ? p._brand : p._brandAr;
  const catL = clabel(CAT, p.categoryId, lang);
  const canonical = en ? `${SITE}/products/${p._slug}/` : `${SITE}/ar/products/${p._slug}/`;
  const altHref = en ? `${SITE}/ar/products/${p._slug}/` : `${SITE}/products/${p._slug}/`;
  const line = p.line && p.line !== p.name ? p.line : "";
  const skin = (p.skinType && (en ? p.skinType.en : p.skinType.ar)) || "";
  const texL = clabel(TEX, p.texture, lang);
  const scentL = clabel(SCENT, p.scentProfile, lang);

  const brandR = esc(brand) + REG; // brand with ® for display
  // lede: direct "what is X" answer for AI extraction (brandR for display; a plain copy is derived for meta/JSON-LD)
  const lede = en
    ? `${esc(p.name)} is a ${esc(catL)} by ${brandR}${line ? `, part of the ${esc(line)} range` : ""}. It has a ${esc(texL)} texture${p.scentProfile !== "none" ? ` and is ${esc(scentL)}` : ""}${p.size ? `, in a ${esc(p.size)} size` : ""}.`
    : `${esc(p.name)} هو ${esc(catL)} من ${brandR}${line ? `، ضمن مجموعة ${esc(line)}` : ""}. قوامه ${esc(texL)}${p.scentProfile !== "none" ? ` و${esc(scentL)}` : ""}${p.size ? `، بحجم ${esc(p.size)}` : ""}.`;
  const ledeDesc = plain(lede).replace(/®/g, "").replace(/\s+/g, " ").trim(); // clean text for meta + JSON-LD

  const about = en
    ? `<b>About this page.</b> MHS BLOOM is an <b>independent</b> skincare reference. This is an independent editorial review for identification and reference only — we are <b>not affiliated with, authorised by, endorsed by, or sponsored by</b> ${esc(brand)} or any brand or manufacturer, and no brand can pay to change a rating. All brand and product names are the trademarks or registered trademarks of their respective owners, used here for identification purposes only. Ingredient details follow the manufacturer's packaging and may change — always check the product's own label. Questions, corrections or complaints: <a href="mailto:${CONTACT}?subject=MHS%20BLOOM%20—%20${encodeURIComponent(p.name)}">${CONTACT}</a>.`
    : `<b>عن هذه الصفحة.</b> MHS BLOOM مرجع <b>مستقل</b> للعناية بالبشرة. وهذه مراجعة تحريرية مستقلة لغرض التعريف والاسترشاد فقط — <b>لسنا تابعين لأي علامة أو شركة مصنّعة ولا مرخّصين أو مموّلين منها</b> (بما فيها ${esc(brand)})، ولا يمكن لأي علامة أن تدفع لتغيير تقييم. جميع أسماء العلامات والمنتجات علامات تجارية أو علامات تجارية مسجّلة تعود لأصحابها، وتُستخدم هنا لغرض التعريف فقط. معلومات المكونات تتبع عبوة الشركة المصنّعة وقد تتغيّر — راجعي دائمًا ملصق المنتج نفسه. للاستفسارات أو التصحيحات أو الشكاوى: <a href="mailto:${CONTACT}?subject=MHS%20BLOOM%20—%20${encodeURIComponent(p.name)}">${CONTACT}</a>.`;

  const L = en
    ? { kicker: "Product, decoded", home: "Home", prods: "Products", ings: "Key ingredients", suited: "Best suited to", focus: "Focus areas", glance: "At a glance", format: "Format", scent: "Fragrance", size: "Size", use: "When to use", price: "Price tier", from: "More from", inapp: "Inside the MHS BLOOM app", cap1: "Every product decoded — ingredients, skin fit, format", cap2: "BLOOM's verdict: should you actually buy it?", gate: `Is ${p.name} right for YOUR skin? BLOOM's full verdict — plus how it compares and fits your routine — is in the app.`, get: "Get MHS BLOOM", alt: "Also on Android", disc: "This page describes catalogued attributes of the product for reference; it is not an efficacy or safety claim, and not medical advice. Ingredient lists follow the manufacturer's packaging.", lang: "العربية" }
    : { kicker: "منتج، مفكوك", home: "الرئيسية", prods: "المنتجات", ings: "المكونات الرئيسية", suited: "الأنسب لـ", focus: "مجالات التركيز", glance: "لمحة سريعة", format: "القوام", scent: "الرائحة", size: "الحجم", use: "وقت الاستخدام", price: "الفئة السعرية", from: "المزيد من", inapp: "جوّه تطبيق MHS BLOOM", cap1: "كل منتج مفكوك — المكونات وملاءمة البشرة والقوام", cap2: "حكم بلوم: تشتريه فعلًا ولا لأ؟", gate: `هل ${p.name} يناسب بشرتك إنتي؟ حكم بلوم الكامل — وإزاي يقارن ويدخل في روتينك — موجود في التطبيق.`, get: "حمّلي MHS BLOOM", alt: "متاح على أندرويد", disc: "الصفحة دي بتوصف خصائص المنتج المُدرجة للمرجع؛ وليست ادعاء فعالية أو أمان، ولا نصيحة طبية. قوائم المكونات تتبع عبوة الشركة المصنّعة.", lang: "English" };

  // key ingredients (link the ones we cover)
  const kis = (Array.isArray(p.keyIngredients) ? p.keyIngredients : []).map((k) => {
    const slug = ingSlugFor(k);
    if (slug) {
      const g = ingBySlug[slug];
      const href = en ? `${SITE}/ingredients/${slug}/` : `${SITE}/ar/ingredients/${slug}/`;
      const bl = en ? g.blurbEn : g.blurbAr;
      return `<li><a href="${href}">${esc(k)}</a>${bl ? `<span class="bl">${esc(bl)}.</span>` : ""}</li>`;
    }
    return `<li>${esc(k)}</li>`;
  }).join("");

  const concerns = (Array.isArray(p.skinConcerns) ? p.skinConcerns : []).map((c) => `<span class="chip">${esc(clabel(CONCERN, c, lang))}</span>`).join("");

  const related = (byBrand[p._brand] || []).filter((x) => x._slug !== p._slug).slice(0, 5)
    .map((x) => `<a href="${en ? SITE + "/products/" + x._slug + "/" : SITE + "/ar/products/" + x._slug + "/"}">${esc(x.name)}</a>`).join(" · ");

  const body = `
<div class="top"><a class="brand" href="${en ? SITE : SITE + "/ar/"}">MHS <span>BLOOM</span></a><a class="langlink" href="${altHref}">${L.lang}</a></div>
<div class="crumb"><a href="${en ? SITE + "/" : SITE + "/ar/"}">${L.home}</a> › <a href="${en ? SITE + "/products/" : SITE + "/ar/products/"}">${L.prods}</a> › ${brandR}</div>
<div class="kicker">${L.kicker}</div>
<h1>${esc(p.name)}</h1>
<div class="herocard">${svgCard(p, lang)}</div>
<p class="lede">${lede}</p>
${kis ? `<h2>${L.ings}</h2><ul class="ing">${kis}</ul>` : ""}
${skin ? `<h2>${L.suited}</h2><p>${esc(skin)}</p>` : ""}
${concerns ? `<h2>${L.focus}</h2><div class="chips">${concerns}</div>` : ""}
<h2>${L.glance}</h2>
<div class="glance">
<div class="gitem"><div class="k">${L.format}</div><div class="v">${esc(texL)}</div></div>
${p.scentProfile !== "none" ? `<div class="gitem"><div class="k">${L.scent}</div><div class="v">${esc(scentL)}</div></div>` : ""}
${p.size ? `<div class="gitem"><div class="k">${L.size}</div><div class="v">${esc(p.size)}</div></div>` : ""}
${p.whenToUse ? `<div class="gitem"><div class="k">${L.use}</div><div class="v">${esc(clabel(WHEN, p.whenToUse, lang))}</div></div>` : ""}
${p.priceRange ? `<div class="gitem"><div class="k">${L.price}</div><div class="v">${esc(clabel(PRICE, p.priceRange, lang))}</div></div>` : ""}
</div>
<h2>${L.inapp}</h2>
<div class="appshots">
<figure><img src="${SITE}/assets/app-product.png" alt="MHS BLOOM app — product decoded" loading="lazy" width="640" height="1137"><figcaption>${esc(L.cap1)}</figcaption></figure>
<figure><img src="${SITE}/assets/app-verdict.png" alt="MHS BLOOM app — BLOOM's verdict" loading="lazy" width="640" height="1137"><figcaption>${esc(L.cap2)}</figcaption></figure>
</div>
<div class="gate"><div class="lock">🔒 ${en ? "IN THE APP" : "في التطبيق"}</div><p>${esc(L.gate)}</p>
<div class="cta"><a href="${APP_STORE}">${L.get}</a><a class="alt" href="${PLAY_STORE}">${L.alt}</a></div></div>
${related ? `<h2>${L.from} ${brandR}</h2><div class="rel">${related}</div>` : ""}
<div class="disc">${esc(L.disc)}</div>
<div class="about">${about}</div>
<footer>© 2026 MH-SYNAPTIX · <a href="${SITE}/">mhsbloom.com</a> · <a href="https://www.instagram.com/mhs_bloom">Instagram</a> · <a href="mailto:${CONTACT}">${CONTACT}</a></footer>`;

  const jsonld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    brand: { "@type": "Brand", name: p._brand },
    category: clabel(CAT, p.categoryId, "en"),
    description: ledeDesc,
    inLanguage: lang,
    url: canonical,
    additionalProperty: (p.keyIngredients || []).map((k) => ({ "@type": "PropertyValue", name: "Key ingredient", value: k })),
    isRelatedTo: { "@type": "MobileApplication", name: "MHS BLOOM", operatingSystem: "iOS, Android", applicationCategory: "LifestyleApplication", url: SITE },
  };
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(p.name)} — ${esc(brand)} | MHS BLOOM</title>
<meta name="description" content="${esc(ledeDesc).slice(0, 155)}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="${lang}" href="${canonical}">
<link rel="alternate" hreflang="${en ? "ar" : "en"}" href="${altHref}">
<link rel="alternate" hreflang="x-default" href="${canonical}">
<meta property="og:title" content="${esc(p.name)} — ${esc(brand)}">
<meta property="og:description" content="${esc(ledeDesc).slice(0, 155)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="MHS BLOOM">
<style>${CSS}</style>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body><div class="wrap">${body}</div></body></html>`;
}

// --stage writes ALL pages into the gitignored _staged/ tree (for gradual batch publishing)
const staging = process.argv.includes("--stage");
const OUT = staging ? path.join(ROOT, "_staged") : ROOT;

const targets = sampleOnly ? products.filter((p) => SAMPLE_IDS.includes(p.id)) : products;
let n = 0;
for (const p of targets) {
  for (const lang of ["en", "ar"]) {
    const rel = lang === "en" ? `products/${p._slug}` : `ar/products/${p._slug}`;
    fs.mkdirSync(path.join(OUT, rel), { recursive: true });
    fs.writeFileSync(path.join(OUT, rel, "index.html"), productPage(p, lang), "utf8");
    n++;
  }
}
// product metadata map for the batch publisher (index/sitemap generation)
if (!sampleOnly) {
  const meta = products.map((p) => ({ id: p.id, slug: p._slug, brand: p._brand, brandAr: p._brandAr, name: p.name, category: p.categoryId }));
  fs.mkdirSync(path.join(ROOT, "_data"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "_data", "product-meta.json"), JSON.stringify(meta), "utf8");
}
console.log(`generated ${n} product pages (${targets.length} products x 2)${sampleOnly ? " [SAMPLE]" : ""}${staging ? " -> _staged/" : ""}`);
if (sampleOnly) targets.forEach((p) => console.log(`  ${SITE}/products/${p._slug}/  <- ${p._brand} ${p.name}`));
