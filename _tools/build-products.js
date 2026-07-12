// MHS BLOOM — product-page generator, GALLERY EDITION.
// Museum-plaque aesthetic via _tools/theme.js. FREE-tier fields only; verdict teased.
//   node _tools/build-products.js            -> ALL products into the repo
//   node _tools/build-products.js --sample   -> SAMPLE_IDS only
//   node _tools/build-products.js --stage    -> write into _staged/ instead
const fs = require("fs");
const path = require("path");
const T = require("./theme");

const ROOT = path.join(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "_data", "catalog-export.json"), "utf8"));
const SITE = T.SITE, APP_STORE = T.APP_STORE, PLAY_STORE = T.PLAY_STORE;
const SAMPLE_IDS = ["NEU-BB-GELCREAM", "LRP-EF-GEL", "CRV-MO-CREAM", "PC-SP-BHA", "BIO-SEN-GEL"];
const sampleOnly = process.argv.includes("--sample");
const staging = process.argv.includes("--stage");
const CONTACT = "contact@mhsbloom.com";
const REG = '<sup class="reg">®</sup>';

const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const plain = (s) => String(s || "").replace(/<[^>]+>/g, "");

// ---- label maps ----
const CAT = { "baby-care": ["Baby care", "عناية بالأطفال"], balm: ["Balm", "بلسم"], "blemish-care": ["Blemish care", "عناية بالحبوب"], "body-care": ["Body care", "عناية بالجسم"], cleanser: ["Cleanser", "غسول"], exfoliant: ["Exfoliant", "مقشّر"], "eye-care": ["Eye care", "عناية بمحيط العين"], fragrance: ["Fragrance", "عطر"], "hair-care": ["Hair care", "عناية بالشعر"], "hand-care": ["Hand care", "عناية باليدين"], "lip-care": ["Lip care", "عناية بالشفاه"], "micellar-cleanser": ["Micellar water", "ماء ميسيلار"], moisturizer: ["Moisturizer", "مرطّب"], "moisturizer-spf": ["Moisturizer with SPF", "مرطّب بعامل حماية"], serum: ["Serum", "سيروم"], sunscreen: ["Sunscreen", "واقي شمس"], toner: ["Toner", "تونر"] };
const TEX = { balm: ["Balm", "بلسم"], bar: ["Bar", "قالب"], cream: ["Cream", "كريم"], fluid: ["Light fluid", "سائل خفيف"], foam: ["Foam", "رغوة"], gel: ["Gel", "جل"], "gel-cream": ["Gel-cream", "جل كريم"], liquid: ["Liquid", "سائل"], lotion: ["Lotion", "لوشن"], oil: ["Oil", "زيت"], ointment: ["Ointment", "مرهم"], serum: ["Serum", "سيروم"], spray: ["Spray", "بخّاخ"] };
const SCENT = { "fragrance-free": ["Fragrance-free", "خالي من العطور"], light: ["Lightly scented", "عطر خفيف"], fresh: ["Fresh scent", "منعش"], warm: ["Warm scent", "دافئ"], floral: ["Floral scent", "زهري"], none: ["", ""] };
const WHEN = { both: ["Morning & night", "صباحًا ومساءً"], morning: ["Morning", "صباحًا"], night: ["Night", "مساءً"] };
const PRICE = { budget: ["Budget", "اقتصادي"], mid: ["Mid-range", "متوسط"], premium: ["Premium", "راقٍ"], splurge: ["Splurge", "فاخر"] };
const CONCERN = { "aging-signs": ["the look of aging", "مظهر التقدّم في السن"], antioxidant: ["antioxidant support", "دعم مضاد الأكسدة"], "baby-care": ["baby care", "عناية بالأطفال"], "barrier-repair": ["skin-barrier support", "دعم حاجز البشرة"], blackheads: ["the look of blackheads", "الرؤوس السوداء"], blemishes: ["blemish-prone skin", "البشرة المعرّضة للحبوب"], "body-care": ["body care", "عناية بالجسم"], "color-protection": ["colour protection", "حماية اللون"], combination: ["combination skin", "البشرة المختلطة"], "dark-circles": ["the look of dark circles", "الهالات الداكنة"], "dark-spots": ["the look of dark spots", "البقع الداكنة"], dehydration: ["dehydrated skin", "نقص الترطيب"], dryness: ["dryness", "الجفاف"], dullness: ["dullness", "البهتان"], "enlarged-pores": ["the look of enlarged pores", "المسام الواسعة"], "fine-lines": ["the look of fine lines", "الخطوط الدقيقة"], frizz: ["frizz", "التجعّد"], "hand-care": ["hand care", "عناية باليدين"], irritation: ["the feel of irritation", "التهيّج"], itching: ["the feel of itching", "الحكة"], "lip-care": ["lip care", "عناية بالشفاه"], "loss-of-firmness": ["the look of firmness", "المرونة"], "makeup-removal": ["makeup removal", "إزالة المكياج"], oiliness: ["oily skin", "الدهون الزائدة"], pollution: ["pollution defence", "التلوّث"], "post-blemish-marks": ["post-blemish marks", "آثار الحبوب"], "post-procedure": ["post-procedure care", "ما بعد الإجراءات"], puffiness: ["the look of puffiness", "الانتفاخ"], recovery: ["skin recovery", "التعافي"], redness: ["the look of redness", "الاحمرار"], "rough-bumps": ["rough, bumpy-feeling skin", "الخشونة"], "scalp-comfort": ["scalp comfort", "راحة فروة الرأس"], sensitivity: ["sensitive skin", "البشرة الحساسة"], "sun-protection": ["sun protection", "الحماية من الشمس"], thinning: ["the look of thinning hair", "خفّة الشعر"], "tired-eyes": ["tired-looking eyes", "إجهاد العين"], "uneven-texture": ["uneven-looking texture", "عدم تجانس الملمس"], "uneven-tone": ["the look of uneven tone", "عدم توحّد اللون"], volume: ["hair volume", "كثافة الشعر"] };
const clabel = (m, k, lang) => (m[k] ? m[k][lang === "en" ? 0 : 1] : String(k || "").replace(/-/g, " "));

// ---- ingredient monograph links ----
const ING = JSON.parse(fs.readFileSync("C:/Users/drmah/MHS-BLOOM-old/_docs/ingredients_v25_ALL.json", "utf8"))
  .filter((r) => r._slug && r._pass !== false && r._status === "founder-revised");
const ALIAS = [["hyaluronic", "sodium-hyaluronate"], ["sodium hyaluronate", "sodium-hyaluronate"], ["niacinamide", "niacinamide"], ["glycerin", "glycerin"], ["tocopherol", "tocopherol"], ["vitamin e", "tocopherol"], ["salicylic", "salicylic-acid"], ["ascorbic", "ascorbic-acid"], ["vitamin c", "ascorbic-acid"], ["ceramide", "ceramide-np"], ["squalane", "squalane"], ["centella", "centella-asiatica-extract"], ["allantoin", "allantoin"], ["panthenol", "panthenol"], ["zinc oxide", "zinc-oxide"], ["azelaic", "azelaic-acid"], ["arbutin", "alpha-arbutin"], ["tranexamic", "tranexamic-acid"], ["bakuchiol", "bakuchiol"], ["urea", "urea"], ["retinaldehyde", "retinal"], ["retinal", "retinal"]];
const ingBySlug = {};
for (const r of ING) ingBySlug[r._slug] = { en: r.commonName_en || r.inci, ar: r.commonName_ar || r.commonName_en || r.inci, blurbEn: (r.whatItDoes_en || "").split(". ")[0], blurbAr: (r.whatItDoes_ar || "").split(". ")[0] };
function ingSlugFor(name) {
  const n = String(name || "").toLowerCase();
  if (/\bretinol\b/.test(n)) return null;
  for (const [a, s] of ALIAS) if (n.includes(a) && ingBySlug[s]) return s;
  return null;
}

// ---- products & slugs ----
const brands = data.filter((b) => b.isActive !== false);
const products = [];
for (const b of brands) for (const p of (b.products || [])) if (p.isActive !== false) products.push({ ...p, _brand: b.brandName, _brandAr: b.brandNameAr || b.brandName });
const seen = {};
const slugify = (s) => String(s).toLowerCase().normalize("NFD").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80).replace(/^-|-$/g, "");
for (const p of products) {
  let s = slugify(p._brand + " " + p.name);
  if (seen[s]) { seen[s]++; s = s + "-" + seen[s]; } else seen[s] = 1;
  p._slug = s;
}
const byBrand = {};
for (const p of products) (byBrand[p._brand] = byBrand[p._brand] || []).push(p);

// ---- gallery SVG hero card ----
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
  const nameLines = wrapName(p.name, 24);
  const nameSize = nameLines.length >= 3 ? 36 : (nameLines.some(l => l.length > 20) ? 41 : 46);
  const serif = "Playfair Display, Amiri, Georgia, serif";
  const sans = "Inter, Tajawal, Arial, sans-serif";
  const chips = (Array.isArray(p.keyIngredients) ? p.keyIngredients : []).slice(0, 3);
  let chipX = 64, chipsSvg = "";
  for (const c of chips) {
    const w = Math.min(9.6 * c.length + 40, 300);
    if (chipX + w > 656) break;
    chipsSvg += `<rect x="${chipX}" y="316" width="${w}" height="46" rx="23" fill="none" stroke="#E5D3B0" stroke-width="1.4"/><text x="${chipX + w / 2}" y="346" text-anchor="middle" font-family="${sans}" font-size="18.5" fill="#8E3D4A" font-weight="600">${xesc(c)}</text>`;
    chipX += w + 12;
  }
  const nameSvg = nameLines.map((l, i) => `<text x="64" y="${196 + i * (nameSize + 12)}" font-family="${serif}" font-size="${nameSize}" font-weight="600" fill="#8E3D4A">${xesc(l)}</text>`).join("");
  const meta = [catL, texL, p.size].filter(Boolean).join("   ·   ");
  return `<svg viewBox="0 0 720 448" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${xesc(p.name)}">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFEFB"/><stop offset="1" stop-color="#FBF4EC"/></linearGradient>
<radialGradient id="blush" cx="0.85" cy="0.12" r="0.5"><stop offset="0" stop-color="#F5E5E7"/><stop offset="1" stop-color="#F5E5E7" stop-opacity="0"/></radialGradient>
</defs>
<rect width="720" height="448" rx="26" fill="url(#bg)"/>
<rect width="720" height="448" rx="26" fill="url(#blush)"/>
<rect x="1" y="1" width="718" height="446" rx="25" fill="none" stroke="#E5D3B0" stroke-width="1.6"/>
<rect x="12" y="12" width="696" height="424" rx="17" fill="none" stroke="#B99256" stroke-opacity="0.32" stroke-width="1"/>
<text x="656" y="76" text-anchor="end" font-size="30" opacity="0.85">🌸</text>
<text x="64" y="88" font-family="${sans}" font-size="20" letter-spacing="7" fill="#B99256" font-weight="700">${xesc(String(brand).toUpperCase())}</text>
<text x="64" y="126" font-family="${sans}" font-size="14.5" letter-spacing="3.5" fill="#93848A" font-weight="600">M H S   B L O O M   ·   ${en ? "D E C O D E D" : "مبسّط"}</text>
${nameSvg}
${chipsSvg}
<line x1="64" y1="394" x2="200" y2="394" stroke="#E5D3B0" stroke-width="1"/>
<text x="64" y="424" font-family="${sans}" font-size="18" letter-spacing="1" fill="#93848A">${xesc(meta)}</text>
</svg>`;
}

// ---- page CSS (on top of theme) ----
const PAGE_CSS = `
.crumb{font-size:12.5px;color:var(--muted);margin-bottom:14px;letter-spacing:.3px;}
.crumb a{color:var(--muted);text-decoration:none;}.crumb a:hover{color:var(--deep);}
.reg{font-size:.55em;vertical-align:super;color:var(--muted);font-weight:400;}
.herocard{margin:20px 0 22px;}
.herocard svg{width:100%;height:auto;display:block;border-radius:26px;box-shadow:var(--sh-l);}
.lede{font-size:17.5px;line-height:1.9;color:#4a3e42;max-width:62ch;}
.ing{list-style:none;display:grid;gap:10px;}
.ing li{background:var(--porcelain);border:1px solid var(--hairline);border-radius:16px;padding:13px 18px;font-size:14.5px;box-shadow:var(--sh-s);transition:transform .2s,box-shadow .2s;}
.ing li:hover{transform:translateY(-2px);box-shadow:var(--sh-m);}
.ing li a{color:var(--deep);font-weight:700;text-decoration:none;border-bottom:1px solid var(--champagne);}
.ing li .bl{display:block;color:var(--muted);font-size:13px;margin-top:3px;line-height:1.7;}
.chips{display:flex;flex-wrap:wrap;gap:9px;}
.glance{display:grid;grid-template-columns:repeat(auto-fit,minmax(146px,1fr));gap:11px;}
.gitem{background:var(--porcelain);border:1px solid var(--hairline);border-radius:16px;padding:13px 17px;box-shadow:var(--sh-s);}
.gitem .k{font-size:10.5px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;font-weight:700;}
.gitem .v{font-size:15.5px;font-weight:700;color:var(--deep);margin-top:3px;}
.gate{margin:34px 0;padding:30px 32px;text-align:center;}
.gate .qlabel{margin-bottom:8px;}
.gate p{font-family:inherit;font-size:16.5px;color:#4a3e42;margin:0 auto 20px;max-width:48ch;line-height:1.85;}
.cta-row{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;}
.rel{font-size:14px;line-height:2.2;}
.rel a{color:var(--deep);text-decoration:none;border-bottom:1px solid var(--champagne);margin-inline-end:14px;white-space:nowrap;}
.rel a:hover{color:var(--rose);}
.disc{font-size:12.5px;color:var(--muted);font-style:italic;margin-top:30px;line-height:1.8;}
.about{background:var(--porcelain);border:1px solid var(--hairline);border-radius:18px;padding:18px 22px;margin-top:18px;font-size:12.5px;color:var(--muted);line-height:1.85;box-shadow:var(--sh-s);}
.about b{color:var(--deep);}.about a{color:var(--deep);}
`;

function plaque(txt) { return `<div class="plaque rv"><span>${txt}</span></div>`; }

function productPage(p, lang) {
  const en = lang === "en";
  const dir = en ? "ltr" : "rtl";
  const brand = en ? p._brand : p._brandAr;
  const brandR = esc(brand) + REG;
  const catL = clabel(CAT, p.categoryId, lang);
  const canonical = en ? `${SITE}/products/${p._slug}/` : `${SITE}/ar/products/${p._slug}/`;
  const altHref = en ? `${SITE}/ar/products/${p._slug}/` : `${SITE}/products/${p._slug}/`;
  const line = p.line && p.line !== p.name ? p.line : "";
  const skin = (p.skinType && (en ? p.skinType.en : p.skinType.ar)) || "";
  const texL = clabel(TEX, p.texture, lang);
  const scentL = clabel(SCENT, p.scentProfile, lang);

  const lede = en
    ? `${esc(p.name)} is a ${esc(catL.toLowerCase())} by ${brandR}${line ? `, part of the ${esc(line)} range` : ""}. It has a ${esc(texL.toLowerCase())} texture${p.scentProfile !== "none" ? ` and is ${esc(scentL.toLowerCase())}` : ""}${p.size ? `, in a ${esc(p.size)} size` : ""}.`
    : `${esc(p.name)} هو ${esc(catL)} من ${brandR}${line ? `، ضمن مجموعة ${esc(line)}` : ""}. قوامه ${esc(texL)}${p.scentProfile !== "none" ? ` و${esc(scentL)}` : ""}${p.size ? `، بحجم ${esc(p.size)}` : ""}.`;
  const ledeDesc = plain(lede).replace(/®/g, "").replace(/\s+/g, " ").trim();

  const L = en
    ? { kicker: "PRODUCT · DECODED", home: "Home", prods: "Products", ings: "KEY INGREDIENTS", suited: "BEST SUITED TO", focus: "FOCUS AREAS", glance: "AT A GLANCE", format: "Format", scent: "Fragrance", size: "Size", use: "When", price: "Tier", from: "MORE FROM", inapp: "INSIDE THE APP", cap1: "Every product decoded — ingredients, skin fit, format", cap2: "BLOOM's verdict: should you actually buy it?", gateLabel: "BLOOM'S VERDICT", gate: `Is ${p.name} right for YOUR skin? The full verdict — and how it compares and fits your routine — lives in the app.`, get: "Get MHS BLOOM", alt: "Also on Android", disc: "This page describes catalogued attributes of the product for reference; it is not an efficacy or safety claim, and not medical advice. Ingredient details follow the manufacturer's packaging.", }
    : { kicker: "منتج · مبسّط", home: "الرئيسية", prods: "المنتجات", ings: "المكونات الرئيسية", suited: "الأنسب لـ", focus: "مجالات التركيز", glance: "لمحة سريعة", format: "القوام", scent: "الرائحة", size: "الحجم", use: "الوقت", price: "الفئة", from: "المزيد من", inapp: "جوّه التطبيق", cap1: "كل منتج مبسّط — المكونات وملاءمة البشرة والقوام", cap2: "حكم بلوم: تشتريه فعلًا ولا لأ؟", gateLabel: "حكم بلوم", gate: `هل ${p.name} يناسب بشرتك إنتي؟ الحكم الكامل — وإزاي يقارن ويدخل روتينك — جوّه التطبيق.`, get: "حمّلي MHS BLOOM", alt: "متاح على أندرويد", disc: "الصفحة دي بتوصف خصائص المنتج المُدرجة للمرجع؛ وليست ادعاء فعالية أو أمان، ولا نصيحة طبية. معلومات المكونات تتبع عبوة الشركة المصنّعة.", };

  const about = en
    ? `<b>About this page.</b> MHS BLOOM is an <b>independent</b> skincare reference. This is an independent editorial review for identification and reference only — we are <b>not affiliated with, authorised by, endorsed by, or sponsored by</b> ${esc(brand)} or any brand or manufacturer, and no brand can pay to change a rating. All brand and product names are the trademarks or registered trademarks of their respective owners, used here for identification purposes only. Ingredient details follow the manufacturer's packaging and may change — always check the product's own label. Questions, corrections or complaints: <a href="mailto:${CONTACT}?subject=MHS%20BLOOM%20—%20${encodeURIComponent(p.name)}">${CONTACT}</a>.`
    : `<b>عن هذه الصفحة.</b> MHS BLOOM مرجع <b>مستقل</b> للعناية بالبشرة. وهذه مراجعة تحريرية مستقلة لغرض التعريف والاسترشاد فقط — <b>لسنا تابعين لأي علامة أو شركة مصنّعة ولا مرخّصين أو مموّلين منها</b> (بما فيها ${esc(brand)})، ولا يمكن لأي علامة أن تدفع لتغيير تقييم. جميع أسماء العلامات والمنتجات علامات تجارية أو علامات تجارية مسجّلة تعود لأصحابها، وتُستخدم هنا لغرض التعريف فقط. معلومات المكونات تتبع عبوة الشركة المصنّعة وقد تتغيّر — راجعي دائمًا ملصق المنتج نفسه. للاستفسارات أو التصحيحات أو الشكاوى: <a href="mailto:${CONTACT}?subject=MHS%20BLOOM%20—%20${encodeURIComponent(p.name)}">${CONTACT}</a>.`;

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

  const concerns = (Array.isArray(p.skinConcerns) ? p.skinConcerns : []).map((c) => `<span class="chip fill">${esc(clabel(CONCERN, c, lang))}</span>`).join("");
  const related = (byBrand[p._brand] || []).filter((x) => x._slug !== p._slug).slice(0, 5)
    .map((x) => `<a href="${en ? SITE + "/products/" + x._slug + "/" : SITE + "/ar/products/" + x._slug + "/"}">${esc(x.name)}</a>`).join(" ");

  const body = `
${T.nav(lang, altHref)}
<div class="wrap">
<div class="crumb rv in"><a href="${en ? SITE + "/" : SITE + "/ar/"}">${L.home}</a> › <a href="${en ? SITE + "/products/" : SITE + "/ar/products/"}">${L.prods}</a> › ${brandR}</div>
<div class="plaque rv in"><span>${L.kicker}</span></div>
<h1 class="rv in">${esc(p.name)}</h1>
<div class="herocard rv in">${svgCard(p, lang)}</div>
<p class="lede rv">${lede}</p>
${kis ? `${plaque(L.ings)}<ul class="ing rv">${kis}</ul>` : ""}
${skin ? `${plaque(L.suited)}<p class="rv">${esc(skin)}</p>` : ""}
${concerns ? `${plaque(L.focus)}<div class="chips rv">${concerns}</div>` : ""}
${plaque(L.glance)}
<div class="glance rv">
<div class="gitem"><div class="k">${L.format}</div><div class="v">${esc(texL)}</div></div>
${p.scentProfile !== "none" ? `<div class="gitem"><div class="k">${L.scent}</div><div class="v">${esc(scentL)}</div></div>` : ""}
${p.size ? `<div class="gitem"><div class="k">${L.size}</div><div class="v">${esc(p.size)}</div></div>` : ""}
${p.whenToUse ? `<div class="gitem"><div class="k">${L.use}</div><div class="v">${esc(clabel(WHEN, p.whenToUse, lang))}</div></div>` : ""}
${p.priceRange ? `<div class="gitem"><div class="k">${L.price}</div><div class="v">${esc(clabel(PRICE, p.priceRange, lang))}</div></div>` : ""}
</div>
${plaque(L.inapp)}
<div class="phones rv">
<div><div class="phone"><img src="${SITE}/assets/app-product.png" alt="MHS BLOOM app — product decoded" loading="lazy" width="640" height="1137"></div><div class="phone-cap">${esc(L.cap1)}</div></div>
<div><div class="phone"><img src="${SITE}/assets/app-verdict.png" alt="MHS BLOOM app — BLOOM's verdict" loading="lazy" width="640" height="1137"></div><div class="phone-cap">${esc(L.cap2)}</div></div>
</div>
<div class="quote gate rv">
<span class="qmark">"</span>
<div class="qlabel">🌸 ${L.gateLabel}</div>
<p>${esc(L.gate)}</p>
<div class="cta-row"><a class="btn" href="${APP_STORE}">${L.get}</a><a class="btn ghost" href="${PLAY_STORE}">${L.alt}</a></div>
</div>
${related ? `${plaque(L.from + " " + esc(String(brand).toUpperCase()))}<div class="rel rv">${related}</div>` : ""}
<div class="disc rv">${esc(L.disc)}</div>
<div class="about rv">${about}</div>
</div>
${T.footer(lang)}
${T.REVEAL_JS}`;

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
<link rel="alternate" hreflang="x-default" href="${en ? canonical : altHref}">
<meta property="og:title" content="${esc(p.name)} — ${esc(brand)}">
<meta property="og:description" content="${esc(ledeDesc).slice(0, 155)}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="MHS BLOOM">
${T.FONTS}
<style>${T.css(lang)}${PAGE_CSS}</style>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>${body}</body></html>`;
}

// ---- run ----
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
if (!sampleOnly) {
  const meta = products.map((p) => ({ id: p.id, slug: p._slug, brand: p._brand, brandAr: p._brandAr, name: p.name, category: p.categoryId }));
  fs.writeFileSync(path.join(ROOT, "_data", "product-meta.json"), JSON.stringify(meta), "utf8");
}
console.log(`generated ${n} product pages (${targets.length} x 2)${sampleOnly ? " [SAMPLE]" : ""}${staging ? " -> _staged/" : ""}`);
if (sampleOnly) targets.forEach((p) => console.log(`  ${SITE}/products/${p._slug}/`));
