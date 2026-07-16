// ============================================================
// build-checker.js — the free "Ingredient Whisperer" client-side tool
// /ingredient-checker/ (EN) + /ar/ingredient-checker/ (AR)
// Paste an ingredient list (INCI) → neutral flags + links to our
// published monographs → routes to the app for the photo scan.
// 100% client-side: the 19 approved ingredients are baked into the page.
// NEUTRAL: free-tier facts only (whatItDoes), never dose/MoA/verdict.
// ============================================================
const fs = require("fs");
const path = require("path");
const T = require("./theme");

const ROOT = path.join(__dirname, "..");
const SITE = T.SITE;

// approved, founder-reviewed ingredient corpus (free plain-language "what it does" only)
const corpus = require(path.join(ROOT, "_data", "corpus-compact.json"));

// ---- matching aliases so the checker recognises common INCI variants ----
const ALIASES = {
  niacinamide: ["niacinamide", "nicotinamide", "vitamin b3", "نياسيناميد", "نيكوتيناميد"],
  "ascorbic-acid": ["ascorbic acid", "vitamin c", "l-ascorbic", "sodium ascorbyl", "ascorbyl", "فيتامين سي", "أسكوربيك"],
  "salicylic-acid": ["salicylic acid", "bha", "beta hydroxy", "ساليسيليك", "ساليسيليك"],
  "azelaic-acid": ["azelaic", "أزيلايك", "أزيليك"],
  retinal: ["retinal", "retinaldehyde", "retinol", "retinyl", "ريتينال", "ريتينول"],
  bakuchiol: ["bakuchiol", "باكوتشيول", "باكوشيول"],
  "alpha-arbutin": ["arbutin", "أربوتين", "ألفا أربوتين"],
  "tranexamic-acid": ["tranexamic", "ترانيكساميك", "ترانيكساميك أسيد"],
  "sodium-hyaluronate": ["hyaluronic", "hyaluronate", "sodium hyaluronate", "هيالورونيك", "هيالورونات"],
  glycerin: ["glycerin", "glycerine", "glycerol", "جليسرين", "غليسيرين"],
  panthenol: ["panthenol", "provitamin b5", "بانثينول", "بروفيتامين"],
  "ceramide-np": ["ceramide", "سيراميد"],
  squalane: ["squalane", "squalene", "سكوالان", "سكوالين"],
  "centella-asiatica-extract": ["centella", "cica", "asiatica", "سنتيلا", "سيكا"],
  allantoin: ["allantoin", "ألانتوين"],
  tocopherol: ["tocopherol", "vitamin e", "توكوفيرول", "فيتامين هـ", "فيتامين اي"],
  urea: ["urea", "يوريا"],
  "zinc-oxide": ["zinc oxide", "أكسيد الزنك", "زنك"],
  "butyl-methoxydibenzoylmethane": ["avobenzone", "butyl methoxydibenzoylmethane", "أفوبنزون"],
};

// ---- non-corpus flags the checker can still surface neutrally ----
const FRAGRANCE = ["fragrance", "parfum", "perfume", "linalool", "limonene", "citronellol", "geraniol", "عطر", "برفان"];
const ALCOHOL = ["alcohol denat", "denatured alcohol", "sd alcohol", "ethanol", "كحول"];
const ESSENTIAL_OILS = ["essential oil", "lavender oil", "tea tree", "peppermint oil", "eucalyptus", "citrus oil", "زيت عطري", "لافندر"];

const strip = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[ً-ٰٟ]/g, "").trim();

function build(lang) {
  const en = lang === "en";
  const dir = en ? "ltr" : "rtl";
  const canonical = `${SITE}/${en ? "" : "ar/"}ingredient-checker/`;
  const altHref = `${SITE}/${en ? "ar/" : ""}ingredient-checker/`;

  // ship a compact JSON of the corpus + aliases + flag lists to the client
  const clientData = {
    ing: corpus.map((c) => ({
      slug: c.slug,
      name: en ? c.name_en : c.name_ar,
      does: en ? c.whatItDoes_en : c.whatItDoes_ar,
      aliases: ALIASES[c.slug] || [c.name_en.toLowerCase()],
    })),
    fragrance: FRAGRANCE,
    alcohol: ALCOHOL,
    oils: ESSENTIAL_OILS,
  };

  const t = en
    ? {
        title: "Ingredient Checker — MHS BLOOM",
        h1: "Ingredient Checker",
        lede: "Paste any product's ingredient list. We'll flag what we recognise — in plain language, with sources — then you can scan the real packaging in the app for your skin.",
        ph: "Paste the ingredient list (INCI) or a few ingredient names…",
        btn: "Check ingredients",
        recognised: "What we recognise",
        heads: "Worth noting",
        none: "We didn't recognise specific ingredients from our reference here. Paste the full INCI list, or scan the product in the app for a full read.",
        fragLabel: "Contains fragrance / scent components",
        alcLabel: "Contains drying alcohol",
        oilLabel: "Contains essential oils (can irritate sensitive skin)",
        learn: "Read the full monograph →",
        surface: "This is a surface-level check on names only. For the real front-of-pack photo scan, your exact skin profile, and better-fit alternatives at every price:",
        get: "Open MHS BLOOM — free",
        appStore: "App Store",
        play: "Google Play",
        disc: "A cosmetic reference, not medical advice. For any skin condition, please see a specialist.",
      }
    : {
        title: "فاحص المكوّنات — MHS BLOOM",
        h1: "فاحص المكوّنات",
        lede: "الصقي قائمة مكوّنات أي منتج. هنوضّحلك اللي نعرفه — بلغة بسيطة وبمصادر — وبعدها تقدري تصوّري العبوة الحقيقية في التطبيق حسب بشرتك.",
        ph: "الصقي قائمة المكوّنات (INCI) أو أسماء بعض المكوّنات…",
        btn: "افحصي المكوّنات",
        recognised: "المكوّنات اللي نعرفها",
        heads: "أشياء تستحق الانتباه",
        none: "ما عرفناش مكوّنات محدّدة من مرجعنا هنا. الصقي قائمة INCI كاملة، أو صوّري المنتج في التطبيق لقراءة كاملة.",
        fragLabel: "يحتوي على عطور / مكوّنات معطّرة",
        alcLabel: "يحتوي على كحول مجفّف",
        oilLabel: "يحتوي على زيوت عطرية (قد تهيّج البشرة الحساسة)",
        learn: "اقرئي الملف الكامل ←",
        surface: "ده فحص سطحي على الأسماء فقط. للتعرّف الحقيقي بصورة العبوة، وملف بشرتك بالضبط، والبدائل الأنسب في كل فئة سعرية:",
        get: "افتحي MHS BLOOM — مجانًا",
        appStore: "App Store",
        play: "Google Play",
        disc: "مرجع تجميلي، وليس نصيحة طبية. لأي حالة جلدية، يُرجى استشارة مختص.",
      };

  const ingHref = (slug) => `${SITE}/${en ? "" : "ar/"}ingredients/${slug}/`;

  const jsonld = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t.title,
    url: canonical,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    inLanguage: lang,
    isPartOf: { "@type": "WebSite", name: "MHS BLOOM", url: SITE },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${t.title}</title>
<meta name="description" content="${en ? "Free neutral ingredient checker — paste any skincare product's ingredient list and see what we recognise, with sources. From the independent MHS BLOOM reference." : "فاحص مكوّنات مجاني ومحايد — الصقي قائمة مكوّنات أي منتج عناية وشوفي اللي نعرفه بمصادره، من مرجع MHS BLOOM المستقل."}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="${lang}" href="${canonical}">
<link rel="alternate" hreflang="${en ? "ar" : "en"}" href="${altHref}">
<link rel="alternate" hreflang="x-default" href="${en ? canonical : altHref}">
<meta property="og:title" content="${t.title}">
<meta property="og:url" content="${canonical}">
<meta property="og:site_name" content="MHS BLOOM">
${T.FONTS}
<style>${T.css(lang)}
.ck-wrap{max-width:720px;margin:0 auto;padding:8px 18px 60px}
.ck-lede{color:var(--ink-soft);font-size:1.02rem;line-height:1.9;margin-bottom:20px}
.ck-box{width:100%;min-height:130px;border:1px solid var(--line);border-radius:16px;padding:16px;font-family:inherit;font-size:1rem;background:var(--ivory2);color:var(--ink);line-height:1.8;resize:vertical}
.ck-box:focus{outline:none;border-color:var(--gold)}
.ck-btn{margin-top:12px;background:var(--ink);color:var(--ivory);border:none;border-radius:999px;padding:14px 30px;font-family:inherit;font-weight:700;font-size:1rem;cursor:pointer;letter-spacing:.3px}
.ck-btn:hover{opacity:.9}
.ck-out{margin-top:26px}
.ck-sec{font-family:var(--serif);font-size:1.3rem;margin:22px 0 12px}
.ck-card{background:var(--ivory2);border:1px solid var(--line-soft);border-radius:14px;padding:15px 18px;margin-bottom:11px}
.ck-card .cn{font-family:var(--serif);font-size:1.12rem;color:var(--ink)}
.ck-card .cd{color:var(--ink-soft);font-size:.95rem;line-height:1.75;margin-top:4px}
.ck-card a.ml{display:inline-block;margin-top:8px;color:var(--gold);font-weight:700;font-size:.9rem;text-decoration:none;border-bottom:1px solid var(--gold)}
.ck-flag{display:flex;gap:9px;align-items:flex-start;background:rgba(184,151,90,.09);border:1px solid rgba(184,151,90,.35);border-radius:12px;padding:11px 15px;margin-bottom:9px;font-size:.95rem;color:#6d5a31}
.ck-flag b{color:#5a4a26}
.ck-none{color:var(--ink-soft);background:var(--ivory2);border:1px dashed var(--line);border-radius:12px;padding:16px 18px;font-size:.96rem}
.ck-cta{margin-top:34px;background:var(--ink);color:var(--ivory);border-radius:18px;padding:24px 26px;text-align:center}
.ck-cta p{color:#cfc7b5;font-size:.98rem;line-height:1.8;margin-bottom:16px}
.ck-cta .row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.ck-cta .b{background:var(--gold);color:var(--ink);border-radius:999px;padding:11px 26px;font-weight:700;text-decoration:none;font-size:.95rem}
.ck-cta .b.ghost{background:transparent;color:var(--ivory);border:1px solid rgba(255,255,255,.4)}
.ck-disc{color:var(--ink-faint);font-size:.85rem;margin-top:26px;text-align:center;line-height:1.7}
</style>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>
${T.nav(lang, "checker")}
<main class="ck-wrap">
  <h1 style="font-family:var(--serif);font-size:2rem;margin:14px 0 10px">${t.h1}</h1>
  <p class="ck-lede">${t.lede}</p>
  <textarea id="ckin" class="ck-box" placeholder="${t.ph}"></textarea>
  <div><button id="ckgo" class="ck-btn">${t.btn}</button></div>
  <div id="ckout" class="ck-out"></div>
</main>
${T.footer(lang)}
<script>
const DATA = ${JSON.stringify(clientData)};
const TX = ${JSON.stringify({
    recognised: t.recognised,
    heads: t.heads,
    none: t.none,
    fragLabel: t.fragLabel,
    alcLabel: t.alcLabel,
    oilLabel: t.oilLabel,
    learn: t.learn,
    surface: t.surface,
    get: t.get,
    appStore: t.appStore,
    play: t.play,
    disc: t.disc,
  })};
const APP={apple:${JSON.stringify(T.APP_STORE)},play:${JSON.stringify(T.PLAY_STORE)}};
const ING_BASE=${JSON.stringify(`${SITE}/${en ? "" : "ar/"}ingredients/`)};
function strip(s){return (s||"").toLowerCase().normalize("NFKD").replace(/[\\u064b-\\u065f\\u0670]/g,"").trim();}
function esc(s){return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;");}
function check(){
  const raw=document.getElementById("ckin").value; const hay=strip(raw);
  if(!hay.trim()){document.getElementById("ckout").innerHTML="";return;}
  const found=[]; const seen=new Set();
  for(const ing of DATA.ing){
    for(const a of ing.aliases){ if(hay.includes(strip(a))){ if(!seen.has(ing.slug)){seen.add(ing.slug);found.push(ing);} break; } }
  }
  const flags=[];
  if(DATA.fragrance.some(f=>hay.includes(strip(f)))) flags.push(TX.fragLabel);
  if(DATA.alcohol.some(f=>hay.includes(strip(f)))) flags.push(TX.alcLabel);
  if(DATA.oils.some(f=>hay.includes(strip(f)))) flags.push(TX.oilLabel);
  let html="";
  if(found.length){
    html+='<div class="ck-sec">'+TX.recognised+'</div>';
    for(const f of found){
      html+='<div class="ck-card"><div class="cn">'+esc(f.name)+'</div><div class="cd">'+esc(f.does||"")+'</div>'
        +'<a class="ml" href="'+ING_BASE+f.slug+'/">'+TX.learn+'</a></div>';
    }
  }
  if(flags.length){
    html+='<div class="ck-sec">'+TX.heads+'</div>';
    for(const fl of flags) html+='<div class="ck-flag"><span>◈</span><span>'+esc(fl)+'</span></div>';
  }
  if(!found.length && !flags.length){ html+='<div class="ck-none">'+TX.none+'</div>'; }
  html+='<div class="ck-cta"><p>'+TX.surface+'</p><div class="row">'
    +'<a class="b" href="'+APP.apple+'">'+TX.appStore+'</a>'
    +'<a class="b" href="'+APP.play+'">'+TX.play+'</a></div></div>';
  html+='<div class="ck-disc">'+TX.disc+'</div>';
  document.getElementById("ckout").innerHTML=html;
  document.getElementById("ckout").scrollIntoView({behavior:"smooth",block:"start"});
}
document.getElementById("ckgo").addEventListener("click",check);
document.getElementById("ckin").addEventListener("keydown",e=>{ if(e.key==="Enter"&&(e.metaKey||e.ctrlKey)) check(); });
</script>
</body>
</html>`;
}

for (const lang of ["en", "ar"]) {
  const dir = lang === "en" ? path.join(ROOT, "ingredient-checker") : path.join(ROOT, "ar", "ingredient-checker");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), build(lang), "utf8");
  console.log("wrote", lang, "→", path.relative(ROOT, path.join(dir, "index.html")));
}
