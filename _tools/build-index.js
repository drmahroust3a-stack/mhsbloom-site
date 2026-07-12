// /products/ index — GALLERY EDITION: live search + brand navigation, museum styling.
const fs = require("fs");
const path = require("path");
const T = require("./theme");
const ROOT = path.join(__dirname, "..");
const SITE = T.SITE;
const meta = JSON.parse(fs.readFileSync(path.join(ROOT, "_data", "product-meta.json"), "utf8"));
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CATL = { "baby-care": ["Baby care", "عناية بالأطفال"], balm: ["Balm", "بلسم"], "blemish-care": ["Blemish care", "عناية بالحبوب"], "body-care": ["Body care", "عناية بالجسم"], cleanser: ["Cleanser", "غسول"], exfoliant: ["Exfoliant", "مقشّر"], "eye-care": ["Eye care", "عناية بالعين"], fragrance: ["Fragrance", "عطر"], "hair-care": ["Hair care", "عناية بالشعر"], "hand-care": ["Hand care", "عناية باليدين"], "lip-care": ["Lip care", "عناية بالشفاه"], "micellar-cleanser": ["Micellar water", "ماء ميسيلار"], moisturizer: ["Moisturizer", "مرطّب"], "moisturizer-spf": ["Moisturizer SPF", "مرطّب بحماية"], serum: ["Serum", "سيروم"], sunscreen: ["Sunscreen", "واقي شمس"], toner: ["Toner", "تونر"] };
const cat = (k, lang) => (CATL[k] ? CATL[k][lang === "en" ? 0 : 1] : k);

const PAGE_CSS = `
.wrap{max-width:880px;}
.searchbox{position:sticky;top:64px;z-index:40;padding:12px 0 10px;background:linear-gradient(180deg,var(--cream) 78%,transparent);}
#q{width:100%;padding:17px 26px;border:1px solid var(--champagne);border-radius:18px;font-family:inherit;font-size:16px;background:var(--porcelain);outline:none;box-shadow:var(--sh-m);transition:box-shadow .2s,border-color .2s;}
#q:focus{border-color:var(--rose);box-shadow:var(--sh-l);}
.count{font-size:12.5px;color:var(--muted);margin-top:8px;letter-spacing:.3px;}
.brandnav{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 10px;}
.brandnav a{font-size:12.5px;font-weight:600;background:var(--porcelain);border:1px solid var(--hairline);border-radius:999px;padding:6px 15px;text-decoration:none;color:var(--soft);transition:all .18s;}
.brandnav a:hover{border-color:var(--champagne);background:var(--gold-wash);color:var(--deep);}
h2.bh{font-family:inherit;scroll-margin-top:150px;display:flex;align-items:center;gap:14px;margin:36px 0 14px;}
h2.bh span{font-family:var(--dispfont);font-size:22px;color:var(--deep);white-space:nowrap;}
h2.bh::after{content:'';height:1px;flex:1;background:linear-gradient(90deg,var(--champagne),transparent);}
h2.bh sup{font-size:.55em;color:var(--muted);}
.pl{display:grid;gap:9px;}
.pl a{display:flex;justify-content:space-between;align-items:center;gap:12px;background:var(--porcelain);border:1px solid var(--hairline);border-radius:15px;padding:13px 19px;text-decoration:none;color:var(--ink);box-shadow:var(--sh-s);transition:transform .18s,box-shadow .18s,border-color .18s;}
.pl a:hover{transform:translateY(-2px);box-shadow:var(--sh-m);border-color:var(--champagne);}
.pl .nm{font-weight:600;font-size:14.5px;letter-spacing:.1px;}
.pl .ct{flex-shrink:0;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--gold);background:var(--gold-wash);border:1px solid var(--champagne);border-radius:999px;padding:4px 13px;}
.hidden{display:none!important;}
#none{color:var(--muted);text-align:center;padding:40px 0;}
`;

function build(lang) {
  const en = lang === "en";
  const canonical = en ? `${SITE}/products/` : `${SITE}/ar/products/`;
  const altHref = en ? `${SITE}/ar/products/` : `${SITE}/products/`;
  const dispfont = en ? "'Playfair Display',Georgia,serif" : "'Amiri',serif";
  const L = en
    ? { over: "THE REFERENCE", t: "Products, decoded", s: `${meta.length.toLocaleString()} skincare products — every claim sourced, no brand can pay to change a rating. Search by product, brand or ingredient.`, ph: "Search 1,682 products… (e.g. CeraVe, niacinamide, sunscreen)", cnt: "products shown", none: "No products match — try another word." }
    : { over: "المرجع", t: "المنتجات، مفكوكة", s: `${meta.length.toLocaleString()} منتج عناية بالبشرة — كل معلومة بمصدرها، ولا براند يقدر يدفع يغيّر تقييم. دوّري بالمنتج أو البراند أو المكوّن.`, ph: "دوّري في ١٦٨٢ منتج… (مثلاً CeraVe أو نياسيناميد)", cnt: "منتج ظاهر", none: "مفيش منتجات مطابقة — جرّبي كلمة تانية." };

  const groups = {};
  for (const p of meta) (groups[p.brand] = groups[p.brand] || []).push(p);
  const brandsSorted = Object.keys(groups).sort();
  const anchor = (b) => b.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const nav = brandsSorted.map((b) => `<a href="#${anchor(b)}">${esc(b)} · ${groups[b].length}</a>`).join("");
  let body = "";
  for (const b of brandsSorted) {
    const rows = groups[b].sort((a, c) => a.name.localeCompare(c.name)).map((p) =>
      `<a href="${en ? SITE + "/products/" + p.slug + "/" : SITE + "/ar/products/" + p.slug + "/"}" data-s="${esc((p.brand + " " + p.name + " " + p.category).toLowerCase())}"><span class="nm">${esc(p.name)}</span><span class="ct">${esc(cat(p.category, lang))}</span></a>`
    ).join("\n");
    body += `<h2 class="bh" id="${anchor(b)}" data-brand><span style="font-family:${dispfont}">${esc(en ? b : (groups[b][0].brandAr || b))}<sup>®</sup></span></h2><div class="pl">${rows}</div>`;
  }
  const jsonld = { "@context": "https://schema.org", "@type": "CollectionPage", inLanguage: lang, name: L.t, url: canonical, isPartOf: { "@type": "WebSite", name: "MHS BLOOM", url: SITE } };

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${en ? "ltr" : "rtl"}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(L.t)} | MHS BLOOM</title><meta name="description" content="${esc(L.s)}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="${lang}" href="${canonical}">
<link rel="alternate" hreflang="${en ? "ar" : "en"}" href="${altHref}">
<link rel="alternate" hreflang="x-default" href="${en ? canonical : altHref}">
${T.FONTS}
<style>${T.css(lang)}${PAGE_CSS}</style>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script></head>
<body>
${T.nav(lang, altHref)}
<div class="wrap">
<div class="plaque"><span>${L.over}</span></div>
<h1>${esc(L.t)}</h1>
<div class="sub">${esc(L.s)}</div>
<div class="searchbox"><input id="q" type="search" placeholder="${esc(L.ph)}" autocomplete="off"><div class="count"><span id="n">${meta.length.toLocaleString()}</span> ${L.cnt}</div></div>
<div class="brandnav" id="bnav">${nav}</div>
<div id="list">${body}</div>
<p id="none" class="hidden">${esc(L.none)}</p>
</div>
${T.footer(lang)}
<script>
(function(){
  var q=document.getElementById('q'), rows=[].slice.call(document.querySelectorAll('.pl a')), heads=[].slice.call(document.querySelectorAll('[data-brand]')), n=document.getElementById('n'), none=document.getElementById('none'), bnav=document.getElementById('bnav');
  q.addEventListener('input', function(){
    var v=(q.value||'').toLowerCase().trim(), shown=0;
    rows.forEach(function(r){ var hit=!v||r.getAttribute('data-s').indexOf(v)>-1; r.classList.toggle('hidden',!hit); if(hit)shown++; });
    heads.forEach(function(h){ var pl=h.nextElementSibling; var any=pl && [].slice.call(pl.children).some(function(c){return !c.classList.contains('hidden');}); h.classList.toggle('hidden',!any); });
    n.textContent=shown.toLocaleString(); none.classList.toggle('hidden',shown!==0); bnav.classList.toggle('hidden',!!v);
  });
})();
</script>
</body></html>`;
}

fs.writeFileSync(path.join(ROOT, "products", "index.html"), build("en"), "utf8");
fs.writeFileSync(path.join(ROOT, "ar", "products", "index.html"), build("ar"), "utf8");
console.log("gallery index rebuilt (EN+AR).");
